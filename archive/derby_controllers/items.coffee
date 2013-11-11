items = require 'habitrpg-shared/script/items'
_ = require 'lodash'

updateStore = (model) ->
  nextItems = items.updateStore(model.get('_user'))
  _.each nextItems, (v,k) -> model.set("_items.next.#{k}",v); true

###
  server exports
###
module.exports.server = (model) ->
  model.set '_items', items.items
  updateStore(model)

###
  app exports
###
module.exports.app = (appExports, model) ->
  misc = require './misc'

  model.on "set", "_user.items.*", -> updateStore(model)

  appExports.buyItem = (e, el) ->
    misc.batchTxn model, (uObj, paths) ->
      ret = items.buyItem uObj, $(el).attr('data-type'), {paths}
      alert("Not enough GP") if ret is false

  appExports.activateRewardsTab = ->
    model.set '_activeTabRewards', true
    model.set '_activeTabPets', false
  appExports.activatePetsTab = ->
    model.set '_activeTabPets', true
    model.set '_activeTabRewards', false






