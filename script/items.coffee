_ = require 'lodash'

items = module.exports.items =
  weapon: [
    {index: 0, text: "Training Sword", classes: "weapon_0", notes:'Training weapon.', strength: 0, value:0}
    {index: 1, text: "Sword", classes:'weapon_1', notes:'Increases experience gain by 3%.', strength: 3, value:20}
    {index: 2, text: "Axe", classes:'weapon_2', notes:'Increases experience gain by 6%.', strength: 6, value:30}
    {index: 3, text: "Morningstar", classes:'weapon_3', notes:'Increases experience gain by 9%.', strength: 9, value:45}
    {index: 4, text: "Blue Sword", classes:'weapon_4', notes:'Increases experience gain by 12%.', strength: 12, value:65}
    {index: 5, text: "Red Sword", classes:'weapon_5', notes:'Increases experience gain by 15%.', strength: 15, value:90}
    {index: 6, text: "Golden Sword", classes:'weapon_6', notes:'Increases experience gain by 18%.', strength: 18, value:120}
    {index: 7, text: "Dark Souls Blade", classes:'weapon_7', notes:'Increases experience gain by 21%.', strength: 21, value:150, canOwn: ((u)-> +u.backer?.tier >= 70)}
    {index: 8, text: "Crystal Blade", classes:'weapon_8', notes:'Increases experience gain by 24%.', strength: 24, value:170, canOwn: ((u)-> +u.contributor?.level >= 4)}
  ]
  armor: [
    {index: 0, text: "Cloth Armor", classes: 'armor_0', notes:'Training armor.', defense: 0, value:0}
    {index: 1, text: "Leather Armor", classes: 'armor_1', notes:'Decreases HP loss by 4%.', defense: 4, value:30}
    {index: 2, text: "Chain Mail", classes: 'armor_2', notes:'Decreases HP loss by 6%.', defense: 6, value:45}
    {index: 3, text: "Plate Mail", classes: 'armor_3', notes:'Decreases HP loss by 7%.', defense: 7, value:65}
    {index: 4, text: "Red Armor", classes: 'armor_4', notes:'Decreases HP loss by 8%.', defense: 8, value:90}
    {index: 5, text: "Golden Armor", classes: 'armor_5', notes:'Decreases HP loss by 10%.', defense: 10, value:120}
    {index: 6, text: "Shade Armor", classes: 'armor_6', notes:'Decreases HP loss by 12%.', defense: 12, value:150, canOwn: ((u)-> +u.backer?.tier >= 45)}
    {index: 7, text: "Crystal Armor", classes: 'armor_7', notes:'Decreases HP loss by 14%.', defense: 14, value:170, canOwn: ((u)-> +u.contributor?.level >= 2)}
  ]
  head: [
    {index: 0, text: "No Helm", classes: 'head_0', notes:'Training helm.', defense: 0, value:0}
    {index: 1, text: "Leather Helm", classes: 'head_1', notes:'Decreases HP loss by 2%.', defense: 2, value:15}
    {index: 2, text: "Chain Coif", classes: 'head_2', notes:'Decreases HP loss by 3%.', defense: 3, value:25}
    {index: 3, text: "Plate Helm", classes: 'head_3', notes:'Decreases HP loss by 4%.', defense: 4, value:45}
    {index: 4, text: "Red Helm", classes: 'head_4', notes:'Decreases HP loss by 5%.', defense: 5, value:60}
    {index: 5, text: "Golden Helm", classes: 'head_5', notes:'Decreases HP loss by 6%.', defense: 6, value:80}
    {index: 6, text: "Shade Helm", classes: 'head_6', notes:'Decreases HP loss by 7%.', defense: 7, value:100, canOwn: ((u)-> +u.backer?.tier >= 45)}
    {index: 7, text: "Crystal Helm", classes: 'head_7', notes:'Decreases HP loss by 8%.', defense: 8, value:120, canOwn: ((u)-> +u.contributor?.level >= 3)}
  ]
  shield: [
    {index: 0, text: "No Shield", classes: 'shield_0', notes:'No Shield.', defense: 0, value:0}
    {index: 1, text: "Wooden Shield", classes: 'shield_1', notes:'Decreases HP loss by 3%', defense: 3, value:20}
    {index: 2, text: "Buckler", classes: 'shield_2', notes:'Decreases HP loss by 4%.', defense: 4, value:35}
    {index: 3, text: "Reinforced Shield", classes: 'shield_3', notes:'Decreases HP loss by 5%.', defense: 5, value:55}
    {index: 4, text: "Red Shield", classes: 'shield_4', notes:'Decreases HP loss by 7%.', defense: 7, value:70}
    {index: 5, text: "Golden Shield", classes: 'shield_5', notes:'Decreases HP loss by 8%.', defense: 8, value:90}
    {index: 6, text: "Tormented Skull", classes: 'shield_6', notes:'Decreases HP loss by 9%.', defense: 9, value:120, canOwn: ((u)-> +u.backer?.tier >= 45)}
    {index: 7, text: "Crystal Shield", classes: 'shield_7', notes:'Decreases HP loss by 10%.', defense: 10, value:150, canOwn: ((u)-> +u.contributor?.level >= 5)}
  ]
  potion: {type: 'potion', text: "Potion", notes: "Recover 15 HP (Instant Use)", value: 25, classes: 'potion'}
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

# we somtimes want item arrays above in reverse order, for backward lookups (you'll see later in the code)
reversed = {}

_.each ['weapon', 'armor', 'head', 'shield'], (type) ->
  reversed[type] = items[type].slice().reverse()
  # add "type" to each item, so we can reference that as "weapon" or "armor" in the html
  # Also add canOwn(), which we use when comparing if user is a backer or contributor - but defaulted to `return true`
  _.each items[type], (item) -> _.defaults(item, {type, canOwn: ->true})

_.each items.pets, (pet) -> pet.notes = 'Find a hatching potion to pour on this egg, and it will hatch into a loyal pet.'
_.each items.hatchingPotions, (hatchingPotion) -> hatchingPotion.notes = "Pour this on an egg, and it will hatch as a #{hatchingPotion.text} pet."

module.exports.buyItem = (user, type) ->
  nextItem =
    if type is 'potion' then items.potion
    else _.find items[type].slice(~~user.items[type] + 1), ((i) -> i.canOwn user)

  return false if +user.stats.gp < +nextItem.value
  if nextItem.type is 'potion'
    user.stats.hp += 15;
    user.stats.hp = 50 if user.stats.hp > 50
  else
    user.items[type] = ~~nextItem.index
    if +user.items.weapon >= 6 and +user.items.armor >= 5 and +user.items.head >= 5 and +user.items.shield >= 5
      user.achievements.ultimateGear = true;
  user.stats.gp -= +nextItem.value
  true

###
  update store
###
module.exports.updateStore = (user) ->
  changes = {}
  _.each ['weapon', 'armor', 'shield', 'head'], (type) ->
    # Find the first item that fits the "next" bill, from between current item and end of the list
    curr = user.items?[type] or 0
    changes[type] = _.find(items[type].slice(curr+1), ((item) -> item.canOwn user)) or {hide:true}
  changes.potion = items.potion
  changes.reroll =  items.reroll
  changes

###
  Gets an item, and caps max to the last item in its array
###
module.exports.getItem = (type, index=0) ->
  # if they set their gear manually to something over what they can own, just set to 0 to avoid errors
  i = if (~~index > items[type].length - 1) then 0 else ~~index
  items[type][i]

###
  User's currently equiped item
  TODO this function is ugly, find a more elegant solution
###
module.exports.equipped = (type, item=0, pref={gender:'m', armorSet:'v1'}, backer={}, contributor={}) ->
  lastStandardItem = items[type].length - 3 # -1 for 0-based index, -2 for backer + contrib
  if (item > lastStandardItem) and !items[type][item]?.canOwn({backer,contributor})
    # They entered a # above what's legal in the restore dialog, find first legit item. (we should do checking on the restore-save instead)
    item = _.find(reversed[type], ((i) -> i.canOwn({backer, contributor}))).index

  # backer / contrib (they don't have gender)
  return "#{type}_#{item}" if (item > lastStandardItem)

  # Females have some special thing going on for their armor / helms
  if (type in ['armor', 'head'] and pref.gender is 'f')
    return "f_armor_#{item}_#{pref.armorSet}" if (item is 0 and type is 'armor')
    return "f_head_#{item}_#{pref.armorSet}" if (item > 1 and type is 'head')

  return "#{pref.gender}_#{type}_#{item}"