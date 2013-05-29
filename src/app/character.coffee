browser = require './browser'
items = require './items'
algos = require 'habitrpg-shared/script/algos'
misc = require './misc'
helpers = require 'habitrpg-shared/script/helpers'

moment = require 'moment'
_ = require 'lodash'
derby = require 'derby'

module.exports.app = (appExports, model) ->
  user = model.at '_user'

  appExports.revive = ->
    # Reset stats
    user.set 'stats.hp', 50
    user.set 'stats.exp', 0
    user.set 'stats.gp', 0
    user.incr 'stats.lvl', -1 if user.get('stats.lvl') > 1

    ## Lose a random item
    loseThisItem = false
    owned = user.get('items')
    # unless they're already at 0-everything
    if parseInt(owned.armor)>0 or parseInt(owned.head)>0 or parseInt(owned.shield)>0 or parseInt(owned.weapon)>0
      # find a random item to lose
      until loseThisItem
        #candidate = {0:'items.armor', 1:'items.head', 2:'items.shield', 3:'items.weapon', 4:'stats.gp'}[Math.random()*5|0]
        candidate = {0:'armor', 1:'head', 2:'shield', 3:'weapon'}[Math.random()*4|0]
        loseThisItem = candidate if owned[candidate] > 0
      user.set "items.#{loseThisItem}", 0

    items.updateStore(model)

  appExports.reset = (e, el) ->
    misc.batchTxn model, (uObj, paths) ->
      taskTypes = ['habit', 'daily', 'todo', 'reward']
      uObj.tasks = {}; paths['tasks'] = true
      taskTypes.forEach (type) -> uObj["#{type}Ids"] = []; paths["#{type}Ids"] = true
      # Reset stats
      [uObj.stats.hp, uObj.stats.lvl, uObj.stats.gp, uObj.stats.exp] = [50, 1, 0, 0]
      # Reset items
      [uObj.items.armor, uObj.items.weapon, uObj.items.head, uObj.items.shield] = [0, 0, 0, 0]
      ['stats.hp', 'stats.lvl', 'stats.gp', 'stats.exp', 'items.armor', 'items.weapon', 'items.head', 'items.shield'].forEach (path) ->
        paths[path] = true
    items.updateStore(model)
    browser.resetDom(model)

  appExports.closeNewStuff = (e, el) ->
    user.set('flags.newStuff', 'hide')

  appExports.customizeGender = (e, el) ->
    user.set 'preferences.gender', $(el).attr('data-value')

  appExports.customizeHair = (e, el) ->
    user.set 'preferences.hair', $(el).attr('data-value')

  appExports.customizeSkin = (e, el) ->
    user.set 'preferences.skin', $(el).attr('data-value')

  appExports.customizeArmorSet = (e, el) ->
    user.set 'preferences.armorSet', $(el).attr('data-value')

  appExports.restoreSave = (e, el) ->
    misc.batchTxn model, (uObj, paths) ->
      $('#restore-form input').each ->
        [path, val] = [$(this).attr('data-for'), parseInt($(this).val() || 1)]
        helpers.dotSet(path, val, uObj); paths[path] = true
      debugger

  appExports.toggleHeader = (e, el) ->
    user.set 'preferences.hideHeader', !user.get('preferences.hideHeader')

  appExports.deleteAccount = (e, el) ->
    model.del "users.#{user.get('id')}", ->
      location.href = "/logout"