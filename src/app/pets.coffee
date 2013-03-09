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


  appExports.selectPet = (e, el) ->
    name = $(el).attr('data-pet')
    pet = _.findWhere pets, {name:name}
    ownsThisPet = user.get('items.pets').indexOf(name)
    if ownsThisPet != -1
      user.set 'items.currentPet', pet
    else
      tokens = user.get('balance')*4
      if tokens > pet.value
        r = confirm("Buy this pet with #{pet.value} of your #{tokens} tokens?");
        if r
          user.push "items.pets", name
          user.set 'items.currentPet', pet
          user.set 'balance', (tokens - pet.value)/4
      else
        $('#more-tokens-modal').modal('show')
