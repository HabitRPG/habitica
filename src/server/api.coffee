express = require 'express'
router = new express.Router()

_ = require 'lodash'
algos = require 'habitrpg-shared/script/algos'
helpers = require 'habitrpg-shared/script/helpers'
validator = require 'derby-auth/node_modules/validator'
check = validator.check
sanitize = validator.sanitize
utils = require 'derby-auth/utils'
misc = require '../app/misc'

NO_TOKEN_OR_UID = err: "You must include a token and uid (user id) in your request"
NO_USER_FOUND = err: "No user found."

addTask = (user, task, cb) ->
  task.type ?= 'habit'
  tid = user.add "tasks", task, ->
    user.unshift "#{task.type}Ids", tid, cb

deleteTask = (user, task, cb) ->
  user.del "tasks.#{task.id}", ->
    taskIds = user.get "#{task.type}Ids"
    user.remove "#{task.type}Ids", taskIds.indexOf(task.id), 1, cb

score = (model, user, taskId, direction, cb) ->
  delta = 0
  misc.batchTxn model, (uObj, paths) ->
    tObj = uObj.tasks[taskId]
    delta = algos.score(uObj, tObj, direction, {paths})
  , {user, done:cb}
  delta

###
  This is called form deprecated.coffee's score function, and the req.headers are setup properly to handle the login
###
scoreTask = (req, res, next) ->
  {taskId, direction} = req.params
  {title, service, icon, type} = req.body
  type ||= 'habit'

  # Send error responses for improper API call
  return res.send(500, ':taskId required') unless taskId
  return res.send(500, ":direction must be 'up' or 'down'") unless direction in ['up','down']

  model = req.getModel()
  {user, userObj} = req

  existingTask = user.at "tasks.#{taskId}"
  # TODO add service & icon to task
  # If task exists, set it's compltion
  if existingTask.get()
    # Set completed if type is daily or todo
    existingTask.set 'completed', (direction is 'up') if /^(daily|todo)$/.test existingTask.get('type')
  else
    task =
      id: taskId
      type: type
      text: (title || taskId)
      value: 0
      notes: "This task was created by a third-party service. Feel free to edit, it won't harm the connection to that service. Additionally, multiple services may piggy-back off this task."

    switch type
      when 'habit'
        task.up = true
        task.down = true
      when 'daily', 'todo'
        task.completed = direction is 'up'

    addTask user, task

  # TODO - could modify batchTxn to conform to this better
  delta = score model, user, taskId, direction, ->
    result = user.get('stats')
    result.delta = delta
    res.json result

# ---------- /api/v1 API ------------
# Every url added beneath router is prefaced by /api/v1

###
  v1 API. Requires api-v1-user (user id) and api-v1-key (api key) headers, Test with:
  $ cd node_modules/racer && npm install && cd ../..
  $ mocha test/api.mocha.coffee
###

###
  API Status
###
router.get '/status', (req, res) ->
  res.json status: 'up'

###
  beforeEach auth interceptor
###
auth = (req, res, next) ->
  uid = req.headers['x-api-user']
  token = req.headers['x-api-key']
  return res.json 401, NO_TOKEN_OR_UID unless uid || token

  model = req.getModel()
  query = model.query('users').withIdAndToken(uid, token)

  query.fetch (err, user) ->
    return res.json err: err if err
    req.user = user
    req.userObj = user.get()
    return res.json 401, NO_USER_FOUND if _.isEmpty(req.userObj)
    req._isServer = true
    next()

###
  GET /user
###
router.get '/user', auth, (req, res) ->
  user = req.userObj

  user.stats.toNextLevel = algos.tnl user.stats.lvl
  user.stats.maxHealth = 50

  delete user.apiToken
  if user.auth
    delete user.auth.hashed_password
    delete user.auth.salt

  res.json user

###
  POST /user/auth/local
###
router.post '/user/auth/local', (req, res) ->
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

      res.json
        id: u2.id
        token: u2.apiToken

###
  POST /user/auth/facebook
###
router.post '/user/auth/facebook', (req, res) ->
  {facebook_id, email, name} = req.body
  return res.json 401, err: 'No facebook id provided' unless facebook_id
  model = req.getModel()
  q = model.query("users").withProvider('facebook', facebook_id)
  q.fetch (err, result) ->
    return res.json 401, { err } if err
    u = result.get()
    console.log {facebook_id, u}
    if u
      return res.json
        id: u.id
        token: u.apiToken
    else
      # FIXME: create a new user instead
      return res.json 403, err: "Please register with Facebook on https://habitrpg.com, then come back here and log in."


###
  GET /user/task/:id
###
router.get '/user/task/:id', auth, (req, res) ->
  task = req.userObj.tasks[req.params.id]
  return res.json 400, err: "No task found." if !task || _.isEmpty(task)
  res.json 200, task

###
  validate task
###
validateTask = (req, res, next) ->
  task = {}
  newTask = { type, text, notes, value, up, down, completed } = req.body

  # If we're updating, get the task from the user
  if req.method is 'PUT' or req.method is 'DELETE'
    task = req.userObj?.tasks[req.params.id]
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
  req.task = task
  next()

###
  PUT /user/task/:id
###
router.put '/user/task/:id', auth, validateTask, (req, res) ->
  req.user.set "tasks.#{req.task.id}", req.task
  res.json 200, req.task

###
  DELETE /user/task/:id
###
router.delete '/user/task/:id', auth, validateTask, (req, res) ->
  deleteTask req.user, req.task.type, req.task.id
  res.send 204

###
  POST /user/tasks
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

router.post '/user/tasks', auth, (req, res) ->
  tasks = updateTasks req.body, req.user, req.getModel()
  res.json 201, tasks


###
  POST /user/task/
###
router.post '/user/task', auth, validateTask, (req, res) ->
  task = req.task
  addTask req.user, task
  res.json 201, task

###
  GET /user/tasks
###
router.get '/user/tasks', auth, (req, res) ->
  return res.json 400, NO_USER_FOUND if _.isEmpty(req.userObj)

  types =
    if /^(habit|todo|daily|reward)$/.test(req.query.type) then [req.query.type]
    else ['habit','todo','daily','reward']
  tasks = _.toArray (_.filter req.user.get('tasks'), (t)-> t.type in types)

  res.json 200, tasks

###
  PUT /user
###
router.put '/user', auth, (req, res, next) ->

  # FIXME we need to do some crazy sanitiazation if they're using the old `PUT /user {data}` method.
  # The new `PUT /user {'stats.hp':50}

  # FIXME - one-by-one we want to widdle down this list, instead replacing each needed set path with API operations
  # Note: custom is for 3rd party apps
  acceptableAttrs = 'achievements filters flags invitations items lastCron party preferences profile stats tags custom'.join(' ')
  series = []
  _.each req.body, (v, k) ->
    if (_.find acceptableAttrs, (attr)-> k.indexOf(attr) is 0)?
      series.push (cb) -> req.user.set(k, v, cb)
  async.series series, (err) ->
    return next(err) if err
    res.json 201, helpers.derbyUserToAPI(user)

###
POST new actions
###
router.post '/batch-update', auth, (req, res, next) ->
  model = req.getModel()
  {user} = req

  performAction = (action, cb) ->
    task = action.task ? {}
    switch action.op
      when "cron"
        misc.batchTxn model, (uObj, paths) ->
          uObj = helpers.derbyUserToAPI(user)
          algos.cron uObj, {paths}
        , {user, done:cb, cron:true}

      when "score"
        return cb() unless user.get "tasks.#{task.id}"
        sendScore = -> score(model, user, task.id, action.dir, cb)
        if task.type in ["daily","todo"]
          # switch completed state. Since checkbox is not binded to model unlike when you click through Derby website.
          completed = if action.dir is "up" then true else false
          user.set "tasks.#{task.id}.completed", completed, sendScore
        else sendScore()

      when "sortTask"
        path = action.task.type + "Ids"
        a = user.get(path)
        a.splice(action.to, 0, a.splice(action.from, 1)[0])
        user.set path, a, cb

      when "addTask"
        addTask user, task, cb

      when "delTask"
        deleteTask user, task, cb

      # this API is only working with string or number variables. It should return error if object given or object is at the path.
      when "set"
        oldValue = user.get(action.path)
        if _.isObject(action.value) or _.isObject(oldValue)
          console.error "action.value was an object, which isn't currently supported. Tyler - double check this"
          cb()
        else
          user.set action.path, action.value, cb

      when "revive"
        [uObj, paths] = [user.get(), {}]
        algos.revive uObj, {paths}
        setOps = _.map paths, (v,k) ->
          (reviveCb) -> user.set k, helpers.dotGet(k,uObj), reviveCb
        console.log setOps
        async.serial setOps, cb

      else
        cb()

  # Setup the array of functions we're going to call in parallel with async
  # Start with cron
  (req.body or= []).unshift({op: 'cron'})
  actions = _.transform (req.body), (result, action) ->
    result.push (cb) -> performAction(action, cb) unless _.isEmpty(action)

  # call all the operations, then return the user object to the requester
  async.series actions, (err) ->
    return next(err) if err
    res.json 200, helpers.derbyUserToAPI(user)
    console.log "Reply sent"


###
  POST /user/tasks/:taskId/:direction
###
router.post '/user/task/:taskId/:direction', auth, scoreTask
router.post '/user/tasks/:taskId/:direction', auth, scoreTask

module.exports = router
module.exports.auth = auth
module.exports.scoreTask = scoreTask # export so deprecated can call it