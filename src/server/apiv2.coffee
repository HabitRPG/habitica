express = require 'express'
router = new express.Router()
util = require 'util'
async = require 'async'

_ = require 'lodash'
algos = require 'habitrpg-shared/script/algos'
helpers = require 'habitrpg-shared/script/helpers'
validator = require 'derby-auth/node_modules/validator'
check = validator.check
sanitize = validator.sanitize
misc = require '../app/misc'
api = require './api'

# ---------- /api/v2 API ------------
# Every url added beneath router is prefaced by /api/v2

###
  API Status
###
router.get '/status', (req, res) ->
  res.json status: 'up'

###
POST new actions
###
router.post '/', api.auth, (req, res, next) ->
  model = req.getModel()
  {user} = req

  performAction = (action, cb) ->
    task = action.task ? {}
    switch action.op
      when "cron"
        misc.batchTxn model, (uObj, paths) ->
          # habitrpg-shared/algos requires uObj.habits, uObj.dailys etc instead of uObj.tasks
          _.each ['habit','daily','todo','reward'], (type) -> uObj["#{type}s"] = _.where(uObj.tasks, {type}); true
          algos.cron uObj, {paths}
        , {user, cb, cron:true}

      when "score"
        return cb() unless user.get "tasks.#{task.id}"
        sendScore = -> api.score(model, user, task.id, action.dir, cb)
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
        api.addTask user, task, cb

      when "delTask"
        api.deleteTask user, task, cb

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
        async.parallel setOps, cb

      else
        cb()

  # Setup the array of functions we're going to call in parallel with async
  req.body = [] if _.isEmpty req.body
  actions = _.transform (req.body or []), (result, action) ->
    unless _.isEmpty(action)
      result.push (cb) -> performAction(action, cb)
  # always run cron check
  req.body.unshift({op: 'cron'}) unless _.isEmpty actions

  # call all the operations, then return the user object to the requester
  async.series actions, (err) ->
    return next(err) if err
    uObj = misc.hydrate user.get()
    #transform user structure FROM user.tasks{} + user.habitIds[] TO user.habits[] + user.todos[] etc.
    _.each ['habit','daily','todo','reward'], (type) ->
      uObj["#{type}s"] = _.transform uObj["#{type}Ids"], (result, tid) -> result.push(uObj.tasks[tid])
      delete uObj["#{type}Ids"]
    delete uObj.tasks
    res.json 200, uObj
    console.log "Reply sent"

module.exports = router
