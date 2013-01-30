utils = require('utils')

module.exports = ->

  random = Math.random().toString(36).substring(7)

  casper = require("casper").create
    clientScripts: 'test/includes/lodash.min.js'

  {
    casper: casper

    url: 'http://localhost:3000'

    utils: utils

    addTasks: ->
      ['habit', 'daily', 'todo', 'reward'].forEach (type) ->
        # Add 15 of each task type
        num = 0
        casper.repeat 5, ->
          casper.fill "form#new-#{type}", {'new-task': "#{type}-#{num}"} # why can't I use true here?
          casper.click "form#new-#{type} input[type=submit]"

    reset: ->
      casper.evaluate -> window.DERBY.app.reset()

    getModel: ->
      casper.evaluate ->
        model = window.DERBY.app.model
        {
          _userId: model.get('_userId')
          _user: model.get("_user")
          _todoList: model.get('_todoList')
          _dailyList: model.get('_dailyList')
          _rewardList: model.get('_rewardList')
          _habitList: model.get('_habitList')
        }

    modelBeforeAfter: (between_cb, done_cb) ->
      that = @
      model = {before:@getModel()}
      casper.then ->
        between_cb()
        casper.then ->
          model.after = that.getModel()
          #utils.dump model
          casper.then -> done_cb(model)

    runCron: ->
      casper.evaluate -> window.DERBY.model.set('_user.lastCron', new Date('01/25/2013'))
      casper.then -> casper.reload()

    cronBeforeAfter: (cb) ->
      that = @
      model = {before:@getModel()}
      casper.then -> that.runCron()
      casper.then ->
        casper.wait 1050, -> # user's hp is updated after 1s for animation
          model.after = that.getModel()
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


    deleteOne: (type) ->
      listType = if type == 'completed' then 'todo' else type
      selector = ".#{type}s a[data-original-title=\"Delete\"]"
      @modelBeforeAfter (-> casper.click selector), (model) ->
#        utils.dump model
        casper.test.assertEquals Object.keys(model.before._user.tasks).length - 1, Object.keys(model.after._user.tasks).length, "1 #{type} deleted from user.tasks"
        casper.test.assertEquals model.before._user["#{listType}Ids"].length - 1, model.after._user["#{listType}Ids"].length, "1 #{type} deleted from user._typeIds"
        casper.test.assertEquals model.before["_#{listType}List"].length - 1, model.after["_#{listType}List"].length, "1 #{type} deleted from _typeList"
  }
