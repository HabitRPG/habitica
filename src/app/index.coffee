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

      # tasks:
        # {type: 'habit', text: 'Take the stairs', notes: 'Test Notes', value: 0, up: true, down: true},
        # {type: 'daily', text: 'Go to the gym', notes: '', value: 0, completed: false },
        # {type: 'todo', text: 'Make a doctor appointment', notes: '', value: 0, completed: false },
        # {type: 'reward', text: '1 TV episode', notes: '', value: 20 }

get '/', (page, model) ->
  # Render page if a userId is already stored in session data
  userId = model.get '_session.userId'
  # Otherwise, select a new userId and initialize user
  if !userId
    userId = newUser(model, userId)

  userQ = "users.#{userId}"
  model.subscribe userQ,\
  model.query("#{userQ}.tasks").where('type').equals('habit'),\ 
  model.query("#{userQ}.tasks").where('type').equals('daily'),\
  model.query("#{userQ}.tasks").where('type').equals('todo'),\
  model.query("#{userQ}.tasks").where('type').equals('reward'),\
  (err, user, habits, dailys, todos, rewards) ->
    
    model.ref '_user', user
    
    model.refList "_habitList", habits.path(), "_user.habitIds"
    model.refList "_dailyList", dailys.path(), "_user.dailyIds"
    model.refList "_todoList", todos.path(), "_user.todoIds"
    model.refList "_rewardList", rewards.path(), "_user.rewardIds"
      
    # http://tibia.wikia.com/wiki/Formula
    model.fn '_tnl', '_user.lvl', (lvl) -> 50 * Math.pow(lvl, 2) - 150 * lvl + 200

    page.render()

## VIEW HELPERS ##
view.fn 'taskClasses', (type, completed, value) ->
  classes = type
  classes += " completed" if completed
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
    
  #TODO: Implement this for cron 
  # # Note: Set 12am daily cron for this
  # # At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
  # # For incomplete Dailys, deduct experience  
  # def self.clear_done
    # Habit.where('habit_type in (2,3)').collect do |h|
      # unless h.done
        # value = (h.score < 0) ? (( -0.1 * h.score + 1 ) * -1) : (( 0.9 ** h.score ) * -1)
        # # Deduct experience for missed Daily tasks, 
        # # but not for Todos (just increase todo's value)
        # if (h.habit_type==2)
          # h.user.hp += value
          # h.user.save
        # end
        # h.score += value
      # end
      # h.done = false if (h.habit_type==2)
      # h.save
    # end
  # end   
     
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

    tnl = model.at('_tnl').get()
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
