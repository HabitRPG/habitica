module.exports = ->

  url: 'http://localhost:3000/?play=1'

  casper: require("casper").create
    clientScripts: 'test/includes/lodash.min.js'

  utils: require('utils')

  getUser: -> casper.evaluate -> window.DERBY.app.model.get('_user')

  addTasks: ->
    ['habit', 'daily', 'todo', 'reward'].forEach (type) ->
      # Add 15 of each task type
      num = 0
      casper.repeat 15, ->
        casper.fill "form#new-#{type}", {'new-task': "#{type}-#{num}"} # why can't I use true here?
        casper.click "form#new-#{type} input[type=submit]"

  reset: -> casper.evaluate -> window.DERBY.app.reset()

  userBeforeAfter: (callback) ->
    user = {}
    user.before = getUser()
    callback()
    user.after = getUser()
    user

  runCron: ->
    casper.evaluate -> window.DERBY.model.set('_user.lastCron', new Date('01/10/2013'))
    casper.reload()

  register: ->
    casper.fill 'form#derby-auth-register',
      username: 'lefnire'
      email: 'x@x.com'
      'email-confirmation': 'x@x.com'
      password: 'habitrpg123'
    , true
