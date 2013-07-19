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
router.post '/', api.auth, (req, res) ->
  model = req.getModel()
  user = req.user
  actions = req.body
  console.log util.inspect req.body


  misc.batchTxn model, (uObj, paths) ->
      # habitrpg-shared/algos requires uObj.habits, uObj.dailys etc instead of uObj.tasks
    _.each ['habit','daily','todo','reward'], (type) -> uObj["#{type}s"] = _.where(uObj.tasks, {type}); true
    algos.cron uObj, {paths}
  ,{cron:true}


  _.each ['habit', 'daily', 'todo', 'reward'], (type) ->
    model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"

  if _.isArray actions
    actions.forEach (action)->
      task = {}
      if action.task? then task = action.task

      if action.op == "score"
        if task.type == "daily" || task.type == "todo"
#          switch completed state. Since checkbox is not binded to model unlike when you click through Derby website.
          completed = if action.dir == "up" then true else false
          user.set("tasks.#{task.id}.completed", completed)
        misc.score(model, task.id, action.dir, true)

      if action.op == "sortTask"
        path = action.task.type + "Ids"
        a=user.get(path)
        a.splice(action.to, 0, a.splice(action.from, 1)[0])
        user.set(path, a)

      if action.op == "addTask"
        model.unshift "_#{task.type}List", task

      if action.op == "delTask"
#        to make sure we update DOM on Derby client
        ids = user.get(task.type + 'Ids')
        ids.splice(ids.indexOf(task.id), 1);
        user.set(task.type + 'Ids', ids)

        #        Actually delete the task
        user.del ("tasks." + task.id)


      #        this API is only working with string or number variables. It should return error if object given or object is at the path.
      if action.op == "set"
        oldValue = user.get(action.path);
        if (typeof action.value == "number" || typeof action.value == "string")
          if (typeof oldValue == "number" || typeof oldValue == "string")
            user.set(action.path, action.value)

  user = misc.hydrate user.get()

  #transform user structure FROM user.tasks{} + user.habitIds[] TO user.habits[] + user.todos[] etc.
  ["habit", "daily", "todo", "reward"].forEach (type) ->
    user[type + 's'] = []
    user[type + 'Ids'].forEach (id)->
      user[type + 's'].push(user.tasks[id])
    delete user[type + 'Ids']
  delete user.tasks
  res.json 200, user
  console.log "Reply sent"

module.exports = router