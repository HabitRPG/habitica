derby = require('derby')
{get, view, ready} = derby.createApp module
derby.use require('derby-ui-boot')
derby.use(require('../../ui'))

## ROUTES ##

newUser = (model, userId) ->
  # TODO this used to be model.async.incr, revisit this
  model.incr 'configs.1.nextUserId', (err, userId) ->
    model.set '_session.userId', userId
    model.set "users.#{userId}",
      name: 'User ' + userId
      money: 0
      exp: 0
      lvl: 1
      hp: 50

get '/', (page, model) ->
  # Render page if a userId is already stored in session data
  userId = model.get '_session.userId'
  # Otherwise, select a new userId and initialize user
  if !userId
    userId = newUser(model, userId)

  model.setNull '_user.tasks', []
  model.subscribe "users.#{userId}", (err, user) -> 
    model.ref '_user', user
    model.refList "_habitList", "_user.tasks", "_user.habitIds"
    model.refList "_dailyList", "_user.tasks", "_user.dailyIds"
    model.refList "_todoList", "_user.tasks", "_user.todoIds"
    model.refList "_rewardList", "_user.tasks", "_user.rewardIds"
    unless model.get('_user.tasks')
      starter_habits = [
        {type: 'habit', text: 'Stairs', notes: '', value: 0, up: true, down: true}
        {type: 'habit', text: 'Diet', notes: '', value: 0, up: true, down: true}
        {type: 'habit', text: 'Ticket (Workflowy, Pivotal)', notes: '', value: 0, up: true, down: false}
        {type: 'habit', text: 'Temptation Control', notes: '* meditate for 1 minute, visualize<br/>* positive, specific, present self-talk<br/>* do first task', value: 0, up: true, down: false}
        {type: 'habit', text: 'Propose, not ask', notes: '', value: 0, up: true, down: false}
        {type: 'habit', text: 'Focus', notes: '', value: 0, up: false, down: true}
        {type: 'habit', text: 'Facebook/RSS out of turn', notes: '', value: 0, up: false, down: true}
        {type: 'habit', text: 'Negative Talk', notes: '', value: 0, up: false, down: true}
        {type: 'habit', text: 'Exaggeration', notes: '', value: 0, up: false, down: true}
        {type: 'habit', text: 'Insult Self', notes: '', value: 0, up: false, down: true}
        {type: 'habit', text: 'Other', notes: '* Nail-biting<br/>* Posture<br/>* Visualize / Meditate to sleep<br/>* Smile/eye-gaze', value: 0, up: false, down: false}
      ]
      starter_dailys = [
        {type: 'daily', text: 'Review Pivotal, Asana, Workflowy', notes: '', value: 0, completed: false }
        {type: 'daily', text: 'TMJ Exercise', notes: '', value: 0, completed: false }
        {type: 'daily', text: 'Anki (20m)', notes: '', value: 0, completed: false }
        {type: 'daily', text: '30m Code Reading', notes: '', value: 0, completed: false }
        {type: 'daily', text: 'Google News', notes: '', value: 0, completed: false }
        {type: 'daily', text: 'Mint', notes: '', value: 0, completed: false }
        {type: 'daily', text: 'Anki (new / review)', notes: '', value: 0, completed: false }
        {type: 'daily', text: 'Check Meetup', notes: '', value: 0, completed: false }
        {type: 'daily', text: 'Read it later', notes: '', value: 0, completed: false }
        {type: 'daily', text: 'RSS (Drupal)', notes: '', value: 0, completed: false }
        {type: 'daily', text: 'RSS (Other)', notes: '', value: 0, completed: false }
        {type: 'daily', text: 'Lunch TODO', notes: '', value: 0, completed: false }
        {type: 'daily', text: 'Exercise', notes: '', value: 0, completed: false }
        {type: 'daily', text: 'Read (45m)', notes: '', value: 0, completed: false }
        {type: 'daily', text: 'Night TODO', notes: '', value: 0, completed: false }
        {type: 'daily', text: 'Brain Game', notes: '', value: 0, completed: false }
        {type: 'daily', text: '1h Personal Project', notes: '', value: 0, completed: false }
      ]
      starter_todos = [
        {type: 'todo', text: 'Print insurance request card', notes: '"travel" tag', value: 0, completed: false }
        {type: 'todo', text: 'VPM', notes: '', value: 0, completed: false }
        {type: 'todo', text: 'set STO as PTO or makup time with joshua (email)', notes: '', value: 0, completed: false }
        {type: 'todo', text: 'ocdevel ads', notes: '', value: 0, completed: false }
        {type: 'todo', text: 'mail', notes: '', value: 0, completed: false }
        {type: 'todo', text: 'krav', notes: '', value: 0, completed: false }
        {type: 'todo', text: 'rubber cement', notes: '', value: 0, completed: false }
        {type: 'todo', text: 'bike', notes: '', value: 0, completed: false }
        {type: 'todo', text: 'clean ~/.ievms', notes: '', value: 0, completed: false }
        {type: 'todo', text: 'http://www.php-debug.com/www/', notes: '', value: 0, completed: false }
        {type: 'todo', text: 'make sure IRA is setup for auto distribution', notes: '', value: 0, completed: false }
      ]
      starter_rewards = [
        {type: 'reward', text: 'TV Show', notes: '', value: 20 }
        {type: 'reward', text: '1h Novel', notes: '', value: 10 }
        {type: 'reward', text: 'Shop', notes: '', value: 10 }
        {type: 'reward', text: 'Junk Food', notes: '', value: 10 }
        {type: 'reward', text: '9gag', notes: '', value: 5 }
        {type: 'reward', text: 'Coffee', notes: '', value: 5 }
      ]
      
      model.push '_habitList', habit for habit in starter_habits
      model.push '_dailyList', daily for daily in starter_dailys  
      model.push '_todoList',  todo for todo in starter_todos
      model.push '_rewardList', reward for reward in starter_rewards
      
    # http://tibia.wikia.com/wiki/Formula
    model.fn '_tnl', '_user.lvl', (lvl) -> 50 * Math.pow(lvl, 2) - 150 * lvl + 200
    
    poormanscron(model)

    page.render()
    
#TODO: Implement this for cron 
poormanscron = (model) ->
  lastCron = model.get('_user.lastCron')
  if lastCron
    DAY = 1000 * 60 * 60  * 24
    today = new Date()
    days_passed = Math.round((today.getTime() - lastCron.getTime()) / DAY)
    if days_passed > 0
      endOfDayTally(model) for[]in length:days_passed
      lastCron = new Date()
  else
    lastCron = new Date()
  model.set('_user.lastCron', lastCron)
  
endOfDayTally = (model) ->
# Note: Set 12am daily cron for this
# At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
# For incomplete Dailys, deduct experience  
  # users = model.at('users') #TODO this isn't working, iterate over all users
  # for user in users
  user = model.at '_user'
  for key of model.get '_user.tasks'
    task = model.at "_user.tasks.#{key}"
    [type, value, completed] = [task.get('type'), task.get('value'), task.get('completed')] 
    if type == 'todo' or type == 'daily'
      unless completed
        value += if (value < 0) then (( -0.1 * value + 1 ) * -1) else (( Math.pow(0.9,value) ) * -1)
        task.set('value', value)
        task.setNull 'history', []
        task.push "history", { date: new Date(), value: value }
        # Deduct experience for missed Daily tasks, 
        # but not for Todos (just increase todo's value)
        if (type == 'daily')
          user.set('hp', user.get('hp') + value)
          if user.get('hp') < 0
            #TODO this is implemented in exports.vote also, make it a user.on or something
            user.set('hp',50);user.set('lvl',1);user.set('exp',0)
      task.set('completed', false) if type == 'daily'

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
  num.toFixed(1).split('.')[0] if num

view.fn "silver", (num) -> 
  num.toFixed(1).split('.')[1] if num

## CONTROLLER FUNCTIONS ##

ready (model) ->
  
  #TODO remove this!!!!! dangerous temporary debugging helper
  window.model = model
  
  $('.task-notes').popover()
  
  model.set('_hideCompleted', true)
  $('a[data-toggle="tab"]').on 'shown', (e) ->
    #see http://twitter.github.com/bootstrap/javascript.html#tabs 
    hideCompleted = if $(e.target).attr('href') == '#tab1' then true else false  
    model.set('_hideCompleted', hideCompleted)
      
  lists = [ 'habit', 'daily', 'todo', 'reward']

  for type in lists
    list = model.at "_#{type}List"

    # Make the list draggable using jQuery UI
    ul = $("ul.#{type}s")
    ul.sortable
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
        to = ul.children().index(item)
        # Use the Derby ignore option to suppress the normal move event
        # binding, since jQuery UI will move the element in the DOM.
        # Also, note that refList index arguments can either be an index
        # or the item's id property
        list.pass(ignore: domId).move {id}, to
        
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

  exports.del = (e) ->
    # Derby extends model.at to support creation from DOM nodes
    model.at(e.target).remove()
    
  exports.toggleEdit = (e, el) ->
    selector = $(el).attr('data-selector')
    if selector.charAt(0) == '$'
      selector = '\\' + selector
    $('#'+selector).toggle()

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
    task.set('value', value)
    task.set('completed', completed)

    # Update the user's status
    [money, hp, exp, lvl] = [user.get('money'), user.get('hp'), user.get('exp'), user.get('lvl')]

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
      exp += delta
      money += delta
    # Deduct from health (rewards case handled above)
    else if task.get('type') != 'reward'
      hp += delta

    tnl = model.get '_tnl'
    # level up & carry-over exp
    if exp >= tnl
      exp -= tnl
      lvl += 1

    # game over
    if hp < 0
      [hp, lvl, exp] = [50, 1, 0]

    user.set('money', money)
    user.set('hp', hp)
    user.set('exp', exp)
    user.set('lvl', lvl)
    #[user.money, user.hp, user.exp, user.lvl] = [money, hp, exp, lvl]
    
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
