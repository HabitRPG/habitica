express = require 'express'
router = new express.Router()

_ = require 'lodash'
algos = require 'habitrpg-shared/script/algos'
helpers = require 'habitrpg-shared/script/helpers'
validator = require 'derby-auth/node_modules/validator'
check = validator.check
sanitize = validator.sanitize
misc = require '../app/misc'

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
        if task.type # TODO we should enforce they pass in type, so we can properly remove from idList
          i = model.get("_#{task.type}List").indexOf(task.id)
          model.remove("_#{task.type}List", i, 1) # doens't work when task.type isn't passed up
        task = deleted: true
      else
        user.set "tasks.#{task.id}", task
    else
      type = task.type || 'habit'
      model.ref '_user', user
      model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"
      model.at("_#{type}List").push task
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
  {title, service, icon, type} = req.body
  type ||= 'habit'

  # Send error responses for improper API call
  return res.send(500, ':taskId required') unless taskId
  return res.send(500, ":direction must be 'up' or 'down'") unless direction in ['up','down']

  model = req.getModel()
  {user, userObj} = req

  model.ref('_user', user)

  existingTask = model.at "_user.tasks.#{taskId}"
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

    model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"
    model.at("_#{type}List").push task

  #FIXME
  delta = misc.score(model, taskId, direction)
  result = model.get '_user.stats'
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
