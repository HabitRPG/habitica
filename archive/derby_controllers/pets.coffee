_ = require 'lodash'
{ randomVal } = require 'habitrpg-shared/script/helpers'
{ pets, hatchingPotions } = require('habitrpg-shared/script/items').items

###
  app exports
###
module.exports.app = (appExports, model) ->
  user = model.at '_user'

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

    user.push 'items.pets', egg.name + '-' + hatchingPotionName, ->
      eggs.splice eggIdx, 1
      myHatchingPotion.splice hatchingPotionIdx, 1
      user.set 'items.eggs', eggs
      user.set 'items.hatchingPotions', myHatchingPotion

    alert 'Your egg hatched! Visit your stable to equip your pet.'

    #FIXME Bug: this removes from the array properly in the browser, but on refresh is has removed all items from the arrays
#    user.remove 'items.hatchingPotions', hatchingPotionIdx, 1
#    user.remove 'items.eggs', eggIdx, 1

  appExports.choosePet = (e, el, next) ->
    petStr = $(el).attr('data-pet')

    return next() if user.get('items.pets').indexOf(petStr) == -1
    # If user's pet is already active, deselect it
    return user.set 'items.currentPet', {} if user.get('items.currentPet.str') is petStr

    [name, modifier] = petStr.split('-')
    pet = _.find pets, {name: name}
    pet.modifier = modifier
    pet.str = petStr
    user.set 'items.currentPet', pet

  appExports.buyHatchingPotion = (e, el) ->
    name = $(el).attr 'data-hatchingPotion'
    newHatchingPotion = _.find hatchingPotions, {name: name}
    gems = user.get('balance') * 4
    if gems >= newHatchingPotion.value
      if confirm "Buy this hatching potion with #{newHatchingPotion.value} of your #{gems} Gems?"
        user.push 'items.hatchingPotions', newHatchingPotion.name
        user.set 'balance', (gems - newHatchingPotion.value) / 4
    else
      $('#more-gems-modal').modal 'show'

  appExports.buyEgg = (e, el) ->
    name = $(el).attr 'data-egg'
    newEgg = _.find pets, {name: name}
    gems = user.get('balance') * 4
    if gems >= newEgg.value
      if confirm "Buy this egg with #{newEgg.value} of your #{gems} Gems?"
        user.push 'items.eggs', newEgg
        user.set 'balance', (gems - newEgg.value) / 4
    else
      $('#more-gems-modal').modal 'show'
