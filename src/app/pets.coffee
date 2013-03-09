{ randomProp } = require './helpers'
{ pets } = require('./items').items

###
  app exports
###
module.exports.app = (appExports, model) ->
  user = model.at '_user'

  user.on 'set', 'flags.dropsEnabled', (captures, args) ->
    return unless captures == true

    egg = randomProp pets

    user.push 'items.eggs', egg.name
    user.set 'items.egg', egg

    # do drops enabled stuff
    $('#dropsEnabled-modal').show()
