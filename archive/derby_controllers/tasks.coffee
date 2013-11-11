algos = require 'habitrpg-shared/script/algos'
helpers = require 'habitrpg-shared/script/helpers'
_ = require 'lodash'
moment = require 'moment'
misc = require './misc'

  appExports.clearCompleted = (e, el) ->
    completedIds =  _.pluck( _.where(model.get('_todoList'), {completed:true}), 'id')
    todoIds = user.get('todoIds')
    _.each completedIds, (id) -> user.del "tasks.#{id}"; true
    user.set 'todoIds', _.difference(todoIds, completedIds)


  ###
    Undo
  ###
  appExports.undo = () ->
    undo = model.get '_undo'
    clearTimeout(undo.timeoutId) if undo?.timeoutId
    model.del '_undo'
    _.each undo.stats, (val, key) -> user.set "stats.#{key}", val; true
    taskPath = "tasks.#{undo.task.id}"
    _.each undo.task, (val, key) ->
      return true if key in ['id', 'type'] # strange bugs in this world: https://workflowy.com/shared/a53582ea-43d6-bcce-c719-e134f9bf71fd/
      if key is 'completed'
        user.pass({cron:true}).set("#{taskPath}.completed",val)
      else
        user.set "#{taskPath}.#{key}", val
      true
