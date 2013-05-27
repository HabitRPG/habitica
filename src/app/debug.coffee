moment = require 'moment'
algos = require 'habitrpg-shared/script/algos'

module.exports.app = (appExports, model) ->
  user = model.at('_user')

  appExports.emulateNextDay = ->
    yesterday = +moment().subtract('days', 1).toDate()
    user.set 'lastCron', yesterday
    window.location.reload()

  appExports.emulateTenDays = ->
    yesterday = +moment().subtract('days', 10).toDate()
    user.set 'lastCron', yesterday
    window.location.reload()

  appExports.cheat = ->
    user.incr 'stats.exp', algos.tnl(user.get('stats.lvl'))
    user.incr 'stats.gp', 1000