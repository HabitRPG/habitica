express = require 'express'
router = new express.Router()
util = require('util')

_ = require 'lodash'
algos = require 'habitrpg-shared/script/algos'
helpers = require 'habitrpg-shared/script/helpers'
validator = require 'derby-auth/node_modules/validator'
check = validator.check
sanitize = validator.sanitize
misc = require '../app/misc'

NO_TOKEN_OR_UID =
err: "You must include a token and uid (user id) in your request"
NO_USER_FOUND =
err: "No user found."

# ---------- /api/v1 API ------------
# Every url added beneath router is prefaced by /api/v2

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

  model.query('users').withIdAndToken(uid, token).fetch (err, user) ->
    return res.json err: err if err
    req.user = user
    req.userObj = user.get()
    return res.json 401, NO_USER_FOUND if !req.userObj || _.isEmpty(req.userObj)
    req._isServer = true
    model.ref('_user', user)
    next()

###
POST new actions
###
router.post '/', auth, (req, res) ->
  model = req.getModel()
  user = req.user
  actions = req.body
  console.log util.inspect req.body

  _.each ['habit', 'daily', 'todo', 'reward'], (type) ->
    model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"

  if _.isArray actions
    actions.forEach (action)->
      if action.op == "score"
        if action.task.type=="daily" || action.task.type=="todo"
#          switch completed state. Since checkbox is not binded to model unlike when you click through Derby website.
          completed = if action.dir=="up" then true else false
          user.set("tasks.#{action.task.id}.completed", completed)
        misc.score(model, action.task.id, action.dir, true)

      if action.op == "addTask"
        model.unshift "_#{action.task.type}List", action.task

      if action.op=="delTask"
        ids = user.get('habitIds')
        ids.splice(ids.indexOf(action.task.id),1);
        user.set('habitIds',ids)
        user.del ("tasks."+action.task.id)


      #        this API is only working with string or number variables. It should return error if object given or object is at the path.
      if action.op == "set"
        oldValue = user.get(action.path);
        if (typeof action.value == "number" || typeof action.value == "string")
          if (typeof oldValue == "number" || typeof oldValue == "string")
            user.set(action.path, action.value)


#emulate slow\buggy API, TODO, REMOVE THIS PIECE OF CODE!
  setTimeout (->
    res.json 200, misc.hydrate(user.get())
    console.log "Reply sent")
             , 3000

module.exports = router