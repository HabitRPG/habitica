express = require 'express'
router = new express.Router()

_ = require 'lodash'
algos = require 'habitrpg-shared/script/algos'
helpers = require 'habitrpg-shared/script/helpers'
validator = require 'derby-auth/node_modules/validator'
check = validator.check
sanitize = validator.sanitize
utils = require 'derby-auth/utils'

NO_TOKEN_OR_UID = err: "You must include a token and uid (user id) in your request"
NO_USER_FOUND = err: "No user found."

addTask = (user, task) ->
  task.type ?= 'habit'
  tid = user.add "tasks", task
  user.push "#{task.type}Ids", tid

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
  TODO POST /user
  when a put attempt didn't work, create a new one with POST
###

###
  PUT /user
###
router.put '/user', auth, (req, res) ->
  user = req.user
  partialUser = req.body.user

  # REVISIT is this the best way of handling protected v acceptable attr mass-setting? Possible pitfalls: (1) we have to remember
  # to update here when we add new schema attrs in the future, (2) developers can't assign random variables (which
  # is currently beneficial for Kevin & Paul). Pros: protects accidental or malicious user data corruption

  # TODO - this accounts for single-nested items (stats.hp, stats.exp) but will clobber any other depth.
  # See http://stackoverflow.com/a/6394168/362790 for when we need to cross that road

  acceptableAttrs = ['flags', 'history', 'items', 'preferences', 'profile', 'stats']
  user.set 'lastCron', partialUser.lastCron if partialUser.lastCron?
  _.each acceptableAttrs, (attr) ->
    _.each partialUser[attr], (val, key) -> user.set("#{attr}.#{key}", val);true

  updateTasks partialUser.tasks, req.user, req.getModel() if partialUser.tasks?

  userObj = user.get()
  userObj.tasks = _.toArray(userObj.tasks) # FIXME figure out how we're going to consistently handle this. should always be array
  res.json 201, userObj

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
  taskIds = req.user.get "#{req.task.type}Ids"

  req.user.del "tasks.#{req.task.id}"
  # Remove one id from array of typeIds
  req.user.remove "#{req.task.type}Ids", taskIds.indexOf(req.task.id), 1

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
  uObj = req.user.get()
  tObj = uObj.tasks[taskId]
  paths = {}
  delta = algos.score(uObj, tObj, direction, {paths})
  _.each paths, (v,k) -> user.set(k,helpers.dotGet(k, uObj));true

  result = uObj.stats
  result.delta = delta
  res.json result

###
  POST /user/tasks/:taskId/:direction
###
router.post '/user/task/:taskId/:direction', auth, scoreTask
router.post '/user/tasks/:taskId/:direction', auth, scoreTask

module.exports = router
module.exports.auth = auth
module.exports.scoreTask = scoreTask # export so deprecated can call it
module.exports.NO_TOKEN_OR_UID = NO_TOKEN_OR_UID
module.exports.NO_USER_FOUND = NO_USER_FOUND
