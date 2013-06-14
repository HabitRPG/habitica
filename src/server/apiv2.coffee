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
  actions = req.body
  console.log util.inspect req.body
  if _.isArray actions
    actions.forEach (action)->
      if action.op == "score"
        if action.task.type=="daily" || action.task.type=="todo"
#          flip completed state. Since checkbox is not binded to model unlike when you click through Derby website.
          completed = model.get "tasks[#{action.task.id}].completed"
          model.set("tasks[#{action.task.id}].completed", !completed)
        misc.score(model, action.task.id, action.dir, true)

      if action.op == "newTask"
        req.user.set "tasks.#{req.task.id}", action.task

      if action.op=="delTask"
        model.del ("tasks."+action.task)

      #        this API is only working with string or number variables. It should return error if object given or object is at the path.
      if action.op == "set"
        oldValue = model.get(action.path);
        if (typeof action.value == "number" || typeof action.value == "string")
          if (typeof oldValue == "number" || typeof oldValue == "string")
            model.get(action.path, action.value)


#emulate slow\buggy API, TODO, REMOVE THIS PIECE OF CODE!
  setTimeout (->
    res.json 200, req.userObj
    console.log "Reply sent")
             , 1000

module.exports = router