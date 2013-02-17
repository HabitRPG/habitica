utils = require('utils')

module.exports = ->

  SYNC_WAIT_TIME = 20

  baseUrl = 'http://localhost:3000'

  random = Math.random().toString(36).substring(7)

  casper = require("casper").create
    clientScripts: 'test/includes/lodash.min.js'

  getModel = ->
    casper.evaluate ->
      model = window.DERBY.app.model
      {
        _userId: model.get('_userId')
        _user: model.get('_user')
        _todoList: model.get('_todoList')
        _dailyList: model.get('_dailyList')
        _rewardList: model.get('_rewardList')
        _habitList: model.get('_habitList')
      }

  {
    casper: casper

    baseUrl: baseUrl
    playUrl: baseUrl + '/?play=1'

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

    getModelDelayed: (cb) ->
      casper.wait SYNC_WAIT_TIME, ->
        cb(getModel())

    modelBeforeAfter: (between_cb, done_cb) ->
      that = @
      model = {}
      @getModelDelayed (before) ->
        model.before = before
        casper.then ->
          between_cb()
          that.getModelDelayed (after) ->
            model.after = after
            casper.then -> done_cb(model)

    runCron: ->
      casper.evaluate -> window.DERBY.model.set('_user.lastCron', new Date('01/25/2013'))
      casper.then -> casper.reload()

    cronBeforeAfter: (cb) ->
      that = @
      model = {}
      @getModelDelayed (before) ->
        model.before = before
        casper.then -> that.runCron()
        casper.then ->
          casper.wait 1050, -> # user's hp is updated after 1s for animation
            model.after = getModel()
            casper.then ->
              casper.test.assertEqual model.before._user.id, model.after._user.id, 'user id equal after cron'
              casper.test.assertEqual model.before._user.tasks.length, model.after._user.tasks.length, "Didn't lose anything on cron"
              cb(model)


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
