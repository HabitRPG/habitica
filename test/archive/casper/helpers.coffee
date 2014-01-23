utils = require('utils')

module.exports = ->

  SYNC_WAIT_TIME = 40

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

    addTasks: (types = 'all', num = 5)->
      if types == 'all'
        types = ['habit', 'daily', 'todo', 'reward']
      types.forEach (type) ->
        i = 0
        casper.repeat num, ->
          casper.fill "form#new-#{type}", {'new-task': "#{type}-#{i}"} # why can't I use true here?
          casper.click "form#new-#{type} input[type=submit]"

    reset: ->
      casper.evaluate -> window.DERBY.app.reset()

    getModelDelayed: (cb) ->
      # This time is needed for derby to have enough time to update all it's data.
      # It still happens sometimes that the retrieved model does not contain any
      # data. It might be worth to do some basic checks on the model here, and if
      # it doesn't look OK, wait a bit longer and get it again.
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
      casper.evaluate ->
        yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1);
        window.DERBY.app.model.set('_user.lastCron', yesterday)
      casper.then -> casper.reload()

    cronBeforeAfter: (cb) ->
      that = @
      model = {}
      @getModelDelayed (before) ->
        model.before = before
        casper.then -> that.runCron()
        casper.then ->
          casper.wait 1100, -> # user's hp is updated after 1s for animation
            model.after = getModel()
            casper.then ->
              casper.test.assertEqual model.before._user.id, model.after._user.id, 'user id equal after cron'
              casper.test.assertEqual model.before._user.tasks.length, model.after._user.tasks.length, "Didn't lose anything on cron"
              cb(model)

    register: ->
      casper.fill 'form#derby-auth-register',
        username: random
        email: random + '@example.com'
        password: random
        'password-confirmation': random
      , true

    login: ->
      casper.fill 'form#derby-auth-login',
        username: random
        password: random
      , true

    deleteOne: (list, typeSelector) ->
      selector = "#{typeSelector} a[data-original-title=\"Delete\"]"
      @modelBeforeAfter (-> casper.click selector), (model) ->
        casper.test.assertEquals Object.keys(model.before._user.tasks).length - 1, Object.keys(model.after._user.tasks).length, "1 #{typeSelector} deleted from user.tasks"
        casper.test.assertEquals model.before._user["#{list}Ids"].length - 1, model.after._user["#{list}Ids"].length, "1 #{typeSelector} deleted from user._typeIds"
        casper.test.assertEquals model.before["_#{list}List"].length - 1, model.after["_#{list}List"].length, "1 #{typeSelector} deleted from _typeList"
  }
