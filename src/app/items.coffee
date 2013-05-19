items = require 'habitrpg-shared/script/items'
_ = require 'underscore'

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
  user = model.at '_user'

  appExports.buyItem = (e, el) ->
    [type, value, index] = [ $(el).attr('data-type'), $(el).attr('data-value'), $(el).attr('data-index') ]
    if changes = items.buyItem(user.get(), type, value, index)
      _.each changes, (v,k) -> user.set k,v
      updateStore(model)

  appExports.activateRewardsTab = ->
    model.set '_activeTabRewards', true
    model.set '_activeTabPets', false
  appExports.activatePetsTab = ->
    model.set '_activeTabPets', true
    model.set '_activeTabRewards', false

module.exports.updateStore = updateStore = (model) ->
  nextItems = items.updateStore(model.get('_user'))
  _.each nextItems, (v,k) -> model.set("_items.next.#{k}",v)







