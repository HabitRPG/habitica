derby = require 'derby'
{get, view, ready} = derby.createApp module
derby.use require 'derby-ui-boot'
derby.use require('../../ui')
derby.use require('derby-auth/components');

# Custom requires
scoring = require './scoring'
schema = require './schema'
helpers = require './helpers'
browser = require './browser'
party = require './party'
items = require './items'

helpers.viewHelpers view
items.view view

moment = require('moment')
_ = require('underscore')

setupListReferences = (model) ->
  taskTypes = ['habit', 'daily', 'todo', 'reward']
  _.each taskTypes, (type) ->  model.refList "_#{type}List", "_user.tasks", "_user.idLists.#{type}"


# ========== ROUTES ==========

get '/', (page, model, next) ->
  # temporary view variables, so we don't call model.set() too fast
  _view = model.get '_view' || {}

  # Force SSL # NOTE handled by ngix now
  #req = page._res.req
  #if req.headers['x-forwarded-proto']!='https' and process.env.NODE_ENV=='production'
  #  return page.redirect 'https://' + req.headers.host + req.url

  # This used to be in party.server(model, cb), but was getting `TypeError: Object #<Model> has no method 'server'`
  # on the second load for some reason
  selfQ = model.query('users').withId(model.get('_userId') or model.session.userId)
  model.subscribe selfQ, (err, users) ->
    throw err if err

    user = users.at(0)
    model.ref '_user', user

    batch = new schema.BatchUpdate(model)
    batch.startTransaction()
    obj = batch.obj()
    obj = user.get() unless obj.items? #why is this happening?

    model.set '_view', _view

    items.server(model)

    schema.updateUser(batch)
    batch.commit()

    setupListReferences(model)
    model.fn '_tnl', '_user.stats.lvl', (lvl) ->
      # see https://github.com/lefnire/habitrpg/issues/4
      # also update in scoring.coffee. TODO create a function accessible in both locations
      (lvl*100)/5

    party.partySubscribe model, -> page.render()

# ========== CONTROLLER FUNCTIONS ==========

ready (model) ->
  user = model.at('_user')
  scoring.setModel(model)

  #set cron immediately
  lastCron = user.get('lastCron')
  user.set('lastCron', +new Date) if (!lastCron? or lastCron == 'new')

  # Setup model in scoring functions
  scoring.cron()

  browser.app(exports, model)
  party.app(exports, model)
  items.app(exports, model)
  require('../server/private').app(exports, model)

  #require('./debug').app(exports, model)

  user.on 'set', 'tasks.*.completed', (i, completed, previous, isLocal, passed) ->
    return if passed? && passed.cron # Don't do this stuff on cron
    direction = () ->
      return 'up' if completed==true and previous == false
      return 'down' if completed==false and previous == true
      throw new Error("Direction neither 'up' nor 'down' on checkbox set.")
      
    # Score the user based on todo task
    task = user.at("tasks.#{i}")
    scoring.score(i, direction())
    
  exports.addTask = (e, el, next) ->
    type = $(el).attr('data-task-type')
    list = model.at "_#{type}List"
    newModel = model.at('_new' + type.charAt(0).toUpperCase() + type.slice(1))
    text = newModel.get()
    # Don't add a blank todo
    return if /^(\s)*$/.test(text)

    newModel.set ''
    switch type

      when 'habit'
        list.push {type: type, text: text, notes: '', value: 0, up: true, down: true}

      when 'reward'
        list.push {type: type, text: text, notes: '', value: 20 }

      when 'daily'
        list.push {type: type, text: text, notes: '', value: 0, repeat:{su:true,m:true,t:true,w:true,th:true,f:true,s:true}, completed: false }
      
      when 'todo'
        list.push {type: type, text: text, notes: '', value: 0, completed: false }

        # list.on 'set', '*.completed', (i, completed, previous, isLocal) ->
          # # Move the item to the bottom if it was checked off
          # list.move i, -1  if completed && isLocal

  exports.del = (e, el) ->
    # Derby extends model.at to support creation from DOM nodes
    #task = model.at(e.target)
    # FIXME normally that would work, and we'd later simply call `user.del task` (instead of that 4-liner down there)
    # however, see https://github.com/lefnire/habitrpg/pull/226#discussion_r2810391

    id = $(e.target).parents('li.task').attr('data-id')
    return unless id?

    task = user.at "tasks.#{id}"
    type = task.get('type')

    history = task.get('history')
    if history and history.length>2
      # prevent delete-and-recreate hack on red tasks
      if task.get('value') < 0
        result = confirm("Are you sure? Deleting this task will hurt you (to prevent deleting, then re-creating red tasks).")
        if result != true
          return # Cancel. Don't delete, don't hurt user 
        else
          task.set('type','habit') # hack to make sure it hits HP, instead of performing "undo checkbox"
          scoring.score(id, direction:'down')
          
      # prevent accidently deleting long-standing tasks
      else
        result = confirm("Are you sure you want to delete this task?")
        return if result != true
      
    #TODO bug where I have to delete from _users.tasks AND _{type}List, 
    # fix when query subscriptions implemented properly
    $('[rel=tooltip]').tooltip('hide')

    ids = user.get("idLists.#{type}")
    ids.splice(ids.indexOf(id),1)
    user.del('tasks.'+id)
    user.set("idLists.#{type}", ids)

    
  exports.clearCompleted = (e, el) ->
    todoIds = user.get('idLists.todo')
    removed = false
    _.each model.get('_todoList'), (task) ->
      if task.completed
        removed = true
        user.del('tasks.'+task.id)
        todoIds.splice(todoIds.indexOf(task.id), 1)
    if removed
      user.set('idLists.todo', todoIds)
      
  exports.toggleDay = (e, el) ->
    task = model.at(e.target)
    if /active/.test($(el).attr('class')) # previous state, not current
      task.set('repeat.' + $(el).attr('data-day'), false) 
    else
      task.set('repeat.' + $(el).attr('data-day'), true)
    
  exports.toggleTaskEdit = (e, el) ->
    hideId = $(el).attr('data-hide-id')
    toggleId = $(el).attr('data-toggle-id')
    $(document.getElementById(hideId)).hide()
    $(document.getElementById(toggleId)).toggle()

  exports.toggleChart = (e, el) ->
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
      #TODO use current background color: $(el).css('background-color), but convert to hex (see http://goo.gl/ql5pR)
      backgroundColor: 'whiteSmoke'
    }

    chart = new google.visualization.LineChart(document.getElementById( chartSelector ))
    chart.draw(data, options)
    
  exports.score = (e, el, next) ->
    direction = $(el).attr('data-direction')
    direction = 'up' if direction == 'true/'
    direction = 'down' if direction == 'false/'
    task = model.at $(el).parents('li')[0]
    scoring.score(task.get('id'), direction)

  revive = (batch) ->
    # Reset stats
    batch.set 'stats.hp', 50
    batch.set 'stats.lvl', 1
    batch.set 'stats.gp', 0
    batch.set 'stats.exp', 0

    # Reset items
    batch.set 'items.armor', 0
    batch.set 'items.weapon', 0

    # Reset item store
    items.updateStore(model)

  exports.revive = (e, el) ->
    batch = new schema.BatchUpdate(model)
    batch.startTransaction()
    revive(batch)
    batch.commit()

  exports.reset = (e, el) ->
    batch = new schema.BatchUpdate(model)
    batch.startTransaction()
    taskTypes = ['habit', 'daily', 'todo', 'reward']
    batch.set 'tasks', {}
    _.each taskTypes, (type) -> batch.set "idLists.#{type}", []
    batch.set 'balance', 2 if user.get('balance') < 2 #only if they haven't manually bought tokens
    revive(batch)
    batch.commit()
    browser.resetDom(model)

  exports.closeKickstarterNofitication = (e, el) ->
    user.set('flags.kickstarter', 'hide')

  exports.customizeGender = (e, el) ->
    user.set 'preferences.gender', $(el).attr('data-value')

  exports.customizeHair = (e, el) ->
    user.set 'preferences.hair', $(el).attr('data-value')

  exports.customizeSkin = (e, el) ->
    user.set 'preferences.skin', $(el).attr('data-value')

  exports.customizeArmorSet = (e, el) ->
    user.set 'preferences.armorSet', $(el).attr('data-value')


