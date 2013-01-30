derby = require 'derby'
{get, view, ready} = derby.createApp module
derby.use require 'derby-ui-boot'
derby.use require('../../ui')
derby.use require('derby-auth/components');

# Custom requires
moment = require('moment')
content = require './content'
scoring = require './scoring'
schema = require './schema'
helpers = require './helpers'
helpers.viewHelpers view
browser = require './browser'
_ = require('underscore')

setupListReferences = (model) ->
  taskTypes = ['habit', 'daily', 'todo', 'reward']
  _.each taskTypes, (type) ->  model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"

setupModelFns = (model) ->
  model.fn '_user._tnl', '_user.stats.lvl', (lvl) ->
    # see https://github.com/lefnire/habitrpg/issues/4
    # also update in scoring.coffee. TODO create a function accessible in both locations
    (lvl*100)/5

  model.fn '_user._armor', '_user.items.armor', '_user.preferences.gender', (armor, gender) ->
    if gender == 'f'
      str = "armor#{armor}_f"
      if parseInt(armor) > 1
        str += '_v1' #TODO implement different version
      return "#{str}.png"
    else
      "armor#{armor}_m.png"

# ========== ROUTES ==========

get '/', (page, model, next) ->
  # temporary view variables, so we don't call model.set() too fast
  _view = model.get '_view' || {}

  # Force SSL # NOTE handled by ngix now
  #req = page._res.req
  #if req.headers['x-forwarded-proto']!='https' and process.env.NODE_ENV=='production'
  #  return page.redirect 'https://' + req.headers.host + req.url

  #FIXME subscribing to this query causes "Fatal Error: Unauuthorized" after conncetion for a time (racer/lib/accessControl/accessControl.Store.js)
  #q = model.query('users').withId(model.session.userId)
  q = "users.#{model.session.userId}"
  model.subscribe q, (err, user) ->
    #user = result.at(0)
    model.ref '_user', user
    userObj = user.get()

    return page.redirect '/500.html' unless userObj? #this should never happen, but it is. Looking into it

    # support legacy Everyauth schema (now using derby-auth, Passport)
    if username = userObj.auth?.local?.username
      _view.loginName = username
    else if fb = userObj.auth?.facebook
      _view.loginName = if fb._raw then "#{fb.name.givenName} #{fb.name.familyName}" else fb.name

    # Setup Item Store
    items = userObj.items
    _view.items =
      armor: content.items.armor[parseInt(items?.armor || 0) + 1]
      weapon: content.items.weapon[parseInt(items?.weapon || 0) + 1]
      potion: content.items.potion
      reroll: content.items.reroll

    model.set '_view', _view

    ## Task List Cleanup
    # FIXME temporary hack to fix lists (Need to figure out why these are happening)
    # FIXME consolidate these all under user.listIds so we can set them en-masse
    _.each ['habit','daily','todo','reward'], (type) ->
      path = "#{type}Ids"

      # 1. remove duplicates
      # 2. restore missing zombie tasks back into list
      where = {type:type}
      taskIds =  _.pluck( _.where(userObj.tasks, where), 'id')
      union = _.union userObj[path], taskIds

      # 2. remove empty (grey) tasks
      preened = _.filter(union, (val) -> _.contains(taskIds, val))

      # There were indeed issues found, set the new list
      user.set(path, preened) if _.size(preened) != _.size(userObj[path])

    ## Notifiations
    unless userObj.notifications?.kickstarter?
      user.set('notifications.kickstarter', 'show')

    setupListReferences(model)
    setupModelFns(model)

    page.render()

# ========== CONTROLLER FUNCTIONS ==========

resetDom = (model) ->
  window.DERBY.app.dom.clear()
  view.render(model)
  setupModelFns(model)

ready (model) ->
  user = model.at('_user')

  #set cron immediately
  lastCron = user.get('lastCron')
  user.set('lastCron', +new Date) if (!lastCron or lastCron == 'new')

  # Setup model in scoring functions
  scoring.setModel(model)
  scoring.cron()

  # Load all the jQuery, Growl, Tour, etc
  browser.loadJavaScripts(model)
  browser.setupSortable(model)
  browser.setupTooltips(model)
  browser.setupTour(model)
  browser.setupGrowlNotifications(model) unless model.get('_view.mobileDevice')

  require('../server/private').app(exports, model)

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

    ids = user.get("#{type}Ids")
    ids.splice(ids.indexOf(id),1)
    user.del('tasks.'+id)
    user.set("#{type}Ids", ids)

    
  exports.clearCompleted = (e, el) ->
    todoIds = user.get('todoIds')
    removed = false
    _.each model.get('_todoList'), (task) ->
      if task.completed
        removed = true
        user.del('tasks.'+task.id)
        todoIds.splice(todoIds.indexOf(task.id), 1)
    if removed
      user.set('todoIds', todoIds)
      
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
    
  exports.buyItem = (e, el, next) ->
    user = model.at '_user'
    #TODO: this should be working but it's not. so instead, i'm passing all needed values as data-attrs
    # item = model.at(e.target)
    
    money = user.get 'stats.money'
    [type, value, index] = [ $(el).attr('data-type'), $(el).attr('data-value'), $(el).attr('data-index') ]
    
    return if money < value
    user.set 'stats.money', money - value
    if type == 'armor'
      user.set 'items.armor', index
      model.set '_view.items.armor', content.items.armor[parseInt(index) + 1]
    else if type == 'weapon'
      user.set 'items.weapon', index
      model.set '_view.items.weapon', content.items.weapon[parseInt(index) + 1]
    else if type == 'potion'
      hp = user.get 'stats.hp'
      hp += 15
      hp = 50 if hp > 50 
      user.set 'stats.hp', hp
  
  exports.score = (e, el, next) ->
    direction = $(el).attr('data-direction')
    direction = 'up' if direction == 'true/'
    direction = 'down' if direction == 'false/'
    task = model.at $(el).parents('li')[0]
    scoring.score(task.get('id'), direction)

  revive = (userObj, animateHp = false) ->
    # Reset stats
    userObj.stats.hp = 50 unless animateHp # if we're animating hp-reset, we'll set to 50 ourselves later in our functions
    userObj.stats.lvl = 1; userObj.stats.money = 0; userObj.stats.exp = 0

    # Reset items
    userObj.items.armor = 0; userObj.items.weapon = 0

    # Reset item store
    model.set '_view.items.armor', content.items.armor[1]
    model.set '_view.items.weapon', content.items.weapon[1]
    
  exports.revive = (e, el) ->
    userObj = user.get()
    revive(userObj, true)

    user.set 'stats', userObj.stats
    user.set 'items', userObj.items
    # Re-render (since we replaced objects en-masse, see https://github.com/lefnire/habitrpg/issues/80)
    resetDom(model)
    setTimeout (-> user.set 'stats.hp', 50), 0 # animate hp loss

  exports.reset = (e, el) ->
    userObj = user.get()
    taskTypes = ['habit', 'daily', 'todo', 'reward']
    userObj.tasks = {}
    _.each taskTypes, (type) -> userObj["#{type}Ids"] = []
    userObj.balance = 2 if userObj.balance < 2 #only if they haven't manually bought tokens
    revive(userObj, true)

    # Set new user
    model.set "users.#{userObj.id}", userObj
    resetDom(model)
    setTimeout (-> user.set 'stats.hp', 50), 0 # animate hp loss

  exports.closeKickstarterNofitication = (e, el) ->
    user.set('notifications.kickstarter', 'hide')

  exports.setMale = -> user.set('preferences.gender', 'm')
  exports.setFemale = -> user.set('preferences.gender', 'f')