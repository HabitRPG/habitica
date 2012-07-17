derby = require('derby')
{get, view, ready} = derby.createApp module
derby.use require('derby-ui-boot')
derby.use(require('../../ui'))
content = require('./content')
Guid = require('guid')

## VIEW HELPERS ##
view.fn 'taskClasses', (type, completed, value, hideCompleted) ->
  #TODO figure out how to just pass in the task model, so i can access all these properties from one object
  classes = type
  classes += " completed" if completed
  if type == 'todo'
    classes += " hide" if (hideCompleted and completed) or (!hideCompleted and !completed)
    
  switch
    when value<-8 then classes += ' color-worst'
    when value>=-8 and value<-5 then classes += ' color-worse'
    when value>=-5 and value<-1 then classes += ' color-bad' 
    when value>=-1 and value<1 then classes += ' color-neutral'
    when value>=1 and value<5 then classes += ' color-good' 
    when value>=5 and value<10 then classes += ' color-better' 
    when value>=10 then classes += ' color-best'
  return classes
    
view.fn "percent", (x, y) ->
  x=1 if x==0
  Math.round(x/y*100)
    
view.fn "round", (num) ->
  Math.round num
  
view.fn "gold", (num) -> 
  if num
    return num.toFixed(1).split('.')[0]
  else
    return "0"

view.fn "silver", (num) -> 
  if num
    num.toFixed(1).split('.')[1]
  else
    return "0" 
  
## ROUTES ##

debug = (obj, message) ->
  console.log obj, "[debug] #{message}"

get '/:userId?', (page, model, {userId}) ->
    
  model.subscribe "users", (err, users) ->
    
     # Previously saved session (eg, http://localhost/{guid}) (temporary solution until authentication built)
    debuggingUsers = (parseInt(userId) < 40) #these are users created before guid was in use, need to convert them to guid and get rid of this 
    if userId? and (users.get(userId) or debuggingUsers)
      model.set '_userId', userId
      
    # Current browser session
    # The session middleware will assign a _userId automatically
    # Render page if a userId is already stored in session data
    userId = model.get '_userId'

    unless model.get "users.#{userId}"
      # Otherwise, select a new userId and initialize user
      newUser = {
        stats: { money: 0, exp: 0, lvl: 1, hp: 50 }
        items: { itemsEnabled: false, armor: 0, weapon: 0 }
        tasks: {}, habitIds: [], dailyIds: [], todoIds: [], rewardIds: []
      }
      for task in content.defaultTasks
        guid = Guid.raw()
        newUser.tasks[guid] = task
        switch task.type
          when 'habit' then newUser.habitIds.push guid 
          when 'daily' then newUser.dailyIds.push guid 
          when 'todo' then newUser.todoIds.push guid 
          when 'reward' then newUser.rewardIds.push guid 
      users.set userId, newUser, (err, path, value) ->
        debug {err:err, path:path, value:value}, 'new user'

    user = model.at("users.#{userId}")
    model.ref '_user', user
    
    # Store
    model.set '_items'
      armor: content.items.armor[parseInt(user.get('items.armor')) + 1]
      weapon: content.items.weapon[parseInt(user.get('items.weapon')) + 1]
      potion: content.items.potion
      reroll: content.items.reroll

    # http://tibia.wikia.com/wiki/Formula 
    model.fn '_tnl', '_user.stats.lvl', (lvl) -> 50 * Math.pow(lvl, 2) - 150 * lvl + 200
    
    # Default Tasks
    model.refList "_habitList", "_user.tasks", "_user.habitIds"
    model.refList "_dailyList", "_user.tasks", "_user.dailyIds"
    model.refList "_todoList", "_user.tasks", "_user.todoIds"
    model.refList "_rewardList", "_user.tasks", "_user.rewardIds"
      
    page.render()  

## CONTROLLER FUNCTIONS ##

ready (model) ->
  
  model.set '_purl', window.location.origin + '/' + model.get('_userId')
  
  $('[rel=popover]').popover()
  #TODO: this isn't very efficient, do model.on set for specific attrs for popover 
  model.on 'set', '*', ->
    $('[rel=popover]').popover()
  
  model.set('_hideCompleted', true)
  $('a[data-toggle="tab"]').on 'shown', (e) ->
    #see http://twitter.github.com/bootstrap/javascript.html#tabs 
    hideCompleted = if $(e.target).attr('href') == '#tab1' then true else false  
    model.set('_hideCompleted', hideCompleted)
      
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
      element: step.element
      title: step.title
      content: step.content
      placement: step.placement
  tour.start()
        
  #TODO: implement this for completed tab
  # clearCompleted: ->
    # _.each @options.habits.doneTodos(), (todo) ->
      # todo.destroy()
    # @render()
    # return false
    
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

      when 'daily', 'todo'
        list.push {type: type, text: text, notes: '', value: 0, completed: false }

        # list.on 'set', '*.completed', (i, completed, previous, isLocal) ->
          # # Move the item to the bottom if it was checked off
          # list.move i, -1  if completed && isLocal

  exports.del = (e, el) ->
    # Derby extends model.at to support creation from DOM nodes
    task = model.at(e.target)
    #TODO bug where I have to delete from _users.tasks AND _{type}List, 
    # fix when query subscriptions implemented properly
    model.del('_user.tasks.'+task.get('id'))
    task.remove()
    
  exports.toggleTaskEdit = (e, el) ->
    task = model.at $(el).parents('li')[0]
    # $( document.getElementById(task.get('id')+'-chart') ).hide()
    # $( document.getElementById(task.get('id')+'-edit') ).toggle()

  exports.toggleChart = (e, el) ->
    hideSelector = $(el).attr('data-hide-selector')
    chartSelector = $(el).attr('data-chart-selector')
    historyPath = $(el).attr('data-history-path')
    $(document.getElementById(hideSelector)).hide()
    $(document.getElementById(chartSelector)).toggle()
    
    matrix = [['Date', 'Score']]
    for obj in model.get(historyPath)
      date = new Date(obj.date)
      readableDate = date.toISOString() #use toDateString() when done debugging
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
    else if type == 'reroll'
      for taskId of user.get('tasks')
        task = model.at('_user.tasks.'+taskId)
        task.set('value', 0) unless task.get('type')=='reward' 
        
  # Setter for user.stats: handles death, leveling up, etc
  exports.updateStats = updateStats = (user, stats) ->
    if stats.hp?
      # game over
      if stats.hp < 0
        user.set 'stats.lvl', 0 # this signifies dead
      else
        user.set 'stats.hp', stats.hp
  
    if stats.exp?
      # level up & carry-over exp
      tnl = model.get '_tnl'
      if stats.exp >= tnl
        stats.exp -= tnl
        user.set 'stats.lvl', user.get('stats.lvl') + 1
      if !user.get('items.itemsEnabled') and stats.exp >=50
        user.set 'items.itemsEnabled', true
        $('ul.items').popover
          title: content.items.unlockedMessage.title
          placement: 'left'
          trigger: 'manual'
          html: true
          content: "<div class='item-store-popover'>\
            <img src='/img/BrowserQuest/chest.png' />\
            #{content.items.unlockedMessage.content} <a href='#' onClick=\"$('ul.items').popover('hide');return false;\">[Close]</a>\
            </div>"
        $('ul.items').popover 'show'

      user.set 'stats.exp', stats.exp
      
    if stats.money?
      money = 0.0 if (!money? or money<0)
      user.set 'stats.money', stats.money
      
  # Calculates Exp modification based on weapon & lvl
  expModifier = (value) ->
    user = model.at '_user'
    dmg = user.get('items.weapon') * .03 # each new weapon adds an additional 3% experience
    dmg += user.get('stats.lvl') * .03 # same for lvls
    modified = value + (value * dmg)
    return modified

  # Calculates HP-loss modification based on armor & lvl
  hpModifier = (value) ->
    user = model.at '_user'
    ac = user.get('items.armor') * .03 # each new armor blocks an additional 3% damage
    ac += user.get('stats.lvl') * .03 # same for lvls
    modified = value - (value * ac)
    return modified
      
  exports.vote = (e, el, next) ->
    direction = $(el).attr('data-direction')
    direction = 'up' if direction == 'true/'
    direction = 'down' if direction == 'false/'
    
    #TODO this should be model.at(el), shouldn't have to find parent
    task = model.at $(el).parents('li')[0]
    user = model.at '_user'
    # For negative values, use a line: something like y=-.1x+1
    # For positibe values, taper off with inverse log: y=.9^x
    # Would love to use inverse log for the whole thing, but after 13 fails it hits infinity
    sign = if (direction == "up") then 1 else -1
    value = task.get('value')
    delta = 0
    if value < 0
      delta = (( -0.1 * value + 1 ) * sign)
    else
      delta = (( Math.pow(0.9, value) ) * sign)

    # Don't adjust values for rewards, or for habits that don't have both + and -
    adjustvalue = (task.get('type') != 'reward')
    if (task.get('type') == 'habit') and (task.get("up")==false or task.get("down")==false)
      adjustvalue = false
    value += delta if adjustvalue

    # up/down -voting as checkbox & assigning as completed, 2 birds one stone
    completed = task.get("completed")
    if task.get('type') != 'habit'
      completed = true if direction=="up"
      completed = false if direction=="down"
    else
      # Add habit value to habit-history (if different)
      task.push 'history', { date: new Date(), value: value } if task.get('value') != value
    task.set('value', value)
    task.set('completed', completed)

    # Update the user's status
    [money, hp, exp, lvl] = [user.get('stats.money'), user.get('stats.hp'), user.get('stats.exp'), user.get('stats.lvl')]

    if task.get('type') == 'reward'
      # purchase item
      money -= task.get('value')
      # if too expensive, reduce health & zero money
      if money < 0
        hp += money # hp - money difference
        money = 0

    # If positive delta, add points to exp & money
    # Only take away mony if it was a mistake (aka, a checkbox)
    if delta > 0 or (task.get('type') == 'daily'  or task.get('type') == 'todo')
      exp += expModifier(delta)
      money += delta
    # Deduct from health (rewards case handled above)
    else if task.get('type') != 'reward'
      hp += hpModifier(delta)

    updateStats(user, {hp: hp, exp: exp, money: money})
    
  # Note: Set 12am daily cron for this
  # At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
  # For incomplete Dailys, deduct experience
  #TODO: remove from exports when cron implemented  
  exports.endOfDayTally = endOfDayTally = (e, el) ->
    # users = model.at('users') #TODO this isn't working, iterate over all users
    # for user in users
    user = model.at '_user'
    todoTally = 0
    for key of model.get '_user.tasks'
      task = model.at "_user.tasks.#{key}"
      [type, value, completed] = [task.get('type'), task.get('value'), task.get('completed')] 
      if type == 'todo' or type == 'daily'
        unless completed
          value += if (value < 0) then (( -0.1 * value + 1 ) * -1) else (( Math.pow(0.9,value) ) * -1)
          task.set('value', value)
          # Deduct experience for missed Daily tasks, 
          # but not for Todos (just increase todo's value)
          if (type == 'daily')
            hp = user.get('stats.hp') + hpModifier(value)
            updateStats user, { hp: hp }
        if type == 'daily'
          task.push "history", { date: new Date(), value: value }
        else
          absVal = if (completed) then Math.abs(value) else value
          todoTally += absVal
        task.set('completed', false) if type == 'daily'
    model.push '_user.history.todos', { date: new Date(), value: todoTally }
    
    # tally experience
    expTally = user.get 'stats.exp'
    lvl = 0 #iterator
    while lvl < (user.get('stats.lvl')-1)
      lvl++
      expTally += 50 * Math.pow(lvl, 2) - 150 * lvl + 200
    model.push '_user.history.exp',  { date: new Date(), value: expTally }
    
     
  #TODO: remove when cron implemented 
  exports.poormanscron = poormanscron = ->
    model.setNull('_user.lastCron', new Date())
    lastCron = new Date( (new Date(model.get('_user.lastCron'))).toDateString() ) # calculate as midnight
    today = new Date((new Date).toDateString()) # calculate as midnight
    DAY = 1000 * 60 * 60  * 24
    daysPassed = Math.floor((today.getTime() - lastCron.getTime()) / DAY)
    if daysPassed > 0
      model.set('_user.lastCron', today) # reset cron
      for n in [1..daysPassed]
        console.log {today: today, lastCron: lastCron, daysPassed: daysPassed, n:n}, "[debug] Cron (#{today}, #{n})"
        endOfDayTally()
  poormanscron() # Run once on refresh
  setInterval (-> # Then run once every hour
    poormanscron()
  ), 3600000
  
  exports.revive = (e, el) ->
    stats = model.at '_user.stats'
    stats.set 'hp', 50; stats.set 'lvl', 1; stats.set 'exp', 0; stats.set 'money', 0
    model.set '_user.items.armor', 0
    model.set '_user.items.weapon', 0
    model.set '_items.armor', content.items.armor[1]
    model.set '_items.weapon', content.items.weapon[1]
    
  ## SHORTCUTS ##

  exports.shortcuts = (e) ->
    return unless e.metaKey || e.ctrlKey
    code = e.which
    return unless command = (switch code
      when 66 then 'bold'           # Bold: Ctrl/Cmd + B
      when 73 then 'italic'         # Italic: Ctrl/Cmd + I
      when 32 then 'removeFormat'   # Clear formatting: Ctrl/Cmd + Space
      when 220 then 'removeFormat'  # Clear formatting: Ctrl/Cmd + \
      else null
    )
    document.execCommand command, false, null
    e.preventDefault() if e.preventDefault
    return false

  # Tell Firefox to use elements for styles instead of CSS
  # See: https://developer.mozilla.org/en/Rich-Text_Editing_in_Mozilla
  document.execCommand 'useCSS', false, true
  document.execCommand 'styleWithCSS', false, false
