http = require 'http'

# ### Request
#
# The Request class is just a wrapper
# around the `http.request` function,
# providing a cleaner and more reusable
# interface.
#
# `constructor(options)`
#
# `options` can be anything `http.request` takes.
#
# Callbacks can be queued up by calling `request.done`
# and passing it a callback function to be invoked when the
# http request has completed
#
# Example:
#
# callback = (json) ->
#   doSomethingWithJSON( json )
#
# request = new Request('http://api.phish.net/api.js?')
# request.done (response) ->
#   callback JSON.parse(response)[0]
#
# request.fire(data) # data refers to the post data
#
class Request
  constructor: (@options) ->
    @callbacks = {}

  fire: (data) ->
    request = http.request(@options, @_handler)
    request.on 'error', (err) =>
      for callback in @callbacks['fail']
        callback(err)

    # Send data with request
    if data
      request.write data

    request.end()

    this

  done: (callback) ->
    push.call(this, 'done', callback)

    this

  fail: (callback) ->
    push.call(this, 'fail', callback)

    this

  ###########
  # PRIVATE #
  ###########

  _handler: (response) =>
    data = ''
    response.on 'data', (chunk) ->
      data += chunk
    response.on 'end', =>
      for callback in @callbacks['done']
        callback(data)


  push = (type, callback) ->
    @callbacks[type] ?= []
    @callbacks[type].push callback

module.exports = Request
