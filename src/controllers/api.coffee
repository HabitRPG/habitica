# @see ./routes.coffee for routing

_ = require 'lodash'
async = require 'async'
algos = require 'habitrpg-shared/script/algos'
helpers = require 'habitrpg-shared/script/helpers'
items = require 'habitrpg-shared/script/items'
validator = require 'derby-auth/node_modules/validator'
check = validator.check
sanitize = validator.sanitize
utils = require 'derby-auth/utils'
derbyAuthUtil = require('derby-auth/utils')
User = require('./../models/user').model

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
  return res.json(401, NO_TOKEN_OR_UID) unless uid and token

  User.findOne {_id: uid, apiToken: token}, (err, user) ->
    return res.json(500, {err}) if err
    return res.json(401, NO_USER_FOUND) if _.isEmpty(user)
    res.locals.user = user
    next()

###
  ------------------------------------------------------------------------
  Tasks
  ------------------------------------------------------------------------
###

###
  Local Methods
  ---------------
###

# FIXME put this in helpers, so mobile & web can us it too
# FIXME actually, move to mongoose
taskSanitizeAndDefaults = (task) ->
  task.id ?= helpers.uuid()
  task.value = ~~task.value
  task.type ?= 'habit'
  task.text = sanitize(task.text).xss() if _.isString(task.text)
  task.notes = sanitize(task.notes).xss() if _.isString(task.text)
  if task.type is 'habit'
    task.up = true unless _.isBoolean(task.up)
    task.down = true unless _.isBoolean(task.down)
  if task.type in ['daily', 'todo']
    task.completed = false unless _.isBoolean(task.completed)
  if task.type is 'daily'
    task.repeat ?= {m:true,t:true,w:true,th:true,f:true,s:true,su:true}
  task

###
Validate task
###
api.verifyTaskExists = (req, res, next) ->
  # If we're updating, get the task from the user
  task = res.locals.user.tasks[req.params.id]
  return res.json(400, err: "No task found.") if _.isEmpty(task)
  res.locals.task = task
  next()

addTask = (user, task) ->
  taskSanitizeAndDefaults(task)
  user.tasks[task.id] = task
  user["#{task.type}Ids"].unshift task.id
  task

# Override current user.task with incoming values, then sanitize all values
updateTask = (user, id, incomingTask) ->
  user.tasks[id] = taskSanitizeAndDefaults _.defaults(incomingTask, user.tasks[id])

deleteTask = (user, task) ->
  delete user.tasks[task.id]
  if (ids = user["#{task.type}Ids"]) and ~(i = ids.indexOf task.id)
    ids.splice(i,1)


###
  API Routes
  ---------------
###

###
  This is called form deprecated.coffee's score function, and the req.headers are setup properly to handle the login
  Export it also so we can call it from deprecated.coffee
###
api.scoreTask = (req, res, next) ->
  {id, direction} = req.params

  # Send error responses for improper API call
  return res.json(500, {err: ':id required'}) unless id
  return res.json(500, {err: ":direction must be 'up' or 'down'"}) unless direction in ['up','down']

  {user} = res.locals

  # If exists already, score it
  if (existing = user.tasks[id])
    # Set completed if type is daily or todo and task exists
    if existing.type in ['daily', 'todo']
      existing.completed = (direction is 'up')

  # If it doesn't exist, this is likely a 3rd party up/down - create a new one, then score it
  else
    task =
      id: id
      value: 0
      type: req.body?.type or 'habit'
      text: req.body?.title or id
      notes: "This task was created by a third-party service. Feel free to edit, it won't harm the connection to that service. Additionally, multiple services may piggy-back off this task."
    if task.type is 'habit'
      task.up = task.down = true
    if task.type in ['daily', 'todo']
      task.completed = direction is 'up'
    addTask user, task

  task = user.tasks[id]
  delta = algos.score(user, task, direction)
  user.save (err, saved) ->
    return res.json(500, {err}) if err
    res.json 200, _.extend({delta: delta}, saved.toJSON().stats)

###
  Get all tasks
###
api.getTasks = (req, res, next) ->
  types =
    if req.query.type in ['habit','todo','daily','reward'] then [req.query.type]
    else ['habit','todo','daily','reward']
  tasks = _.toArray (_.filter res.locals.user.tasks, (t)-> t.type in types)
  res.json 200, tasks

###
  Get Task
###
api.getTask = (req, res, next) ->
  task = res.locals.user.tasks[req.params.id]
  return res.json(400, err: "No task found.") if _.isEmpty(task)
  res.json 200, task

###
  Delete Task
###
api.deleteTask = (req, res, next) ->
  deleteTask res.locals.user, res.locals.task
  res.locals.user.save (err) ->
    return res.json(500, {err}) if err
    res.send 204

###
  Update Task
###
api.updateTask = (req, res, next) ->
  {user} = res.locals
  {id} = req.params
  updateTask user, id, req.body
  user.save (err, saved) ->
    return res.json(500, {err}) if err
    res.json 200, _.findWhere(saved.toJSON().tasks, {id})

###
  Update tasks (plural). This will update, add new, delete, etc all at once.
  Should we keep this?
###
api.updateTasks = (req, res, next) ->
  {user} = res.locals
  tasks = req.body
  _.each tasks, (task, idx) ->
    if task.id
      if task.del # Delete
        deleteTask user, task
        task = deleted: true
      else # Update
        updateTask user, task.id, task
    else # Create
      task = addTask user, task
    tasks[idx] = task

  user.save (err, saved) ->
    return res.json 500, {err:err} if err
    res.json 201, tasks

api.createTask =  (req, res, next) ->
  {user} = res.locals
  task = addTask user, req.body
  user.save (err) ->
    return res.json(500, {err}) if err
    res.json 201, task

api.sortTask = (req, res, next) ->
  {id} = req.params
  {to, from, type} = res.locals.task
  {user} = res.locals
  path = "#{type}Ids"
  user[path].splice(to, 0, user[path].splice(from, 1)[0])
  user.save (err) ->
    return res.json(500,{err}) if err
    res.json 200, user[path]

###
  ------------------------------------------------------------------------
  Items
  ------------------------------------------------------------------------
###
api.buy = (req, res, next) ->
  {user} = res.locals
  type = req.params.type
  unless type in ['weapon', 'armor', 'head', 'shield']
    return res.json(400, err: ":type must be in one of: 'weapon', 'armor', 'head', 'shield'")
  hasEnough = items.buyItem(user, type)
  if hasEnough
    user.save (err, saved) ->
      return res.json(500,{err}) if err
      res.json 200, saved.toJSON().items
  else
    res.json 200, {err: "Not enough GP"}

###
  ------------------------------------------------------------------------
  User
  ------------------------------------------------------------------------
###


###
  Registers a new user. Only accepting username/password registrations, no Facebook
###
api.registerUser = (req, res, next) ->
  {email, username, password, confirmPassword} = req.body

  unless username and password and email
    return res.json 401, err: ":username, :email, :password, :confirmPassword required"
  if password isnt confirmPassword
    return res.json 401, err: ":password and :confirmPassword don't match"
  try
    validator.check(email).isEmail()
  catch e
    return res.json 401, err: e.message

  async.waterfall [
    (cb) ->
      User.findOne {'auth.local.email':email}, cb

    , (found, cb) ->
      return cb("Email already taken") if found
      User.findOne {'auth.local.username':username}, cb

    , (found, cb) ->
      return cb("Username already taken") if found
      newUser = helpers.newUser(true)
      salt = utils.makeSalt()
      newUser.auth = local: {username, email, salt}
      newUser.auth.local.hashed_password = derbyAuthUtil.encryptPassword(password, salt)
      user = new User(newUser)
      user.save cb

  ], (err, saved) ->
    return res.json(401, {err}) if err
    res.json 200, saved

###
  Get User
###
api.getUser = (req, res, next) ->
  {user} = res.locals

  user.stats.toNextLevel = algos.tnl user.stats.lvl
  user.stats.maxHealth = 50

  delete user.apiToken
  if user.auth
    delete user.auth.hashed_password
    delete user.auth.salt

  res.json(200, user)

###
  Register new user with uname / password
###
api.loginLocal = (req, res, next) ->
  {username, password} = req.body
  async.waterfall [
    (cb) ->
      return cb('No username or password') unless username and password
      User.findOne {'auth.local.username':username}, cb
    , (user, cb) ->
      return cb('Username not found') unless user
      # We needed the whole user object first so we can get his salt to encrypt password comparison
      User.findOne({
        'auth.local.username': username
        'auth.local.hashed_password': utils.encryptPassword(password, user.auth.local.salt)
      }, cb)
  ], (err, user) ->
    err = 'Incorrect password' unless user
    return res.json(401, {err}) if err
    res.json 200, {id: user._id, token: user.apiToken}

###
  POST /user/auth/facebook
###
api.loginFacebook = (req, res, next) ->
  {facebook_id, email, name} = req.body
  return res.json(401, err: 'No facebook id provided') unless facebook_id
  User.findOne {'auth.local.facebook.id':facebook_id}, (err, user) ->
    return res.json(401, {err}) if err
    if user
      res.json 200, {id: user.id, token: user.apiToken}
    else
      # FIXME: create a new user instead
      return res.json(403, err: "Please register with Facebook on https://habitrpg.com, then come back here and log in.")

###
  Update user
  FIXME add documentation here
###
api.updateUser = (req, res, next) ->
  {user} = res.locals
  errors = []

  return res.json(200, user) if _.isEmpty(req.body)

  # FIXME we need to do some crazy sanitiazation if they're using the old `PUT /user {data}` method.
  # The new `PUT /user {'stats.hp':50}

  # FIXME - one-by-one we want to widdle down this list, instead replacing each needed set path with API operations
  # There's a trick here. In order to prevent prevent clobering top-level paths, we add `.` to make sure they're
  # sending bodies as {"set.this.path":value} instead of {set:{this:{path:value}}}. Permit lastCron since it's top-level
  # Note: custom is for 3rd party apps
  acceptableAttrs = 'tasks. achievements. filters. flags. invitations. items. lastCron party. preferences. profile. stats. tags. custom.'.split(' ')
  _.each req.body, (v, k) ->
    if (_.find acceptableAttrs, (attr)-> k.indexOf(attr) is 0)?
      if _.isObject(v)
        errors.push "Value for #{k} was an object. Be careful here, you could clobber stuff."
      helpers.dotSet(k,v,user)
    else
      errors.push "path `#{k}` was not saved, as it's a protected path. Make sure to send `PUT /api/v1/user` request bodies as `{'set.this.path':value}` instead of `{set:{this:{path:value}}}`"
    true
  user.save (err) ->
    return res.json(500, {err: errors}) unless _.isEmpty errors
    return res.json(500, {err}) if err
    res.json 200, user

api.cron = (req, res, next) ->
  {user} = res.locals
  algos.cron user
  #FIXME make sure the variable references got handled properly
  user.save next

api.revive = (req, res, next) ->
  {user} = res.locals
  algos.revive user
  user.save (err, saved) ->
    return res.json(500,{err}) if err
    res.json 200, saved


###
  ------------------------------------------------------------------------
  Batch Update
  Run a bunch of updates all at once
  ------------------------------------------------------------------------
###
api.batchUpdate = (req, res, next) ->
  {user} = res.locals
  #console.log {user}

  oldSend = res.send
  oldJson = res.json

  performAction = (action, cb) ->
    # TODO come up with a more consistent approach here. like:
    # req.body=action.data; delete action.data; _.defaults(req.params, action)
    # Would require changing action.dir on mobile app
    req.params.id = action.data?.id
    req.params.direction = action.dir
    req.params.type = action.type
    req.body = action.data

    res.send = res.json = (code, data) ->
      console.error({code, data}) if _.isNumber(code) and code >= 400
      #FIXME send error messages down
      cb()

    switch action.op
      when "score"
        api.scoreTask(req, res)
      when "buy"
        api.buy(req, res)
      when "sortTask"
        api.verifyTaskExists (req, res) ->
          api.sortTask(req, res)
      when "addTask"
        api.createTask(req, res)
      when "delTask"
        api.verifyTaskExists req, res, ->
          api.deleteTask(req, res)
      when "set"
        api.updateUser(req, res)
      when "revive"
        api.revive(req, res)
      else cb()

  # Setup the array of functions we're going to call in parallel with async
  actions = _.transform (req.body ? []), (result, action) ->
    unless _.isEmpty(action)
      result.push (cb) -> performAction(action, cb)

  # call all the operations, then return the user object to the requester
  async.series actions, (err) ->
    res.json = oldJson; res.send = oldSend
    return res.json(500, {err}) if err
    res.json 200, user
    console.log "Reply sent"

