moment = require 'moment'

module.exports.app = (appExports, model) ->
  user = model.at('_user')

  appExports.emulateNextDay = ->
    yesterday = +moment().subtract('days', 1).toDate()
    user.set 'lastCron', yesterday
    window.location.reload()

  appExports.cheat = ->
    user.incr 'stats.exp', 20
    user.incr 'stats.gp', 1000
