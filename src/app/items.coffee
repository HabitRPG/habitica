_ = require 'underscore'

items = module.exports.items =
  weapon: [
    {index: 0, text: "Training Sword", classes: "weapon_0", notes:'Training weapon.', strength: 0, value:0}
    {index: 1, text: "Sword", classes:'weapon_1', notes:'Increases experience gain by 3%.', strength: 3, value:20}
    {index: 2, text: "Axe", classes:'weapon_2', notes:'Increases experience gain by 6%.', strength: 6, value:30}
    {index: 3, text: "Morningstar", classes:'weapon_3', notes:'Increases experience gain by 9%.', strength: 9, value:45}
    {index: 4, text: "Blue Sword", classes:'weapon_4', notes:'Increases experience gain by 12%.', strength: 12, value:65}
    {index: 5, text: "Red Sword", classes:'weapon_5', notes:'Increases experience gain by 15%.', strength: 15, value:90}
    {index: 6, text: "Golden Sword", classes:'weapon_6', notes:'Increases experience gain by 18%.', strength: 18, value:120}
  ]
  armor: [
    {index: 0, text: "Cloth Armor", classes: 'armor_0', notes:'Training armor.', defense: 0, value:0}
    {index: 1, text: "Leather Armor", classes: 'armor_1', notes:'Decreases HP loss by 4%.', defense: 4, value:30}
    {index: 2, text: "Chain Mail", classes: 'armor_2', notes:'Decreases HP loss by 6%.', defense: 6, value:45}
    {index: 3, text: "Plate Mail", classes: 'armor_3', notes:'Decreases HP loss by 7%.', defense: 7, value:65}
    {index: 4, text: "Red Armor", classes: 'armor_4', notes:'Decreases HP loss by 8%.', defense: 8, value:90}
    {index: 5, text: "Golden Armor", classes: 'armor_5', notes:'Decreases HP loss by 10%.', defense: 10, value:120}
  ]
  head: [
    {index: 0, text: "No Helm", classes: 'head_0', notes:'Training helm.', defense: 0, value:0}
    {index: 1, text: "Leather Helm", classes: 'head_1', notes:'Decreases HP loss by 2%.', defense: 2, value:15}
    {index: 2, text: "Chain Coif", classes: 'head_2', notes:'Decreases HP loss by 3%.', defense: 3, value:25}
    {index: 3, text: "Plate Helm", classes: 'head_3', notes:'Decreases HP loss by 4%.', defense: 4, value:45}
    {index: 4, text: "Red Helm", classes: 'head_4', notes:'Decreases HP loss by 5%.', defense: 5, value:60}
    {index: 5, text: "Golden Helm", classes: 'head_5', notes:'Decreases HP loss by 6%.', defense: 6, value:80}
  ]
  shield: [
    {index: 0, text: "No Shield", classes: 'shield_0', notes:'No Shield.', defense: 0, value:0}
    {index: 1, text: "Wooden Shield", classes: 'shield_1', notes:'Decreases HP loss by 3%', defense: 3, value:20}
    {index: 2, text: "Buckler", classes: 'shield_2', notes:'Decreases HP loss by 4%.', defense: 4, value:35}
    {index: 3, text: "Enforced Shield", classes: 'shield_3', notes:'Decreases HP loss by 5%.', defense: 5, value:55}
    {index: 4, text: "Red Shield", classes: 'shield_4', notes:'Decreases HP loss by 7%.', defense: 7, value:70}
    {index: 5, text: "Golden Shield", classes: 'shield_5', notes:'Decreases HP loss by 8%.', defense: 8, value:90}
  ]
  potion: {type: 'potion', text: "Potion", notes: "Recover 15 HP", value: 25, classes: 'potion'}
  reroll: {type: 'reroll', text: "Re-Roll", classes: 'reroll', notes: "Resets your task values back to 0 (yellow). Useful when everything's red and it's hard to stay alive.", value:0 }

  pets: [
    {text: 'Wolf', name: 'Wolf', value: 3}
    {text: 'Tiger Cub', name: 'TigerCub', value: 3}
    #{text: 'Polar Bear Cub', name: 'PolarBearCub', value: 3} #commented out because there are no polarbear modifiers yet, special drop?
    {text: 'Panda Cub', name: 'PandaCub', value: 3}
    {text: 'Lion Cub', name: 'LionCub', value: 3}
    {text: 'Fox', name: 'Fox', value: 3}
    {text: 'Flying Pig', name: 'FlyingPig', value: 3}
    {text: 'Dragon', name: 'Dragon', value: 3}
    {text: 'Cactus', name: 'Cactus', value: 3}
    {text: 'Bear Cub', name: 'BearCub', value: 3}
  ]

  hatchingPotions: [
    {text: 'Base', name: 'Base', notes: "Hatches your pet in it's base form.", value: 1}
    {text: 'White', name: 'White', notes: 'Turns your animal into a White pet.', value: 2}
    {text: 'Desert', name: 'Desert', notes: 'Turns your animal into a Desert pet.', value: 2}
    {text: 'Red', name: 'Red', notes: 'Turns your animal into a Red pet.', value: 3}
    {text: 'Shade', name: 'Shade', notes: 'Turns your animal into a Shade pet.', value: 3}
    {text: 'Skeleton', name: 'Skeleton', notes: 'Turns your animal into a Skeleton.', value: 3}
    {text: 'Zombie', name: 'Zombie', notes: 'Turns your animal into a Zombie.', value: 4}
    {text: 'Cotton Candy Pink', name: 'CottonCandyPink', notes: 'Turns your animal into a Cotton Candy Pink pet.', value: 4}
    {text: 'Cotton Candy Blue', name: 'CottonCandyBlue', notes: 'Turns your animal into a Cotton Candy Blue pet.', value: 4}
    {text: 'Golden', name: 'Golden', notes: 'Turns your animal into a Golden pet.', value: 5}
  ]

# add "type" to each item, so we can reference that as "weapon" or "armor" in the html
_.each ['weapon', 'armor', 'head', 'shield'], (key) ->
  _.each items[key], (item) -> item.type = key

_.each items.pets, (pet) -> pet.notes = 'Find a hatching potion to pour on this egg, and one day it will hatch into a loyal pet.'
_.each items.hatchingPotions, (hatchingPotion) -> hatchingPotion.notes = "Pour this on an egg, and it will hatch as a #{hatchingPotion.text} pet."

###
  view exports
###
module.exports.view = (view) ->
  view.fn 'equipped', (user, type) ->
    {gender, armorSet} = user?.preferences || {'m', 'v1'}

    if type=='armor'
      armor = user?.items?.armor || 0
      if gender == 'f'
        return if (parseInt(armor) == 0) then "f_armor_#{armor}_#{armorSet}" else "f_armor_#{armor}"
      else
        return "m_armor_#{armor}"

    else if type=='head'
      head = user?.items?.head || 0
      if gender == 'f'
        return if (parseInt(head) > 1) then "f_head_#{head}_#{armorSet}" else "f_head_#{head}"
      else
        return "m_head_#{head}"

  view.fn "gold", (num) ->
    if num
      return (num).toFixed(1).split('.')[0]
    else
      return "0"

  view.fn "silver", (num) ->
    if num
      (num).toFixed(2).split('.')[1]
    else
      return "00"

  view.fn "copper", (num) ->
    if num
      c = (num).toFixed(4).split('.')[1]
      c.toString().substr(2,2)
    else
      return "00"

###
  server exports
###
module.exports.server = (model) ->
  updateStore(model)

###
  app exports
###
module.exports.app = (appExports, model) ->
  user = model.at '_user'

  appExports.buyItem = (e, el, next) ->
    user = model.at '_user'
    #TODO: this should be working but it's not. so instead, i'm passing all needed values as data-attrs
    # item = model.at(e.target)

    gp = user.get 'stats.gp'
    [type, value, index] = [ $(el).attr('data-type'), $(el).attr('data-value'), $(el).attr('data-index') ]

    return if gp < value
    user.set 'stats.gp', gp - value
    if type == 'weapon'
      user.set 'items.weapon', index
      updateStore model
    else if type == 'armor'
      user.set 'items.armor', index
      updateStore model
    else if type == 'head'
      user.set 'items.head', index
      updateStore model
    else if type == 'shield'
      user.set 'items.shield', index
      updateStore model
    else if type == 'potion'
      hp = user.get 'stats.hp'
      hp += 15
      hp = 50 if hp > 50
      user.set 'stats.hp', hp


  appExports.activateRewardsTab = ->
    model.set '_view.activeTabRewards', true
    model.set '_view.activeTabPets', false
  appExports.activatePetsTab = ->
    model.set '_view.activeTabPets', true
    model.set '_view.activeTabRewards', false

  model.on 'set', '_user.flags.itemsEnabled', (captures, args) ->
    return unless captures is true
    html = """
           <div class='item-store-popover'>
           <img src='/vendor/BrowserQuest/client/img/1/chest.png' />
           Congratulations, you have unlocked the Item Store! You can now buy weapons, armor, potions, etc. Read each item's comment for more information.
           <a href='#' onClick="$('div.rewards').popover('hide');return false;">[Close]</a>
           </div>
           """
    $('div.rewards').popover({
      title: "Item Store Unlocked"
      placement: 'left'
      trigger: 'manual'
      html: true
      content: html
    }).popover 'show'

  user.on 'set', 'flags.petsEnabled', (captures, args) ->
    return unless captures == true
    html = """
           <img src='/img/sprites/wolf_border.png' style='width:30px;height:30px;float:left;padding-right:5px' />
           You have unlocked Pets! You can now buy pets with tokens (note, you replenish tokens with real-life money - so chose your pets wisely!)
           <a href='#' onClick="$('#rewardsTabs').popover('hide');return false;">[Close]</a>
           """
    $('#rewardsTabs').popover
      title: "Pets Unlocked"
      placement: 'left'
      trigger: 'manual'
      html: true
      content: html
    $('#rewardsTabs').popover 'show'

###
  update store
###
module.exports.updateStore = updateStore = (model) ->
  obj = model.get('_user')

  _.each ['weapon', 'armor', 'shield', 'head'], (type) ->
    i = parseInt(obj?.items?[type] || 0) + 1
    nextItem = if (i == _.size items[type]) then {hide:true} else items[type][i]
    model.set "_view.items.#{type}", nextItem

  model.set '_view.items.potion', items.potion
  model.set '_view.items.reroll', items.reroll
  model.set '_view.items.pets', items.pets
  model.set '_view.items.hatchingPotions', items.hatchingPotions



