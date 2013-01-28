utils = require('utils')

module.exports = ->

  random = Math.random().toString(36).substring(7)

  casper = require("casper").create
    clientScripts: 'test/includes/lodash.min.js'

  {
    casper: casper

    url: 'http://localhost:3000'

    utils: utils

    getUser: ->
      casper.evaluate -> window.DERBY.app.model.get('_user')

    addTasks: ->
      ['habit', 'daily', 'todo', 'reward'].forEach (type) ->
        # Add 15 of each task type
        num = 0
        casper.repeat 15, ->
          casper.fill "form#new-#{type}", {'new-task': "#{type}-#{num}"} # why can't I use true here?
          casper.click "form#new-#{type} input[type=submit]"

    reset: ->
      casper.evaluate -> window.DERBY.app.reset()

    userBeforeAfter: (callback) ->
      user = {}
      user.before = @getUser()
      callback()
      user.after = @getUser()
      user

    runCron: ->
      casper.evaluate -> window.DERBY.model.set('_user.lastCron', new Date('01/25/2013'))
      casper.reload()

    cronBeforeAfter: (cb) ->
      that = @

      getLists = ->
        {
          habit: casper.evaluate -> window.DERBY.app.model.get('_habitList')
          daily: casper.evaluate -> window.DERBY.app.model.get('_dailyList')
          todo: casper.evaluate -> window.DERBY.app.model.get('_todoList')
          reward: casper.evaluate -> window.DERBY.app.model.get('_rewardList')
        }

      beforeAfter =
        before:
          user: that.getUser()
          tasks: getLists()

      casper.then -> that.runCron()

      casper.then ->
        casper.wait 1050, -> # user's hp is updated after 1s for animation
          beforeAfter.after =
            user: that.getUser()
            tasks: getLists()

          casper.then ->
            casper.test.assertEqual beforeAfter.before.user.id, beforeAfter.after.user.id, 'user id equal after cron'
            casper.test.assertEqual beforeAfter.before.user.tasks.length, beforeAfter.after.user.tasks.length, "Didn't lose anything on cron"
            cb(beforeAfter)


    register: ->
      casper.fill 'form#derby-auth-register',
        username: random
        email: random + '@gmail.com'
        'email-confirmation': random + '@gmail.com'
        password: random
      , true

    login: ->
      casper.fill 'form#derby-auth-login',
        username: random
        password: random
      , true

  }
