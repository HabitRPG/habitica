_ = require 'underscore'
{ randomVal } = require './helpers'
{ pets, food } = require('./items').items

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
    model.ref '_feedEgg', e.at()

  appExports.feedEgg = (e, el) ->
    foodName = $(el).children('select').val()
    myFood = user.get 'items.food'
    egg = model.get '_feedEgg'
    eggs = user.get 'items.eggs'
    myPets = user.get 'items.pets'

    foodIdx = myFood.indexOf foodName
    eggIdx = eggs.indexOf egg

    return alert "You don't own that food :\\" if foodIdx is -1
    return alert "You don't own that egg :\\" if eggIdx is -1
    return alert "You already have that pet." if myPets and myPets.indexOf("#{egg.name}-#{foodName}") != -1

    user.push 'items.pets', egg.name + '-' + foodName

    eggs.splice eggIdx, 1
    myFood.splice foodIdx, 1
    user.set 'items.eggs', eggs
    user.set 'items.food', myFood

    alert 'Your egg hatched! Visit your stable to equip your pet.'

    #FIXME Bug: this removes from the array properly in the browser, but on refresh is has removed all items from the arrays
#    user.remove 'items.food', foodIdx, 1
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

  appExports.buyFood = (e, el) ->
    name = $(el).attr 'data-food'
    newFood = _.findWhere food, name: name
    tokens = user.get('balance') * 4
    if tokens > newFood.value
      if confirm "Buy this food with #{newFood.value} of your #{tokens} tokens?"
        user.push 'items.food', newFood.name
        user.set 'balance', (tokens - newFood.value) / 4
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
