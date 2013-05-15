({ define: (
  if typeof define == "function"
    define
  else
    (F)->
      F(require, exports, module)
)}).define (require, exports, module)->
  obj = module.exports = {};
  items = obj.items =
    {
    weapon: [
      {index: 0, text: "Training Sword", classes: "weapon_0", notes: 'Training weapon.', strength: 0, value: 0}
      {index: 1, text: "Sword", classes: 'weapon_1', notes: 'Increases experience gain by 3%.', strength: 3, value: 20}
      {index: 2, text: "Axe", classes: 'weapon_2', notes: 'Increases experience gain by 6%.', strength: 6, value: 30}
      {index: 3, text: "Morningstar", classes: 'weapon_3', notes: 'Increases experience gain by 9%.', strength: 9, value: 45}
      {index: 4, text: "Blue Sword", classes: 'weapon_4', notes: 'Increases experience gain by 12%.', strength: 12, value: 65}
      {index: 5, text: "Red Sword", classes: 'weapon_5', notes: 'Increases experience gain by 15%.', strength: 15, value: 90}
      {index: 6, text: "Golden Sword", classes: 'weapon_6', notes: 'Increases experience gain by 18%.', strength: 18, value: 120}
      {index: 7, text: "Dark Souls Blade", classes: 'weapon_7', notes: 'Increases experience gain by 21%.', strength: 21, value: 150}
    ]
    armor: [
      {index: 0, text: "Cloth Armor", classes: 'armor_0', notes: 'Training armor.', defense: 0, value: 0}
      {index: 1, text: "Leather Armor", classes: 'armor_1', notes: 'Decreases HP loss by 4%.', defense: 4, value: 30}
      {index: 2, text: "Chain Mail", classes: 'armor_2', notes: 'Decreases HP loss by 6%.', defense: 6, value: 45}
      {index: 3, text: "Plate Mail", classes: 'armor_3', notes: 'Decreases HP loss by 7%.', defense: 7, value: 65}
      {index: 4, text: "Red Armor", classes: 'armor_4', notes: 'Decreases HP loss by 8%.', defense: 8, value: 90}
      {index: 5, text: "Golden Armor", classes: 'armor_5', notes: 'Decreases HP loss by 10%.', defense: 10, value: 120}
      {index: 6, text: "Shade Armor", classes: 'armor_6', notes: 'Decreases HP loss by 12%.', defense: 12, value: 150}
    ]
    head: [
      {index: 0, text: "No Helm", classes: 'head_0', notes: 'Training helm.', defense: 0, value: 0}
      {index: 1, text: "Leather Helm", classes: 'head_1', notes: 'Decreases HP loss by 2%.', defense: 2, value: 15}
      {index: 2, text: "Chain Coif", classes: 'head_2', notes: 'Decreases HP loss by 3%.', defense: 3, value: 25}
      {index: 3, text: "Plate Helm", classes: 'head_3', notes: 'Decreases HP loss by 4%.', defense: 4, value: 45}
      {index: 4, text: "Red Helm", classes: 'head_4', notes: 'Decreases HP loss by 5%.', defense: 5, value: 60}
      {index: 5, text: "Golden Helm", classes: 'head_5', notes: 'Decreases HP loss by 6%.', defense: 6, value: 80}
      {index: 6, text: "Shade Helm", classes: 'head_6', notes: 'Decreases HP loss by 7%.', defense: 7, value: 100}
    ]
    shield: [
      {index: 0, text: "No Shield", classes: 'shield_0', notes: 'No Shield.', defense: 0, value: 0}
      {index: 1, text: "Wooden Shield", classes: 'shield_1', notes: 'Decreases HP loss by 3%', defense: 3, value: 20}
      {index: 2, text: "Buckler", classes: 'shield_2', notes: 'Decreases HP loss by 4%.', defense: 4, value: 35}
      {index: 3, text: "Enforced Shield", classes: 'shield_3', notes: 'Decreases HP loss by 5%.', defense: 5, value: 55}
      {index: 4, text: "Red Shield", classes: 'shield_4', notes: 'Decreases HP loss by 7%.', defense: 7, value: 70}
      {index: 5, text: "Golden Shield", classes: 'shield_5', notes: 'Decreases HP loss by 8%.', defense: 8, value: 90}
      {index: 6, text: "Tormented Skull", classes: 'shield_6', notes: 'Decreases HP loss by 9%.', defense: 9, value: 120}
    ]
    potion:
      {type: 'potion', text: "Potion", notes: "Recover 15 HP", value: 25, classes: 'potion'}
    reroll:
      {type: 'reroll', text: "Re-Roll", classes: 'reroll', notes: "Resets your task values back to 0 (yellow). Useful when everything's red and it's hard to stay alive.", value: 0 }
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
    }

  # add "type" to each item, so we can reference that as "weapon" or "armor" in the html
  ['weapon', 'armor', 'head', 'shield'].forEach (key)->
    items[key].forEach (item)->
      item.type = key

  items.pets.forEach (pet)->
    pet.notes = 'Find a hatching potion to pour on this egg, and one day it will hatch into a loyal pet.'
  items.hatchingPotions.forEach (hatchingPotion)->
    hatchingPotion.notes = "Pour this on an egg, and it will hatch as a #{hatchingPotion.text} pet."


  ###
    app exports
  ###
  obj.app = (appExports, user) ->
    appExports.buyItem = (e, el, next) ->
      #TODO: this should be working but it's not. so instead, i'm passing all needed values as data-attrs
      # item = model.at(e.target)
      gp = user.stats.gp
      [type, value, index] = [ $(el).attr('data-type'), $(el).attr('data-value'), $(el).attr('data-index') ]

      return if gp < value
      # make sure deduction doesn't happen unless purchase was successful, see https://github.com/lefnire/habitrpg/issues/233
      deductGP = ->
        user.stats.gp = gp - value
      if type == 'weapon'
        user.set 'items.weapon', index, deductGP
        updateStore model
      else if type == 'armor'
        user.set 'items.armor', index, deductGP
        updateStore model
      else if type == 'head'
        user.set 'items.head', index, deductGP
        updateStore model
      else if type == 'shield'
        user.set 'items.shield', index, deductGP
        updateStore model
      else if type == 'potion'
        hp = user.get 'stats.hp'
        hp += 15
        hp = 50 if hp > 50
        user.set 'stats.hp', hp, deductGP


  ###
    update store
  ###
  obj.updateStore = updateStore = (user) ->
    if !items.next?
      items.next =
        {}
    equipped = user.items

    ['weapon', 'armor', 'shield', 'head'].forEach (type) ->
      i = parseInt(equipped? [type] || 0) + 1
      showNext = true
      if i is items[type].length - 1
        if (type in ['armor', 'shield', 'head'])
          showNext = user.backer.tier >= 45 # backer armor
        else
          showNext = user.backer.tier >= 70 # backer weapon
      else if i is items[type].length
        showNext = false

      items.next[type] = if showNext then items[type][i] else {hide: true}




