express = require 'express'
router = new express.Router()
util = require 'util'

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
  actions = req.body

  doneCount = 1 + # cron
    _.size(actions) # standard operations
  done = (err) ->
    return next(err) if err
    if --doneCount is 0
      uObj = misc.hydrate user.get()
      #transform user structure FROM user.tasks{} + user.habitIds[] TO user.habits[] + user.todos[] etc.
      _.each ['habit','daily','todo','reward'], (type) ->
        uObj["#{type}s"] = _.transform uObj["#{type}Ids"], (result, tid) -> result.push(uObj.tasks[tid])
        delete uObj["#{type}Ids"]
      delete uObj.tasks
      res.json 200, uObj
      console.log "Reply sent"

  notEmpty = _.find actions, ((action) -> !_.isEmpty(action))
  unless notEmpty
    # yan's strange User.log({}) thing
    doneCount = 1
    return done()

  misc.batchTxn model, (uObj, paths) ->
    # habitrpg-shared/algos requires uObj.habits, uObj.dailys etc instead of uObj.tasks
    _.each ['habit','daily','todo','reward'], (type) -> uObj["#{type}s"] = _.where(uObj.tasks, {type}); true
    algos.cron uObj, {paths}
  , {user, done, cron:true}

  if _.isArray actions
    actions.forEach (action)->

      task = action.task ? {}

      return done() if _.isEmpty(action)

      switch action.op
        when "score"
          return done() unless user.get "tasks.#{task.id}"
          sendScore = -> api.score(model, user, task.id, action.dir, done)
          if task.type in ["daily","todo"]
            # switch completed state. Since checkbox is not binded to model unlike when you click through Derby website.
            completed = if action.dir is "up" then true else false
            user.set "tasks.#{task.id}.completed", completed, sendScore
          else sendScore()

        when "sortTask"
          path = action.task.type + "Ids"
          a = user.get(path)
          a.splice(action.to, 0, a.splice(action.from, 1)[0])
          user.set path, a, done

        when "addTask"
          api.addTask user, task, done

        when "delTask"
          api.deleteTask user, task, done

        # this API is only working with string or number variables. It should return error if object given or object is at the path.
        when "set"
          oldValue = user.get(action.path)
          if _.isObject(action.value) or _.isObject(oldValue)
            console.error "action.value was an object, which isn't currently supported. Tyler - double check this"
          else
            user.set action.path, action.value, done

        when "revive"
          [uObj, paths] = [user.get(), {}]
          algos.revive uObj, {paths}
          doneCount += (_.size(paths) - 1) # once for each path, but +1 is already accounted for at top of this function (whole 'revive' counted as 1)
          _.each paths, (v,k) ->
            user.set k, helpers.dotGet(k,uObj), done

        else done()

module.exports = router
