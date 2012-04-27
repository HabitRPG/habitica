{get, view, ready} = require('derby').createApp module

## ROUTES ##

get '/', (page) ->
  page.redirect '/derby'

get '/:groupName', (page, model, {groupName}) ->
  groupTodosQuery = model.query('todos').where('group').equals(groupName)
  model.subscribe "groups.#{groupName}", groupTodosQuery, (err, group) ->
    model.ref '_group', group
    todoIds = group.at 'todoIds'
    group.setNull 'id', groupName

    # The refList supports array methods, but it stores the todo values
    # on an object by id. The todos are stored on the object 'todos',
    # and their order is stored in an array of ids at '_group.todoIds'
    model.refList '_todoList', 'todos', todoIds

    # Add some default todos if this is a new group. Items inserted into
    # a refList will automatically get an 'id' property if not specified
    unless todoIds.get()
      model.push '_todoList',
        {group: groupName, text: 'Example todo'},
        {group: groupName, text: 'Another example'},
        {group: groupName, text: 'This one is done already', completed: true}

    # Create a reactive function that automatically keeps '_remaining'
    # updated with the number of remaining todos
    model.fn '_remaining', '_todoList', (list) ->
      remaining = 0
      for todo in list
        remaining++ unless todo?.completed
      return remaining

    page.render()

# TODO Implement this commented out API
#get '/:groupName', (page, model, {groupName, query}) ->
#  model.subscribe "groups.#{groupName}", (group) ->
#    model.ref '_group', group
##    group.setNull 'id', groupName
#    todoIds = group.at 'todoIds'
#    model.subscribe query('todos').where('id').within(todoIds), ->
#      # The refList supports array methods, but it stores the todo values
#      # on an object by id. The todos are stored on the object 'todos',
#      # and their order is stored in an array of ids at '_group.todoIds'
#      todoList = model.refList '_todoList', 'todos', todoIds
#      unless todoIds.get()
#        todoList.push
#          {text: 'Example todo', tags: ['wknd']},
#          {text: 'Another example', tags: ['wknd', 'work']},
#          {text: 'This one is done already', tags: ['work'], completed: true}
#
#      # Create a reactive function that automatically keeps '_remaining'
#      # updated with the number of remaining todos
#      model.fn '_remaining', '_todoList', (list) ->
#        remaining = 0
#        for todo in list
#          remaining++ unless todo.completed
#        return remaining
#
#      if tags = query.tags?.split ','
#        # TODO Hide / show tag classes
#      else
#        # TODO Hide / show tag classes
#
#      page.render()

## CONTROLLER FUNCTIONS ##

ready (model) ->

  list = model.at '_todoList'

  # Make the list draggable using jQuery UI
  ul = $('#todos')
  ul.sortable
    handle: '.handle'
    axis: 'y'
    containment: '#dragbox'
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

  newTodo = model.at '_newTodo'
  exports.add = ->
    # Don't add a blank todo
    return unless text = view.escapeHtml newTodo.get()
    newTodo.set ''
    # Insert the new todo before the first completed item in the list
    # or append to the end if none are completed
    for todo, i in list.get()
      break if todo.completed
    list.insert i, {text, group: model.get '_group.id'}

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
