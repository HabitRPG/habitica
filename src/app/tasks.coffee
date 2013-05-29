algos = require 'habitrpg-shared/script/algos'
helpers = require 'habitrpg-shared/script/helpers'
_ = require 'lodash'
moment = require 'moment'
misc = require './misc'


###
  Make scoring functionality available to the app
###
module.exports.app = (appExports, model) ->
  character = require './character'
  user = model.at('_user')

  appExports.addTask = (e, el) ->
    type = $(el).attr('data-task-type')
    newModel = model.at('_new' + type.charAt(0).toUpperCase() + type.slice(1))
    text = newModel.get()
    # Don't add a blank task; 20/02/13 Added a check for undefined value, more at issue #463 -lancemanfv
    return if /^(\s)*$/.test(text) || text == undefined

    activeFilters = _.reduce user.get('filters'), ((memo,v,k) -> memo[k]=v if v;memo), {}
    newTask = {id: model.id(), type: type, text: text, notes: '', value: 0, tags: activeFilters}
    switch type
      when 'habit'
        newTask = _.defaults {up: true, down: true}, newTask
      when 'reward'
        newTask = _.defaults {value: 20}, newTask
      when 'daily'
        newTask = _.defaults {repeat:{su:true,m:true,t:true,w:true,th:true,f:true,s:true}, completed: false }, newTask
      when 'todo'
        newTask = _.defaults {completed: false }, newTask
    model.unshift "_#{type}List", newTask
    newModel.set ''

  appExports.del = (e) ->
    # Derby extends model.at to support creation from DOM nodes
    task = e.at()
    id = task.get('id')

    history = task.get('history')
    if history and history.length > 2
      # prevent delete-and-recreate hack on red tasks
      if task.get('value') < 0
        if confirm("Are you sure? Deleting this task will hurt you (to prevent deleting, then re-creating red tasks).") is true
          task.set('type','habit') # hack to make sure it hits HP, instead of performing "undo checkbox"
          misc.score(model, id, 'down', true)
        else
          return # Cancel. Don't delete, don't hurt user

        # prevent accidently deleting long-standing tasks
      else
        return unless confirm("Are you sure you want to delete this task?") is true

    #TODO bug where I have to delete from _users.tasks AND _{type}List,
    # fix when query subscriptions implemented properly
    $('[rel=tooltip]').tooltip('hide')

    user.del('tasks.'+id)
    task.remove()


  appExports.clearCompleted = (e, el) ->
    completedIds =  _.pluck( _.where(model.get('_todoList'), {completed:true}), 'id')
    todoIds = user.get('todoIds')

    _.each completedIds, (id) -> user.del "tasks.#{id}"; true
    user.set 'todoIds', _.difference(todoIds, completedIds)

  appExports.toggleDay = (e, el) ->
    task = model.at(e.target)
    if /active/.test($(el).attr('class')) # previous state, not current
      task.set('repeat.' + $(el).attr('data-day'), false)
    else
      task.set('repeat.' + $(el).attr('data-day'), true)

  appExports.toggleTaskEdit = (e, el) ->
    hideId = $(el).attr('data-hide-id')
    toggleId = $(el).attr('data-toggle-id')
    $(document.getElementById(hideId)).addClass('visuallyhidden')
    $(document.getElementById(toggleId)).toggleClass('visuallyhidden')

  appExports.toggleChart = (e, el) ->
    hideSelector = $(el).attr('data-hide-id')
    chartSelector = $(el).attr('data-toggle-id')
    historyPath = $(el).attr('data-history-path')
    $(document.getElementById(hideSelector)).hide()
    $(document.getElementById(chartSelector)).toggle()

    matrix = [['Date', 'Score']]
    for obj in model.get(historyPath)
      date = +new Date(obj.date)
      readableDate = moment(date).format('MM/DD')
      matrix.push [ readableDate, obj.value ]
    data = google.visualization.arrayToDataTable matrix

    options = {
      title: 'History'
      backgroundColor: { fill:'transparent' }
    }

    chart = new google.visualization.LineChart(document.getElementById( chartSelector ))
    chart.draw(data, options)

  appExports.todosShowRemaining = -> model.set '_showCompleted', false
  appExports.todosShowCompleted = -> model.set '_showCompleted', true

  ###
    Call scoring functions for habits & rewards (todos & dailies handled below)
  ###
  appExports.score = (e, el) ->
    id = $(el).parents('li').attr('data-id')
    direction = $(el).attr('data-direction')
    misc.score(model, id, direction, true)

  ###
    This is how we handle appExports.score for todos & dailies. Due to Derby's special handling of `checked={:task.completd}`,
    the above function doesn't work so we need a listener here
  ###
  user.on 'set', 'tasks.*.completed', (i, completed, previous, isLocal, passed) ->
    return if passed?.cron # Don't do this stuff on cron
    direction = if completed then 'up' else 'down'
    misc.score(model, i, direction, true)

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

  appExports.tasksToggleAdvanced = (e, el) ->
    $(el).next('.advanced-option').toggleClass('visuallyhidden')

  appExports.tasksSaveAndClose = ->
    # When they update their notes, re-establish tooltip & popover
    $('[rel=tooltip]').tooltip()
    $('[rel=popover]').popover()

  appExports.tasksSetPriority = (e, el) ->
    dataId = $(el).parent('[data-id]').attr('data-id')
    #"_user.tasks.#{dataId}"
    model.at(e.target).set 'priority', $(el).attr('data-priority')
