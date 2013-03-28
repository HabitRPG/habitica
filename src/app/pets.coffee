_ = require 'underscore'
{ randomVal } = require './helpers'
{ pets, hatchingPotions } = require('./items').items

###
  app exports
###
module.exports.app = (appExports, model) ->
  user = model.at '_user'

  user.on 'set', 'flags.dropsEnabled', (captures, args) ->
    return unless captures == true

    egg = randomVal pets

    dontPersist =  model._dontPersist

    model._dontPersist = false
    user.push 'items.eggs', egg
    model._dontPersist = dontPersist

    $('#drops-enabled-modal').modal 'show'

  appExports.chooseEgg = (e, el) ->
    model.ref '_hatchEgg', e.at()

  appExports.hatchEgg = (e, el) ->
    hatchingPotionName = $(el).children('select').val()
    myHatchingPotion = user.get 'items.hatchingPotions'
    egg = model.get '_hatchEgg'
    eggs = user.get 'items.eggs'
    myPets = user.get 'items.pets'

    hatchingPotionIdx = myHatchingPotion.indexOf hatchingPotionName
    eggIdx = eggs.indexOf egg

    return alert "You don't own that hatching potion yet, complete more tasks!" if hatchingPotionIdx is -1
    return alert "You don't own that egg yet, complete more tasks!" if eggIdx is -1
    return alert "You already have that pet, hatch a different combo." if myPets and myPets.indexOf("#{egg.name}-#{hatchingPotionName}") != -1

    user.push 'items.pets', egg.name + '-' + hatchingPotionName

    eggs.splice eggIdx, 1
    myHatchingPotion.splice hatchingPotionIdx, 1
    user.set 'items.eggs', eggs
    user.set 'items.hatchingPotions', myHatchingPotion

    alert 'Your egg hatched! Visit your stable to equip your pet.'

    #FIXME Bug: this removes from the array properly in the browser, but on refresh is has removed all items from the arrays
#    user.remove 'items.hatchingPotions', hatchingPotionIdx, 1
#    user.remove 'items.eggs', eggIdx, 1

  appExports.choosePet = (e, el) ->
    petStr = $(el).attr('data-pet')
    [name, modifier] = petStr.split('-')
    pet = _.findWhere pets, name: name
    pet.modifier = modifier
    pet.str = petStr
    ownsThisPet = user.get('items.pets').indexOf petStr
    if ownsThisPet != -1
      # If user's pet is already active, deselect it
      pet = {} if user.get('items.currentPet.str') is petStr
      user.set 'items.currentPet', pet

  appExports.buyHatchingPotion = (e, el) ->
    name = $(el).attr 'data-hatchingPotion'
    newHatchingPotion = _.findWhere hatchingPotions, name: name
    tokens = user.get('balance') * 4
    if tokens > newHatchingPotion.value
      if confirm "Buy this hatching potion with #{newHatchingPotion.value} of your #{tokens} tokens?"
        user.push 'items.hatchingPotions', newHatchingPotion.name
        user.set 'balance', (tokens - newHatchingPotion.value) / 4
    else
      $('#more-tokens-modal').modal 'show'

  appExports.buyEgg = (e, el) ->
    name = $(el).attr 'data-egg'
    newEgg = _.findWhere pets, name: name
    tokens = user.get('balance') * 4
    if tokens > newEgg.value
      if confirm "Buy this egg with #{newEgg.value} of your #{tokens} tokens?"
        user.push 'items.eggs', newEgg
        user.set 'balance', (tokens - newEgg.value) / 4
    else
      $('#more-tokens-modal').modal 'show'
