express = require 'express'
router = new express.Router()

scoring = require '../app/scoring'
_ = require 'underscore'
{ tnl } = require '../app/algos'
validator = require 'derby-auth/node_modules/validator'
check = validator.check
sanitize = validator.sanitize

NO_TOKEN_OR_UID = err: "You must include a token and uid (user id) in your request"
NO_USER_FOUND = err: "No user found."

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
    return res.json 401, NO_USER_FOUND if !req.userObj || _.isEmpty(req.userObj)
    req._isServer = true
    next()
###
  GET /user
###
router.get '/user', auth, (req, res) ->
  user = req.userObj

  user.stats.toNextLevel = tnl user.stats.lvl
  user.stats.maxHealth = 50

  delete user.apiToken
  delete user.auth.hashed_password
  delete user.auth.salt

  res.json user

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
    unless /^(habit|todo|daily|reward)$/.test type
      return res.json 400, err: 'type must be habit, todo, daily, or reward'

  text = sanitize(text).xss()
  notes = sanitize(notes).xss()
  value = sanitize(value).toInt()

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
  POST /user/task/
###
router.post '/user/task', auth, validateTask, (req, res) ->
  task = req.task
  type = task.type

  model = req.getModel()
  model.ref '_user', req.user
  model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"
  model.at("_#{type}List").push task

  res.json 201, task

###
  GET /user/tasks
###
router.get '/user/tasks', auth, (req, res) ->
  user = req.userObj
  return res.json 400, NO_USER_FOUND if !user || _.isEmpty(user)

  model = req.getModel()
  model.ref '_user', req.user
  tasks = []
  types = ['habit','todo','daily','reward']
  if /^(habit|todo|daily|reward)$/.test req.query.type
    types = [req.query.type]
  for type in types
    model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"
    tasks = tasks.concat model.get("_#{type}List")

  res.json 200, tasks

###
  This is called form deprecated.coffee's score function, and the req.headers are setup properly to handle the login
###
scoreTask = (req, res, next) ->
  {taskId, direction} = req.params
  {title, service, icon} = req.body

  # Send error responses for improper API call
  return res.send(500, ':taskId required') unless taskId
  return res.send(500, ":direction must be 'up' or 'down'") unless direction in ['up','down']

  model = req.getModel()
  {user, userObj} = req

  model.ref('_user', user)

  # Create task if doesn't exist
  # TODO add service & icon to task
  unless model.get("_user.tasks.#{taskId}")
    model.refList "_habitList", "_user.tasks", "_user.habitIds"
    model.at('_habitList').push
      id: taskId
      type: 'habit'
      text: (title || taskId)
      value: 0
      up: true
      down: true
      notes: "This task was created by a third-party service. Feel free to edit, it won't harm the connection to that service. Additionally, multiple services may piggy-back off this task."

  delta = scoring.score(model, taskId, direction)
  result = model.get ('_user.stats')
  result.delta = delta
  res.send(result)

router.post '/user/tasks/:taskId/:direction', auth, scoreTask

module.exports = router
module.exports.auth = auth
module.exports.scoreTask = scoreTask # export so deprecated can call it
