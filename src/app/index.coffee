{get, view, ready} = require('derby').createApp module

## ROUTES ##

# get '/:groupName', (page, model, {groupName}) ->
get '/', (page, model) ->
  
 # Render page if a userId is already stored in session data
  if userId = model.get '_session.userId'
    return getRoom page, model, userId

  # Otherwise, select a new userId and initialize user
  model.async.incr 'configs.1.nextUserId', (err, userId) ->
    model.set '_session.userId', userId
    model.set "users.#{userId}",
      name: 'User ' + userId
      money: 0
      exp: 0
      lvl: 1
      
      habits:
        0: {id: 0, text: 'Take the stairs'}
      habitIds: [0]

      dailys: # I know it's bad pluralization, but codes easier later
        0: {id: 0, completed: false, text: 'Go to the gym'}
      dailyIds: [0]
      
      todos:
        0: {id: 0, text: 'Make a doctor appointment'}
      todoIds: [0]

      rewards:
        0: {id: 0, text: '1 TV episode'}
      rewardIds: [0]
      
    getRoom page, model, userId

getRoom = (page, model, userId) ->
  model.subscribe "users.#{userId}", (err, user) ->
    model.ref '_user', user

    # Setup "_todoList" for all the habit types 
    lists = [ 'habit', 'daily', 'todo', 'reward']
    for habitType in lists
      ids = user.at "#{habitType}Ids"
      model.refList "_#{habitType}List", "_user.#{habitType}s", "_user.#{habitType}Ids"

    page.render()


## CONTROLLER FUNCTIONS ##

ready (model) ->

  lists = [ 'habit', 'daily', 'todo', 'reward']

  for habitType in lists
    list = model.at "_#{habitType}List"
  
    # Make the list draggable using jQuery UI
    ul = $("\##{habitType}s")
    ul.sortable
      handle: '.handle'
      axis: 'y'
      containment: "\#dragbox-#{habitType}"
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
  
  
    list.on 'set', '*.completed', (i, completed, previous, isLocal) ->
      # Move the item to the bottom if it was checked off
      list.move i, -1  if completed && isLocal
  
  newHabit = model.at "_newHabit"
  newDaily = model.at "_newDaily"
  newTodo = model.at "_newTodo"
  newReward = model.at "_newReward"
        
  exports.addHabit = ->
    list = model.at "_habitList"
    # Don't add a blank todo
    return unless text = view.escapeHtml newHabit.get()
    newHabit.set ''
    # Insert the new todo before the first completed item in the list
    # or append to the end if none are completed
    for todo, i in list.get()
      break if todo.completed
    list.insert i, {text}
    
  exports.addDaily = ->
    list = model.at "_dailyList"
    # Don't add a blank todo
    return unless text = view.escapeHtml newDaily.get()
    newDaily.set ''
    # Insert the new todo before the first completed item in the list
    # or append to the end if none are completed
    for todo, i in list.get()
      break if todo.completed
    list.insert i, {text}
    
  exports.addTodo = ->
    list = model.at "_todoList"
    # Don't add a blank todo
    return unless text = view.escapeHtml newTodo.get()
    newTodo.set ''
    # Insert the new todo before the first completed item in the list
    # or append to the end if none are completed
    for todo, i in list.get()
      break if todo.completed
    list.insert i, {text}
    
  exports.addReward = ->
    list = model.at "_rewardList"
    # Don't add a blank todo
    return unless text = view.escapeHtml newReward.get()
    newReward.set ''
    # Insert the new todo before the first completed item in the list
    # or append to the end if none are completed
    for todo, i in list.get()
      break if todo.completed
    list.insert i, {text}

  exports.del = (e) ->
    # Derby extends model.at to support creation from DOM nodes
    model.at(e.target).remove()


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
  