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
_ = require('underscore')


# ========== ROUTES ==========

get '/:uid?', (page, model, {uid}, next) ->

  # Legacy - won't be allowing PURL auth in the future. Remove once password auth in place
  # Creates stink here too because :uid accounts for every single-param path (terms, privacy, etc)
  if uid
    if require('guid').isGuid(uid)
      return page.redirect('/users/'+uid)
    else
      return next()

  # Force SSL
  req = page._res.req
  if req.headers['x-forwarded-proto']!='https' and process.env.NODE_ENV=='production'
    return page.redirect 'https://' + req.headers.host + req.url

  sess = model.session
  model.set '_userId', sess.userId
  model.subscribe "users.#{sess.userId}", (err, user) ->
    # Set variables which are passed from the controller to the view
    model.ref '_user', user

    #FIXME remove this eventually, part of user schema
    user.setNull 'balance', 2
    # support legacy Everyauth schema (now using derby-auth, Passport)
    if username = user.get('auth.local.username')
      model.set('_loginName', username)
    else if fb = user.get('auth.facebook')
      model.set('_loginName', if fb._raw then "#{fb.name.givenName} #{fb.name.familyName}" else fb.name)

    # Setup Item Store
    model.set '_items'
      armor: content.items.armor[parseInt(user.get('items.armor')) + 1]
      weapon: content.items.weapon[parseInt(user.get('items.weapon')) + 1]
      potion: content.items.potion
      reroll: content.items.reroll
      
    # Setup Task Lists
    model.refList "_habitList", "_user.tasks", "_user.habitIds"
    model.refList "_dailyList", "_user.tasks", "_user.dailyIds"
    model.refList "_todoList", "_user.tasks", "_user.todoIds"
    model.refList "_completedList", "_user.tasks", "_user.completedIds"
    model.refList "_rewardList", "_user.tasks", "_user.rewardIds"

    # FIXME temporary hack to remove duplicates. Need to figure out why they're being produced
    _.each ['habitIds','dailyIds','todoIds','rewardIds'], (path) ->
      user.set path, _.uniq(user.get(path))

    # Setup Model Functions
    model.fn '_user._tnl', '_user.stats.lvl', (lvl) ->
      # see https://github.com/lefnire/habitrpg/issues/4
      # also update in scoring.coffee. TODO create a function accessible in both locations 
      (lvl*100)/5
      
    # Render Page    
    page.render()  

# ========== CONTROLLER FUNCTIONS ==========

ready (model) ->
  require('./loadJavascripts')(model)

  # Setup model in scoring functions
  scoring.setModel(model)
  
  $('[rel=tooltip]').tooltip()
  $('[rel=popover]').popover()
  # FIXME: this isn't very efficient, do model.on set for specific attrs for popover 
  model.on 'set', '*', ->
    $('[rel=tooltip]').tooltip()
    $('[rel=popover]').popover()
  
  unless (model.get('_mobileDevice') == true) #don't do sortable on mobile
    # Make the lists draggable using jQuery UI
    # Note, have to setup helper function here and call it for each type later
    # due to variable binding of "type"
    setupSortable = (type) ->
      $("ul.#{type}s").sortable
        dropOnEmpty: false
        cursor: "move"
        items: "li"
        opacity: 0.4
        scroll: true
        axis: 'y'
        update: (e, ui) ->
          item = ui.item[0]
          domId = item.id
          id = item.getAttribute 'data-id'
          to = $("ul.#{type}s").children().index(item)
          # Use the Derby ignore option to suppress the normal move event
          # binding, since jQuery UI will move the element in the DOM.
          # Also, note that refList index arguments can either be an index
          # or the item's id property
          model.at("_#{type}List").pass(ignore: domId).move {id}, to
    setupSortable(type) for type in ['habit', 'daily', 'todo', 'reward']
  
  tour = new Tour()
  for step in content.tourSteps
    tour.addStep
      html: true
      element: step.element
      title: step.title
      content: step.content
      placement: step.placement
  tour.start()

  model.on 'set', '_user.tasks.*.completed', (i, completed, previous, isLocal, passed) ->
    return if passed? && passed.cron # Don't do this stuff on cron
    direction = () ->
      return 'up' if completed==true and previous == false
      return 'down' if completed==false and previous == true
      throw new Error("Direction neither 'up' nor 'down' on checkbox set.")
      
    # Score the user based on todo task
    task = model.at("_user.tasks.#{i}")
    scoring.score(i, direction())
    
    # Then move the todos to/from _todoList/_completedList
    if task.get('type') == 'todo'
      [from, to] = if (direction()=='up') then ['todo', 'completed'] else ['completed', 'todo']
      [from, to] = ["_user.#{from}Ids", "_user.#{to}Ids"]
      # Remove from source (just remove the id from id-list)
      fromIds = model.get(from)
      fromIds.splice(fromIds.indexOf(i), 1)
      model.set from, fromIds
      # Push to target (just the id to id-list)
      toIds = model.get(to)
      toIds.push i
      model.set to, toIds
    
  exports.addTask = (e, el, next) ->
    type = $(el).attr('data-task-type')
    list = model.at "_#{type}List"
    newModel = model.at('_new' + type.charAt(0).toUpperCase() + type.slice(1))
    # Don't add a blank todo
    return unless text = view.escapeHtml newModel.get()
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
    task = model.at(e.target)
    
    history = task.get('history')
    if history and history.length>2
      # prevent delete-and-recreate hack on red tasks
      if task.get('value') < 0
        result = confirm("Are you sure? Deleting this task will hurt you (to prevent deleting, then re-creating red tasks).")
        if result != true
          return # Cancel. Don't delete, don't hurt user 
        else
          task.set('type','habit') # hack to make sure it hits HP, instead of performing "undo checkbox"
          scoring.score(task.get('id'), direction:'down')
          
      # prevent accidently deleting long-standing tasks
      else
        result = confirm("Are you sure you want to delete this task?")
        return if result != true
      
    #TODO bug where I have to delete from _users.tasks AND _{type}List, 
    # fix when query subscriptions implemented properly
    $('[rel=tooltip]').tooltip('hide')
    model.del('_user.tasks.'+task.get('id'))
    task.remove()
    
  exports.clearCompleted = (e, el) ->
    _.each model.get('_completedList'), (task) ->
      model.del('_user.tasks.'+task.id)
      model.set('_user.completedIds', [])
      
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
      date = new Date(obj.date)
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
      model.set '_items.armor', content.items.armor[parseInt(index) + 1]
    else if type == 'weapon'
      user.set 'items.weapon', index
      model.set '_items.weapon', content.items.weapon[parseInt(index) + 1]
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
    
  exports.revive = (e, el) ->
    stats = model.at '_user.stats'
    stats.set 'hp', 50; stats.set 'lvl', 1; stats.set 'exp', 0; stats.set 'money', 0
    model.set '_user.items.armor', 0
    model.set '_user.items.weapon', 0
    model.set '_items.armor', content.items.armor[1]
    model.set '_items.weapon', content.items.weapon[1]
    model.set '_user.balance', (model.get('_user.balance') - 0.50)

  exports.reset = (e, el) ->
    model.set '_user.tasks', {}
    _.each ['habit', 'daily', 'todo', 'completed', 'reward'], (type) ->
      model.set "_user.#{type}Ids", []
      model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"
    model.set('_user.stats.hp', 50)
    model.set('_user.stats.money', 0)
    model.set('_user.stats.exp', 0)
    model.set('_user.stats.lvl', 1)


  # ========== CRON ==========
  
  # FIXME seems can't call scoring.cron() instantly, have to call after some time (2s here)
  # Doesn't do anything otherwise. Don't know why... model not initialized enough yet?   
  setTimeout scoring.cron, 1000 # Run once on refresh
  setInterval scoring.cron, 3600000 # Then run once every hour

  require('../server/private').app(exports, model)
