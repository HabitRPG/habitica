_ = require 'underscore'
{ randomProp, removeWhitespace } = require './helpers'
{ pets, food } = require('./items').items

###
  app exports
###
module.exports.app = (appExports, model) ->
  user = model.at '_user'

  user.on 'set', 'flags.dropsEnabled', (captures, args) ->
    return unless captures == true

    egg = randomProp pets

    dontPersist =  model._dontPersist

    model._dontPersist = false if dontPersist
    user.push 'items.eggs', egg
    model._dontPersist = true if dontPersist

    $('#drops-enabled-modal').modal 'show'

  appExports.choosePet = (e, el) ->
    petArray = $(el).attr('data-pet').split '-'
    text = petArray[0]
    modifier = petArray[1]
    petStr = "#{text}-#{modifier}"
    pet = _.findWhere pets, text: text
    pet.modifier = modifier
    pet.str = petStr
    ownsThisPet = user.get('items.pets').indexOf petStr
    if ownsThisPet != -1
      if user.get('items.currentPet').str is petStr
        pet = {}
      user.set 'items.currentPet', pet
    else
      tokens = user.get('balance')*4
      if tokens > pet.value
        r = confirm("Buy this pet with #{pet.value} of your #{tokens} tokens?");
        if r
          user.push 'items.pets', text
          user.set 'items.currentPet', pet
          user.set 'balance', (tokens - pet.value)/4
      else
        $('#more-tokens-modal').modal 'show'
