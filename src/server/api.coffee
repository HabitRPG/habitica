# @see ./routes.coffee for routing

_ = require 'lodash'
async = require 'async'
algos = require 'habitrpg-shared/script/algos'
helpers = require 'habitrpg-shared/script/helpers'
validator = require 'derby-auth/node_modules/validator'
check = validator.check
sanitize = validator.sanitize
utils = require 'derby-auth/utils'
misc = require '../app/misc'

api = module.exports

###
  ------------------------------------------------------------------------
  Misc
  ------------------------------------------------------------------------
####

NO_TOKEN_OR_UID = err: "You must include a token and uid (user id) in your request"
NO_USER_FOUND = err: "No user found."

###
  beforeEach auth interceptor
###
api.auth = (req, res, next) ->
  uid = req.headers['x-api-user']
  token = req.headers['x-api-key']
  return res.json 401, NO_TOKEN_OR_UID unless uid and token

  model = req.getModel()
  query = model.query('users').withIdAndToken(uid, token)

  query.fetch (err, user) ->
    return res.json err: err if err
    (req.habit ?= {}).user = user
    return res.json 401, NO_USER_FOUND if _.isEmpty(user.get())
    req._isServer = true
    next()

###
  ------------------------------------------------------------------------
  Tasks
  ------------------------------------------------------------------------
###

addTask = (user, task, cb) ->
  task.type ?= 'habit'
  tid = user.add "tasks", task, ->
    ids = user.get "#{task.type}Ids"
    ids.unshift tid
    user.set "#{task.type}Ids", ids, cb

deleteTask = (user, task, cb) ->
  user.del "tasks.#{task.id}", ->
    taskIds = user.get "#{task.type}Ids"
    user.remove "#{task.type}Ids", taskIds.indexOf(task.id), 1, cb

score = (model, user, taskId, direction, done) ->
  delta = 0
  misc.batchTxn model, (uObj, paths) ->
    tObj = uObj.tasks[taskId]
    delta = algos.score(uObj, tObj, direction, {paths})
  #, {user, done}
  , {user, done}
  delta

###
  This is called form deprecated.coffee's score function, and the req.headers are setup properly to handle the login
  Export it also so we can call it from deprecated.coffee
###
api.scoreTask = (req, res, next) ->
  {id, direction} = req.params
  {title, service, type} = req.body
  type ||= 'habit'

  # Send error responses for improper API call
  return res.json 500, {err: ':id required'} unless id
  return res.json 500, {err: ":direction must be 'up' or 'down'"} unless direction in ['up','down']

  {user} = req.habit

  done = ->
    # TODO - could modify batchTxn to conform to this better
    delta = score req.getModel(), user, id, direction, ->
      result = user.get('stats')
      req.habit.result = data: _.extend(result, delta: delta)
      next()

  # Set completed if type is daily or todo and task exists
  if (existing = user.at "tasks.#{id}").get()
    if existing.get('type') in ['daily', 'todo']
      existing.set 'completed', (direction is 'up'), done
    else done()

  # If it doesn't exist, this is likely a 3rd party up/down - create a new one
  else
    task = {id, type, value: 0}
    task.text = title or id
    task.notes = "This task was created by a third-party service. Feel free to edit, it won't harm the connection to that service. Additionally, multiple services may piggy-back off this task."
    if type is 'habit'
      task.up = true
      task.down = true
    if type in ['daily', 'todo']
      task.completed = direction is 'up'
    addTask user, task, done

###
  Get all tasks
###
api.getTasks = (req, res, next) ->
  types =
    if /^(habit|todo|daily|reward)$/.test(req.query.type) then [req.query.type]
    else ['habit','todo','daily','reward']
  tasks = _.toArray (_.filter req.habit.user.get('tasks'), (t)-> t.type in types)
  req.habit.result = data: tasks
  next()

###
  Get Task
###
api.getTask = (req, res, next) ->
  task = req.habit.user.get "tasks.#{req.params.id}"
  return res.json 400, err: "No task found." if !task || _.isEmpty(task)
  req.habit.result = data: task
  next()

###
  Validate task
###
api.validateTask = (req, res, next) ->
  task = {}
  newTask = { type, text, notes, value, up, down, completed } = req.body

  # If we're updating, get the task from the user
  if req.method is 'PUT' or req.method is 'DELETE'
    task = req.habit.user.get "tasks.#{req.params.id}"
    return res.json 400, err: "No task found." if !task || _.isEmpty(task)
    # Strip for now
    type = undefined
    delete newTask.type
  else if req.method is 'POST'
    newTask.value = sanitize(value).toInt()
    newTask.value = 0 if isNaN newTask.value
    unless /^(habit|todo|daily|reward)$/.test type
      return res.json 400, err: 'type must be habit, todo, daily, or reward'

  newTask.text = sanitize(text).xss() if typeof text is "string"
  newTask.notes = sanitize(notes).xss() if typeof notes is "string"

  switch type
    when 'habit'
      newTask.up = true unless typeof up is 'boolean'
      newTask.down = true unless typeof down is 'boolean'
    when 'daily', 'todo'
      newTask.completed = false unless typeof completed is 'boolean'

  _.extend task, newTask
  req.habit.task = task
  next()

###
  Delete Task
###
api.deleteTask = (req, res, next) ->
  deleteTask req.habit.user, req.habit.task, ->
    req.habit.result = code: 204
    next()

###
  Helper function for updating multiple tasks
###
updateTasks = (tasks, user, model) ->
  for idx, task of tasks
    if task.id
      if task.del
        user.del "tasks.#{task.id}"

        # Delete from id list, only if type is passed up
        # TODO we should enforce they pass in type, so we can properly remove from idList
        if task.type and ~(i = user.get("#{task.type}Ids").indexOf task.id)
          user.remove("#{task.type}Ids", i, 1)

        task = deleted: true
      else
        user.set "tasks.#{task.id}", task
    else
      addTask(user, task)
    tasks[idx] = task
  return tasks

###
  Update Task
###
api.updateTask = (req, res, next) ->
  req.habit.user.set "tasks.#{req.habit.task.id}", req.habit.task
  req.habit.result = data: req.habit.task
  next()

###
  Update tasks (plural). This will update, add new, delete, etc all at once.
  Should we keep this?
###
api.updateTasks = (req, res, next) ->
  tasks = updateTasks req.body, req.habit.user, req.getModel()
  req.habit.result = code: 201, data: tasks
  next()

api.createTask =  (req, res, next) ->
  task = req.habit.task
  addTask req.habit.user, task, ->
    req.habit.result = code: 201, data: task
    next()

api.sortTask = (req, res, next) ->
  {id} = req.params
  {to, from, type} = req.habit.task
  {user} = req.habit
  path = "#{type}Ids"
  a = user.get(path)
  a.splice(to, 0, a.splice(from, 1)[0])
  user.set path, a, next

###
  ------------------------------------------------------------------------
  User
  ------------------------------------------------------------------------
###

###
  Get User
###
api.getUser = (req, res, next) ->
  uObj = req.habit.user.get()

  uObj.stats.toNextLevel = algos.tnl uObj.stats.lvl
  uObj.stats.maxHealth = 50

  delete uObj.apiToken
  if uObj.auth
    delete uObj.auth.hashed_password
    delete uObj.auth.salt

  req.habit.result = data: uObj
  next()

###
  Register new user with uname / password
###
api.loginLocal = (req, res, next) ->
  username = req.body.username
  password = req.body.password
  return res.json 401, err: 'No username or password' unless username and password

  model = req.getModel()

  q = model.query("users").withUsername(username)
  q.fetch (err, result1) ->
    return res.json 401, { err } if err
    u1 = result1.get()
    return res.json 401, err: 'Username not found' unless u1 # user not found

    # We needed the whole user object first so we can get his salt to encrypt password comparison
    q = model.query("users").withLogin(username, utils.encryptPassword(password, u1.auth.local.salt))
    q.fetch (err, result2) ->
      return res.json 401, { err } if err

      # joshua tree?
      u2 = result2.get()
      return res.json 401, err: 'Incorrect password' unless u2

      req.habit ?= {}
      req.habit.result = data:
        id: u2.id
        token: u2.apiToken
      next()

###
  POST /user/auth/facebook
###
api.loginFacebook = (req, res, next) ->
  {facebook_id, email, name} = req.body
  return res.json 401, err: 'No facebook id provided' unless facebook_id
  model = req.getModel()
  q = model.query("users").withProvider('facebook', facebook_id)
  q.fetch (err, result) ->
    return res.json 401, { err } if err
    u = result.get()
    if u
      req.habit ?= {}
      req.habit.result = data:
        id: u.id
        token: u.apiToken
      next()
    else
      # FIXME: create a new user instead
      return res.json 403, err: "Please register with Facebook on https://habitrpg.com, then come back here and log in."

###
  Update user
  FIXME add documentation here
###
api.updateUser = (req, res, next) ->
  {user} = req.habit

  # FIXME we need to do some crazy sanitiazation if they're using the old `PUT /user {data}` method.
  # The new `PUT /user {'stats.hp':50}

  # FIXME - one-by-one we want to widdle down this list, instead replacing each needed set path with API operations
  # Note: custom is for 3rd party apps
  acceptableAttrs = 'tasks achievements filters flags invitations items lastCron party preferences profile stats tags custom'.split(' ')
  series = []
  _.each req.body, (v, k) ->
    if (_.find acceptableAttrs, (attr)-> k.indexOf(attr) is 0)?
      series.push (cb) -> req.habit.user.set(k, v, cb)
  async.series series, (err) ->
    return next(err) if err
    req.habit.result = data: helpers.derbyUserToAPI(user)
    next()

api.cron = (req, res, next) ->
  {user} = req.habit
  misc.batchTxn req.getModel(), (uObj, paths) ->
    uObj = helpers.derbyUserToAPI(uObj, {asScope:false})
    algos.cron uObj, {paths}
  , {user, done:next, cron:true}

api.revive = (req, res, next) ->
  {user} = req.habit
  done = ->
    req.habit.result = data: helpers.derbyUserToAPI(user)
    next()
  misc.batchTxn req.getModel(), (uObj, paths) ->
    algos.revive uObj, {paths}
  , {user, done}


###
  ------------------------------------------------------------------------
  Batch Update
  Run a bunch of updates all at once
  ------------------------------------------------------------------------
###
api.batchUpdate = (req, res, next) ->
  {user} = req.habit

  performAction = (action, cb) ->
    req.params.id = action.data?.id
    req.params.direction = action.dir
    req.body = action.data

    switch action.op
      when "score"
        api.scoreTask(req, res, cb)
      when "sortTask"
        api.sortTask(req, res, cb)
      when "addTask"
        api.validateTask req, res, ->
          api.createTask(req, res, cb)
      when "delTask"
        api.validateTask req, res, ->
          api.deleteTask(req, res, cb)
      when "set"
        api.updateUser(req, res, cb)
      when "revive"
        api.revive(req, res, cb)
      else cb()

  # Setup the array of functions we're going to call in parallel with async
  actions = _.transform (req.body ? []), (result, action) ->
    unless _.isEmpty(action)
      result.push (cb) -> performAction(action, cb)

  # call all the operations, then return the user object to the requester
  async.series actions, (err) ->
    return res.json 500, {err} if err
    res.json helpers.derbyUserToAPI(user)
    console.log "Reply sent"

