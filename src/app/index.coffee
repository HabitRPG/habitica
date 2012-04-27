{get, view, ready} = require('derby').createApp module

## ROUTES ##

start = +new Date()

# Derby routes can be rendered on the client and the server
get '/:roomName?', (page, model, {roomName}) ->
  roomName ||= 'home'

  # Subscribes the model to any updates on this room's object. Calls back
  # with a scoped model equivalent to:
  #   room = model.at "rooms.#{roomName}"
  model.subscribe "rooms.#{roomName}", (err, room) ->
    model.ref '_room', room

    # setNull will set a value if the object is currently null or undefined
    room.setNull 'welcome', "Welcome to #{roomName}!"

    room.incr 'visits'

    # This value is set for when the page initially renders
    model.set '_timer', '0.0'
    # Reset the counter when visiting a new route client-side
    start = +new Date()

    # Render will use the model data as well as an optional context object
    page.render
      roomName: roomName
      randomUrl: parseInt(Math.random() * 1e9).toString(36)


## CONTROLLER FUNCTIONS ##

ready (model) ->
  timer = null

  # Expose the model as a global variable in the browser. This is fun in
  # development, but it should be removed when writing an app
  window.model = model

  # Exported functions are exposed as a global in the browser with the same
  # name as the module that includes Derby. They can also be bound to DOM
  # events using the "x-bind" attribute in a template.
  exports.stop = ->

    # Any path name that starts with an underscore is private to the current
    # client. Nothing set under a private path is synced back to the server.
    model.set '_stopped', true
    clearInterval timer

  do exports.start = ->
    model.set '_stopped', false
    timer = setInterval ->
      model.set '_timer', (((+new Date()) - start) / 1000).toFixed(1)
    , 100


  model.set '_showReconnect', true
  exports.connect = ->
    # Hide the reconnect link for a second after clicking it
    model.set '_showReconnect', false
    setTimeout (-> model.set '_showReconnect', true), 1000
    model.socket.socket.connect()

  exports.reload = -> window.location.reload()
