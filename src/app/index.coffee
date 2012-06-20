{get, view, ready} = require('derby').createApp module

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

      habits:
        # TODO :{type: 'habit'} should be coded instead as a model function so as not to clutter the database
        0: {id: 0, type: 'habit', text: 'Take the stairs', notes: '', score: 0, up: true, down: true}
      habitIds: [0]

      dailys: # I know it's bad pluralization, but codes easier later
        0: {id: 0, type: 'daily', text: 'Go to the gym', notes: '', score: 0, completed: false }
      dailyIds: [0]
      
      todos:
        0: {id: 0, type: 'todo', text: 'Make a doctor appointment', notes: '', score: 0, completed: false }
      todoIds: [0]

      rewards:
        0: {id: 0, type: 'reward', text: '1 TV episode', notes: '', price: 20 }
      rewardIds: [0]
  

get '/', (page, model) ->
  # Render page if a userId is already stored in session data
  userId = model.get '_session.userId'
  # Otherwise, select a new userId and initialize user
  if !userId
    userId = newUser(model, userId)

  model.subscribe "users.#{userId}", (err, user) ->
    model.ref '_user', user
    
    # Setup "_todoList" for all the habit types
    lists = [ 'habit', 'daily', 'todo', 'reward']
    for type in lists
      ids = user.at "#{type}Ids"
      model.refList "_#{type}List", "_user.#{type}s", "_user.#{type}Ids"
      
    # http://tibia.wikia.com/wiki/Formula
    model.fn '_tnl', '_user.lvl', (lvl) -> 50 * Math.pow(lvl, 2) - 150 * lvl + 200
    
    page.render()

## VIEW HELPERS ##
view.fn 'taskClasses', (type, completed) ->
  classes = type
  classes += " completed" if completed
  return classes

## CONTROLLER FUNCTIONS ##

ready (model) ->
  
  #TODO remove this!!!!! dangerous temporary debugging helper
  window.model = model
    
  lists = [ 'habit', 'daily', 'todo', 'reward']

  for type in lists
    list = model.at "_#{type}List"

    # Make the list draggable using jQuery UI
    ul = $(".#{type}s ul")
    ul.sortable
      handle: '.handle'
      axis: 'y'
      # containment: ".#{type}s .dragbox"
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
  
  exports.addTask = (e, el, next) ->
    type = $(el).attr('data-task-type')
    list = model.at "_#{type}List"
    newModel = model.at('_new' + type.charAt(0).toUpperCase() + type.slice(1))
    # Don't add a blank todo
    return unless text = view.escapeHtml newModel.get()
    newModel.set ''
    switch type
    
      when 'habit'
        list.push {type: type, text: text, notes: '', score: 0, up: true, down: true}
        
      when 'reward'
        list.push {type: type, text: text, notes: '', price: 20 }
        
      when 'daily', 'todo'
        # Insert the new todo before the first completed item in the list
        # or append to the end if none are completed
        for todo, i in list.get()
          break if todo.completed
        list.insert i, {type: type, text: text, notes: '', score: 0, completed: false }
        
        list.on 'set', '*.completed', (i, completed, previous, isLocal) ->
          # Move the item to the bottom if it was checked off
          list.move i, -1  if completed && isLocal

  exports.del = (e) ->
    # Derby extends model.at to support creation from DOM nodes
    model.at(e.target).remove()

  exports.vote = (e, el, next) ->
    direction = $(el).attr('data-direction')
    #TODO this should be model.at(el), shouldn't have to find parent
    task = model.at $(el).parents('li')[0]
    user = model.at '_user'
    # For negative values, use a line: something like y=-.1x+1
    # For positibe values, taper off with inverse log: y=.9^x
    # Would love to use inverse log for the whole thing, but after 13 fails it hits infinity
    sign = if (direction == "up") then 1 else -1
    score = task.get('score')
    delta = 0
    if score < 0
      delta = (( -0.1 * score + 1 ) * sign)
    else
      delta = (( Math.pow(0.9, score) ) * sign)
    
    # Don't adjust scores for rewards, or for habits that don't have both + and -
    adjustScore = (task.get('type') != 'reward')
    if (task.get('type') == 'habit') and (task.get("up")==false or task.get("down")==false)
      adjustScore = false
    score += delta if adjustScore 
    
    # up/down -voting as checkbox & assigning as done, 2 birds one stone
    done = task.get("done")
    if task.get('type') != 'habit'
      done = true if direction=="up"
      done = false if direction=="down"
    [task.score, task.done] = [score, done]
    
    # Update the user's status
    [money, hp, exp, lvl] = [user.get('money'), user.get('hp'), user.get('exp'), user.get('lvl')]

    if task.get('type') == 'reward'
      # purchase item
      money -= task.get('score')
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

    #TODO this should be a func, since called elswhere.. but getting error
    tnl = 50 * Math.pow(user.get('lvl'), 2) - 150 * user.get('lvl') + 200
    # level up & carry-over exp
    if exp > tnl
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

    # console.log task
    # console.log user

    #TODO why do I have this?
    # @trigger 'updatedStats'

  exports.tnl = () ->
    # http://tibia.wikia.com/wiki/Formula
    user = model.at('_user')
    50 * Math.pow(user.get('lvl'), 2) - 150 * user.get('lvl') + 200
    
  ## RECONNECT & SHORTCUTS ##

  showReconnect = model.at '_showReconnect'
  showReconnect.set true
  exports.connect = ->
    showReconnect.set false
    setTimeout (-> showReconnect.set true), 1000
    model.socket.socket.connect()

  exports.reload = -> window.location.reload()

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
  