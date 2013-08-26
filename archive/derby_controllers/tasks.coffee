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


  appExports.toggleTaskEdit = (e, el) ->
    id = e.get('id')
    [editPath, chartPath] = ["_tasks.editing.#{id}", "_page.charts.#{id}"]
    model.set editPath, !(model.get editPath)
    model.set chartPath, false

  appExports.toggleChart = (e, el) ->
    id = $(el).attr('data-id')
    [historyPath, togglePath] = ['','']

    switch id
      when 'exp'
        [togglePath, historyPath] = ['_page.charts.exp', '_user.history.exp']
      when 'todos'
        [togglePath, historyPath] = ['_page.charts.todos', '_user.history.todos']
      else
        [togglePath, historyPath] = ["_page.charts.#{id}", "_user.tasks.#{id}.history"]
        model.set "_tasks.editing.#{id}", false

    history = model.get(historyPath)
    model.set togglePath, !(model.get togglePath)

    matrix = [['Date', 'Score']]
    _.each history, (obj) -> matrix.push([ moment(obj.date).format('MM/DD/YY'), obj.value ])
    data = google.visualization.arrayToDataTable matrix
    options =
      title: 'History'
      backgroundColor: { fill:'transparent' }
    chart = new google.visualization.LineChart $(".#{id}-chart")[0]
    chart.draw(data, options)

  appExports.todosShowRemaining = -> model.set '_showCompleted', false
  appExports.todosShowCompleted = -> model.set '_showCompleted', true


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
