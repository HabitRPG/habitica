utils = require('utils')

module.exports = ->
  baseUrl = 'http://localhost:3000'
  casper = require("casper").create
    clientScripts: 'lib/lodash.min.js'
  getModel = (cb)->
    casper.waitFor(
                    ->
                      casper.evaluate ->
                        console.log typeof window.DERBY.app.model.get('_user.stats')
                        typeof window.DERBY.app.model == "object" && typeof window.DERBY.app.model.get('_user.stats') == "object"
                    cb casper.evaluate ->
                      model = window.DERBY.app.model
                      {
                      _userId: model.get('_userId')
                      _user: model.get('_user')
                      _todoList: model.get('_todoList')
                      _dailyList: model.get('_dailyList')
                      _rewardList: model.get('_rewardList')
                      _habitList: model.get('_habitList')
                      }
                  )

  {
  casper: casper
  baseUrl: baseUrl
  playUrl: baseUrl + '/?play=1'
  utils: utils
  getModel: getModel
  }
