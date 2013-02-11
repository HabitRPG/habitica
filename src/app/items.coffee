_ = require 'underscore'

items = module.exports.items =
  weapon: [
    {index: 0, text: "Training Sword", classes: "weapon_0", notes:'Training weapon.', modifier: 0.00, value:0}
    {index: 1, text: "Sword", classes:'weapon_1', notes:'Increases experience gain by 3%.', modifier: 0.03, value:20}
    {index: 2, text: "Axe", classes:'weapon_2', notes:'Increases experience gain by 6%.', modifier: 0.06, value:30}
    {index: 3, text: "Morningstar", classes:'weapon_3', notes:'Increases experience gain by 9%.', modifier: 0.09, value:45}
    {index: 4, text: "Blue Sword", classes:'weapon_4', notes:'Increases experience gain by 12%.', modifier: 0.12, value:65}
    {index: 5, text: "Red Sword", classes:'weapon_5', notes:'Increases experience gain by 15%.', modifier: 0.15, value:90}
    {index: 6, text: "Golden Sword", classes:'weapon_6', notes:'Increases experience gain by 18%.', modifier: 0.18, value:120}
  ]
  armor: [
    {index: 0, text: "Cloth Armor", classes: 'armor_0', notes:'Training armor.', modifier: 0.00, value:0}
    {index: 1, text: "Leather Armor", classes: 'armor_1', notes:'Decreases HP loss by 4%.', modifier: 0.04, value:30}
    {index: 2, text: "Chain Mail", classes: 'armor_2', notes:'Decreases HP loss by 6%.', modifier: 0.06, value:45}
    {index: 3, text: "Plate Mail", classes: 'armor_3', notes:'Decreases HP loss by 7%.', modifier: 0.07, value:65}
    {index: 4, text: "Red Armor", classes: 'armor_4', notes:'Decreases HP loss by 8%.', modifier: 0.08, value:90}
    {index: 5, text: "Golden Armor", classes: 'armor_5', notes:'Decreases HP loss by 10%.', modifier: 0.1, value:120}
  ]
  head: [
    {index: 0, text: "No Helm", classes: 'head_0', notes:'Training helm.', modifier: 0.00, value:0}
    {index: 1, text: "Leather Helm", classes: 'head_1', notes:'Decreases HP loss by 2%.', modifier: 0.02, value:15}
    {index: 2, text: "Chain Coif", classes: 'head_2', notes:'Decreases HP loss by 3%.', modifier: 0.03, value:25}
    {index: 3, text: "Plate Helm", classes: 'head_3', notes:'Decreases HP loss by 4%.', modifier: 0.04, value:45}
    {index: 4, text: "Red Helm", classes: 'head_4', notes:'Decreases HP loss by 5%.', modifier: 0.05, value:60}
    {index: 5, text: "Golden Helm", classes: 'head_5', notes:'Decreases HP loss by 6%.', modifier: 0.06, value:80}
  ]
  shield: [
    {index: 0, text: "No Shield", classes: 'shield_0', notes:'No Shield.', modifier: 0.00, value:0}
    {index: 1, text: "Wooden Shield", classes: 'shield_1', notes:'Decreases HP loss by 2%', modifier: 0.02, value:20}
    {index: 2, text: "Buckler", classes: 'shield_2', notes:'Decreases HP loss by 4%.', modifier: 0.04, value:35}
    {index: 3, text: "Enforced Shield", classes: 'shield_3', notes:'Decreases HP loss by 5%.', modifier: 0.05, value:55}
    {index: 4, text: "Red Shield", classes: 'shield_4', notes:'Decreases HP loss by 7%.', modifier: 0.07, value:70}
    {index: 5, text: "Golden Shield", classes: 'shield_5', notes:'Decreases HP loss by 8%.', modifier: 0.08, value:90}
  ]
  potion: {type: 'potion', text: "Potion", notes: "Recover 15 HP", value: 25, classes: 'potion'}
  reroll: {type: 'reroll', text: "Re-Roll", classes: 'reroll', notes: "Resets your tasks. When you're struggling and everything's red, use for a clean slate.", value:0 }

  pets: [
    {index: 0, text: 'Bear Cub', name: 'bearcub', icon: 'Pet-BearCub-Base.png', value: 3}
    {index: 1, text: 'Cactus', name: 'cactus', icon: 'Pet-Cactus-Base.png', value: 3}
    {index: 2, text: 'Drake', name: 'dragon', icon: 'Pet-Dragon-Base.png', value: 3}
    {index: 3, text: 'Flying Pig', name: 'flyingpig', icon: 'Pet-FlyingPig-Base.png', value: 3}
    {index: 4, text: 'Fox', name: 'fox', icon: 'Pet-Fox-Base.png', value: 3}
    {index: 5, text: 'Lion Cub', name: 'lioncub', icon: 'Pet-LionCub-Base.png', value: 3}
    {index: 6, text: 'Panda Cub', name: 'pandacub', icon: 'Pet-PandaCub-Base.png', value: 3}
    {index: 7, text: 'Tiger Cub', name: 'tigercub', icon: 'Pet-TigerCub-Base.png', value: 3}
    {index: 8, text: 'Red Wolf', name: 'wolfDesert', icon: 'Pet-Wolf-Desert.png', value: 3}
    {index: 9, text: 'Red Wolf', name: 'wolfGolden', icon: 'Pet-Wolf-Golden.png', valu: 3}
    {index: 10, text: 'Red Wolf', name: 'wolfRed', icon: 'Pet-Wolf-Red.png', value: 3}
    {index: 11, text: 'Shade Wolf', name: 'wolfShade', icon: 'Pet-Wolf-Shade.png', value: 3}
    {index: 12, text: 'Skeleton Wolf', name: 'wolfSkeleton', icon: 'Pet-Wolf-Skeleton.png', value: 3}
    {index: 13, text: 'Veteran Wolf', name: 'wolfVeteran', icon: 'Pet-Wolf-Veteran.png', value: 3}
    {index: 14, text: 'White Wolf', name: 'wolfWhite', icon: 'Pet-Wolf-White.png', value: 3}
    {index: 15, text: 'Zombie Wolf', name: 'wolfZombie', icon: 'Pet-Wolf-Zombie.png', value: 3}
    {index: 16, text: 'Wolf', name: 'wolfBorder', icon: 'wolf_border.png', value: 3}
  ]

# add "type" to each item, so we can reference that as "weapon" or "armor" in the html
_.each ['weapon', 'armor', 'head', 'shield'], (key) ->
  _.each items[key], (item) -> item.type = key

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

  appExports.selectPet = (e, el) ->
    name = $(el).attr('data-pet')
    pet = _.find items.pets, (p) -> p.name == name
    debugger
    if user.get "items.pets.#{name}"
      user.set 'items.pet', pet
    else
      tokens = user.get('balance')*4
      if tokens > 3
        r = confirm("Buy this pet with 2 of your #{tokens} tokens?");
        if r
          user.set "items.pets.#{name}",true
          user.set 'items.pet', pet
          model.set "_view.pets.#{name}.userOwns", true
          user.set 'balance', (tokens - 2) / 4
      else
        $('#more-tokens-modal').modal('show')

  appExports.activateRewardsTab = ->
    model.set '_view.activeTabRewards', true
    model.set '_view.activeTabPets', false
  appExports.activatePetsTab = ->
    model.set '_view.activeTabPets', true
    model.set '_view.activeTabRewards', false

  user.on 'set', 'flags.itemsEnabled', (captures, args) ->
    return unless captures == true
    html = """
           <div class='item-store-popover'>
           <img src='/img/BrowserQuest/chest.png' />
           Congratulations, you have unlocked the Item Store! You can now buy weapons, armor, potions, etc. Read each item's comment for more information.
           <a href='#' onClick="$('ul.items').popover('hide');return false;">[Close]</a>
           </div>
           """
    $('ul.items').popover
      title: "Item Store Unlocked"
      placement: 'left'
      trigger: 'manual'
      html: true
      content: html
    $('ul.items').popover 'show'

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

  _.each items.pets, (p, key) ->
    items.pets[key].userOwns = true if obj.items.pets[p.name]
  model.set '_view.items.pets', items.pets



