_ = require 'lodash'

items = module.exports.items = {}

###
  ---------------------------------------------------------------
  Gear (Weapons, Armor, Head, Shield)
  Item definitions: {index, text, notes, value, str, def, int, per, classes, type}
  ---------------------------------------------------------------
###

###
  FIXME
  {index: 7, text: "Dark Souls Blade", classes:'weapon_7', notes:'Increases experience gain by 21%.', str: 21, value:150, canOwn: ((u)-> +u.backer?.tier >= 70)}
  {index: 8, text: "Crystal Blade", classes:'weapon_8', notes:'Increases experience gain by 24%.', str: 24, value:170, canOwn: ((u)-> +u.contributor?.level >= 4)}

  {index: 6, text: "Shade Armor", notes:'Decreases Health loss by 12%.', defense: 12, value:150, canOwn: ((u)-> +u.backer?.tier >= 45)}
  {index: 7, text: "Crystal Armor", notes:'Decreases Health loss by 14%.', defense: 14, value:170, canOwn: ((u)-> +u.contributor?.level >= 2)}

  {index: 6, text: "Shade Helm", notes:'Decreases Health loss by 7%.', defense: 7, value:100, canOwn: ((u)-> +u.backer?.tier >= 45)}
  {index: 7, text: "Crystal Helm", notes:'Decreases Health loss by 8%.', defense: 8, value:120, canOwn: ((u)-> +u.contributor?.level >= 3)}

  {index: 6, text: "Tormented Skull", notes:'Decreases Health loss by 9%.', defense: 9, value:120, canOwn: ((u)-> +u.backer?.tier >= 45)}
  {index: 7, text: "Crystal Shield", notes:'Decreases Health loss by 10%.', defense: 10, value:150, canOwn: ((u)-> +u.contributor?.level >= 5)}
###

items.weapon =
  warrior: [
    {index: 0, text: "Training Sword", notes:'Training weapon.', value:0}
    {index: 1, text: "Sword", notes:'Increases experience gain by 3%.', str: 3, value:20}
    {index: 2, text: "Axe", notes:'Increases experience gain by 6%.', str: 6, value:30}
    {index: 3, text: "Morningstar", notes:'Increases experience gain by 9%.', str: 9, value:45}
    {index: 4, text: "Blue Sword", notes:'Increases experience gain by 12%.', str: 12, value:65}
    {index: 5, text: "Red Sword", notes:'Increases experience gain by 15%.', str: 15, value:90}
    {index: 6, text: "Golden Sword", notes:'Increases experience gain by 18%.', str: 18, value:120}
  ]
  rogue: [
    {index: 0, text: "Training Sword", notes:'Training weapon.', value:0}
    {index: 1, text: "Short Bow", notes:'Increases experience gain by 3%.', str: 3, per: 3, value:20}
    {index: 2, text: "Long Bow", notes:'Increases experience gain by 6%.', str: 6, per: 6, value:30}
    {index: 3, text: "Load Bow", notes:'Increases experience gain by 9%.', str: 9, per: 9, value:45}
    {index: 4, text: "Blue Boe", notes:'Increases experience gain by 12%.', str: 12, per: 12, value:65}
    {index: 5, text: "Red Bow", notes:'Increases experience gain by 15%.', str: 15, per: 15, value:90}
    {index: 6, text: "Golden Bow", notes:'Increases experience gain by 18%.', str: 18, per: 18, value:120}
  ]
  wizard: [
    {index: 0, text: "Training Sword", notes:'Training weapon.', str: 0, value:0}
    {index: 1, text: "Wooden Staff", notes:'Increases experience gain by 3%.', int: 3, value:20}
    {index: 2, text: "Gnarled Staff", notes:'Increases experience gain by 6%.', int: 3, value:30}
    {index: 3, text: "Steel Wand", notes:'Increases experience gain by 9%.', int: 9, value:45}
    {index: 4, text: "Awesome Staff", notes:'Increases experience gain by 12%.', 3, value:65}
    {index: 5, text: "Red Staff", notes:'Increases experience gain by 15%.', int: 3, value:90}
    {index: 6, text: "Golden Staff", notes:'Increases experience gain by 18%.', int: 3, value:120}
  ]
  healer: [
    {index: 0, text: "Training Sword", notes:'Training weapon.', str: 0, value:0}
    {index: 1, text: "Wooden Staff", classes:'weapon_1', notes:'Increases experience gain by 3%.', int: 3, value:20}
    {index: 2, text: "Gnarled Staff", classes:'weapon_2', notes:'Increases experience gain by 6%.', int: 3, value:30}
    {index: 3, text: "Steel Wand", classes:'weapon_3', notes:'Increases experience gain by 9%.', int: 9, value:45}
    {index: 4, text: "Awesome Staff", classes:'weapon_4', notes:'Increases experience gain by 12%.', 3, value:65}
    {index: 5, text: "Red Staff", classes:'weapon_5', notes:'Increases experience gain by 15%.', int: 3, value:90}
    {index: 6, text: "Golden Staff", classes:'weapon_6', notes:'Increases experience gain by 18%.', int: 3, value:120}
  ]

items.armor =
  warrior: [
    {index: 0, text: "Cloth Armor", notes:'Training armor.', def: 0, value:0}
    {index: 1, text: "Leather Armor", notes:'Decreases Health loss by 4%.', def: 4, value:30}
    {index: 2, text: "Chain Mail", notes:'Decreases Health loss by 6%.', def: 6, value:45}
    {index: 3, text: "Plate Mail", notes:'Decreases Health loss by 7%.', def: 7, value:65}
    {index: 4, text: "Red Armor", notes:'Decreases Health loss by 8%.', def: 8, value:90}
    {index: 5, text: "Golden Armor", notes:'Decreases Health loss by 10%.', def: 10, value:120}
  ]
  rogue: [
    {index: 0, text: "Cloth Armor", notes:'Training armor.', def: 0, value:0}
    {index: 1, text: "Leather1", notes:'Decreases Health loss by 4%.', def: 4, value:30}
    {index: 2, text: "Leather2", notes:'Decreases Health loss by 6%.', def: 6, value:45}
    {index: 3, text: "Leather3", notes:'Decreases Health loss by 7%.', def: 7, value:65}
    {index: 4, text: "Leather4", notes:'Decreases Health loss by 8%.', def: 8, value:90}
    {index: 5, text: "Leather5", notes:'Decreases Health loss by 10%.', def: 10, value:120}
  ]
  wizard: [
    {index: 0, text: "Cloth Armor", notes:'Training armor.', def: 0, value:0}
    {index: 1, text: "Robes1", notes:'Decreases Health loss by 4%.', def: 4, value:30}
    {index: 2, text: "Robes2", notes:'Decreases Health loss by 6%.', def: 6, value:45}
    {index: 3, text: "Robes3", notes:'Decreases Health loss by 7%.', def: 7, value:65}
    {index: 4, text: "Robes4", notes:'Decreases Health loss by 8%.', def: 8, value:90}
    {index: 5, text: "Robes5", notes:'Decreases Health loss by 10%.', def: 10, value:120}
  ]
  healer: [
    {index: 0, text: "Cloth Armor", notes:'Training armor.', def: 0, value:0}
    {index: 1, text: "Robes1", notes:'Decreases Health loss by 4%.', def: 4, value:30}
    {index: 2, text: "Robes2", notes:'Decreases Health loss by 6%.', def: 6, value:45}
    {index: 3, text: "Robes3", notes:'Decreases Health loss by 7%.', def: 7, value:65}
    {index: 4, text: "Robes4", notes:'Decreases Health loss by 8%.', def: 8, value:90}
    {index: 5, text: "Robes5", notes:'Decreases Health loss by 10%.', def: 10, value:120}
  ]

items.head =
  warrior: [
    {index: 0, text: "No Helm", notes:'Training helm.', def: 0, value:0}
    {index: 1, text: "Leather Helm", notes:'Decreases Health loss by 2%.', def: 2, value:15}
    {index: 2, text: "Chain Coif", notes:'Decreases Health loss by 3%.', def: 3, value:25}
    {index: 3, text: "Plate Helm", notes:'Decreases Health loss by 4%.', def: 4, value:45}
    {index: 4, text: "Red Helm", notes:'Decreases Health loss by 5%.', def: 5, value:60}
    {index: 5, text: "Golden Helm", notes:'Decreases Health loss by 6%.', def: 6, value:80}
  ]
  rogue: [
    {index: 0, text: "No Helm", notes:'Training helm.', def: 0, value:0}
    {index: 1, text: "Leather1", notes:'Decreases Health loss by 2%.', def: 2, value:15}
    {index: 2, text: "Leather2", notes:'Decreases Health loss by 3%.', def: 3, value:25}
    {index: 3, text: "Leather3", notes:'Decreases Health loss by 4%.', def: 4, value:45}
    {index: 4, text: "Leather4", notes:'Decreases Health loss by 5%.', def: 5, value:60}
    {index: 5, text: "Leather5", notes:'Decreases Health loss by 6%.', def: 6, value:80}
  ]
  wizard: [
    {index: 0, text: "No Helm", notes:'Training helm.', defense: 0, value:0}
    {index: 1, text: "Wizard Hat 1", notes:'Decreases Health loss by 2%.', def: 2, value:15}
    {index: 2, text: "Wizard Hat 2", notes:'Decreases Health loss by 3%.', def: 3, value:25}
    {index: 3, text: "Wizard Hat 3", notes:'Decreases Health loss by 4%.', def: 4, value:45}
    {index: 4, text: "Wizard Hat 4", notes:'Decreases Health loss by 5%.', def: 5, value:60}
    {index: 5, text: "Wizard Hat 5", notes:'Decreases Health loss by 6%.', def: 6, value:80}
  ]
  healer: [
    {index: 0, text: "No Helm", notes:'Training helm.', defense: 0, value:0}
    {index: 1, text: "Healer Hat 1", notes:'Decreases Health loss by 2%.', def: 2, value:15}
    {index: 2, text: "Healer Hat 2", notes:'Decreases Health loss by 3%.', def: 3, value:25}
    {index: 3, text: "Healer Hat 3", notes:'Decreases Health loss by 4%.', def: 4, value:45}
    {index: 4, text: "Healer Hat 4", notes:'Decreases Health loss by 5%.', def: 5, value:60}
    {index: 5, text: "Healer Hat 5", notes:'Decreases Health loss by 6%.', def: 6, value:80}
  ]


items.shield =
  warrior: [
    {index: 0, text: "No Shield", notes:'No Shield.', def: 0, value:0}
    {index: 1, text: "Wooden Shield", notes:'Decreases Health loss by 3%', def: 3, value:20}
    {index: 2, text: "Buckler", notes:'Decreases Health loss by 4%.', def: 4, value:35}
    {index: 3, text: "Reinforced Shield", notes:'Decreases Health loss by 5%.', def: 5, value:55}
    {index: 4, text: "Red Shield", notes:'Decreases Health loss by 7%.', def: 7, value:70}
    {index: 5, text: "Golden Shield", notes:'Decreases Health loss by 8%.', def: 8, value:90}
  ]
  rogue: [
    {index: 0, text: "No Shield", notes:'No Shield.', def: 0, value:0}
  ]
  wizard: [
    {index: 0, text: "No Shield", notes:'No Shield.', def: 0, value:0}
  ]
  healer: [
    {index: 0, text: "No Shield", notes:'No Shield.', def: 0, value:0}
    {index: 1, text: "Healer Shield1", notes:'Decreases Health loss by 3%', def: 3, value:20}
    {index: 2, text: "Healer Sheild2", notes:'Decreases Health loss by 4%.', def: 4, value:35}
    {index: 3, text: "Healer Sheild3", notes:'Decreases Health loss by 5%.', def: 5, value:55}
    {index: 4, text: "Healer Sheild4", notes:'Decreases Health loss by 7%.', def: 7, value:70}
    {index: 5, text: "Healer Sheild5", notes:'Decreases Health loss by 8%.', def: 8, value:90}
  ]

# we sometimes want item arrays above in reverse order, for backward lookups (you'll see later in the code)
reversed = {}
_.each ['weapon', 'armor', 'head', 'shield'], (type) ->
  reversed[type] = {}
  _.each ['warrior', 'rogue', 'healer', 'wizard'], (_class) ->
    reversed[type][_class] = items[type][_class].slice().reverse()
    # add "type" to each item, so we can reference that as "weapon" or "armor" in the html
    # Also add canOwn(), which we use when comparing if user is a backer or contributor - but defaulted to `return true`
    _.each items[type][_class], (item, i) ->
      _.defaults(item, {type, canOwn: (->true), classes: "#{type}_#{i}-#{_class}", str:0, int:0, per:0, def:0})

###
  ---------------------------------------------------------------
  Potion & Re-roll
  TODO rename / remove re-roll?
  ---------------------------------------------------------------
###

items.potion = type: 'potion', text: "Health Potion", notes: "Recover 15 Health (Instant Use)", value: 25, classes: 'potion'
items.reroll = type: 'reroll', text: "Re-Roll", notes: "Resets your task values back to 0 (yellow). Useful when everything's red and it's hard to stay alive.", value:0

###
  ---------------------------------------------------------------
  Spells
  ---------------------------------------------------------------
  Text, notes, and mana are obvious. The rest:

  * {target}: one of [task, self, party, user]. This is very important, because if the cast() function is expecting one
    thing and receives another, it will cause errors. `self` is used for self buffs, multi-task debuffs, AOEs (eg, meteor-shower),
    etc. Basically, use self for anything that's not [task, party, user] and is an instant-cast

  * {cast}: the fucntion that's run to perform the ability's action. This is pretty slick - because this is exported to the
    web, this function can be performed on the client and on the server. `user` param is self (needed for determining your
    own stats for effectiveness of cast), and `target` param is one of [task, party, user]. In the case of `self` spells,
    you act on `user` instead of `target`. You can trust these are the correct objects, as long as the `target` attr of the
    spell is correct. Take a look at habitrpg/src/models/user.js and habitrpg/src/models/task.js for what attributes are
    available on each model. Note `task.value` is its "redness". If party is passed in, it's an array of users,
    so you'll want to iterate over them like: `_.each(target,function(member){...})`

  Note, user.stats.mp is docked after automatically (it's appended to functions automatically down below in an _.each)
###

items.spells =
  wizard:
    fireball:
      text: 'Burst of Flames'
      mana: 10
      target: 'task'
      notes: 'With a crack, flames burst from your staff, scorching a task. You deal much higher damage to the task and gain additional xp.'
      cast: (user, target) ->
        target.value += user.stats.int + crit(user)
    lightning:
      text: 'Lightning Strike'
      mana: 15
      target: 'task'
      notes: 'A bolt a lightning pierces through a task. There is a high chance of a critical hit.'
      cast: (user, target) ->
        target.value += user.stats.per*2 + crit(user)
    frost:
      text: 'Chilling Frost'
      mana: 35
      target: 'party'
      notes: "Ice forms of the party's tasks, slowing them down and opening them up to more attacks. Your party gains a buff to xp.",
      cast: (user, target) ->
        ## lasts for 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.exp = user.stats.int
    darkness:
      text: 'Shroud of Darkness'
      mana: 30
      target: 'party'
      notes: "Unearthly shadows form and wisp around your party, concealing their presence. Under the shroud, your party can sneak up on tasks, dealing more critical hits.",
      cast: (user, target) ->
        ## lasts for 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.crit = user.stats.per

  warrior:
    smash:
      text: 'Brutal Smash'
      mana: 10
      target: 'task'
      notes: "You savagely hit a single task with all of your might, beating it into submission. The task's redness decreases."
      cast: (user, target) ->
        target.value -= user.stat.str
    defensiveStance:
      text: 'Defensive Stance'
      mana: 25
      target: 'self'
      notes: "You take a moment to relax your body and enter a defensive stance to ready yourself for the tasks' next onslaught. Reduced damage from dailies at the end of the day."
      cast: (user, target) ->
        ## Only affects health loss at cron from dailies ##
        user.stats.buffs.con = user.stats.con/2
    valorousPresence:
      text: 'Valorous Presence'
      mana: 20
      target: 'party'
      notes: "Your presence emboldens the party. Their newfound courage gives them a boost of strength. Party members gain a buff to their STR."
      cast: (user, target) ->
        ## lasts 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.str = user.stats.str/2
    intimidate:
      text: 'Intimidating Gaze'
      mana: 15
      target: 'party'
      notes: "Your gaze strikes fear into the hearts of your party's enemies. The party gains a moderate boost to defense."
      cast: (user, target) ->
        ## lasts 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.con = user.stats.con/2

  rogue:
    pickPocket:
      text: 'Pickpocket'
      mana: 10
      target: 'task'
      notes: "Your nimble fingers run through the task's pockets and 'find' some treasures for yourself. You gain an increased gold bonus on the task and a higher chance of an item drop."
      cast: (user, target) ->
        user.stats.gp += user.stats.per * target.value
    backStab:
      text: 'Backstab'
      mana: 15
      target: 'task'
      notes: "Without a sound, you sweep behind a task and stab it in the back. You deal higher damage to the stat, with a higher chance of a critical hit."
      cast: (user, target) ->
        target.value -= user.stats.str
        crit += user.stats.per*2
    stealth:
      text: 'Tools of the Trade'
      mana: 20
      target: 'party'
      notes: "You share your thievery tools with the party to aid them in 'acquiring' more gold. The party's gold bonus for tasks is buffed for a day."
      cast: (user, target) ->
        ## lasts 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.gp = user.stats.per
    speedburst:
      text: 'Burst of Speed'
      mana: 25
      target: 'party'
      notes: "You hurry your step and dance circles around your party's enemies. You assist your party, helping them do extra damage to a number of tasks equal to half your strength."
      cast: (user, target) ->
        # each party member gets this bonus to a number tasks == user.stats.str/2
        # the effect lasts 24 hours, or when until the party member has used the effected number of tasks. whichever occurs sooner.
        # the 24 hour limit is to help prevent it stacking on a player who has been absent for a long time.
        _.each target, (member) ->
          member.stats.buffs.str = user.stats.str/2

  healer:
    heal:
      text: 'Healing Light'
      mana: 15
      target: 'self'
      notes: 'Light covers your body, healing your wounds. You gain a boost to your health.'
      cast: (user, target) ->
        target.stats.hp += user.stats.con
    brightness:
      text: 'Searing Brightness'
      mana: 15
      target: 'self'
      notes: "You cast a burst of light that blinds all of your tasks. The redness of your tasks is reduced"
      cast: (user, target) ->
        target.value -= user.stats.int
    protectAura:
      text: 'Protective Aura'
      mana: 30
      target: 'party'
      notes: "A magical aura surrounds your party members, protecting them from damage. Your party members gain a buff to their defense."
      cast: (user, target) ->
        ## lasts 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.con = user.stats.con/2
    heallAll:
      text: 'Blessing'
      mana: 25
      target: 'party'
      notes: "Soothing light envelops your party and heals them of their injuries. Your party members gain a boost to their health."
      cast: (user, target) ->
        _.each target, (member) ->
          member.stats.hp += user.con/2

crit = (user) -> (Math.random() * user.stats.per + 1)

# Intercept all spells to reduce user.stats.mp after casting the spell
_.each items.spells, (spellClass) ->
  _.each spellClass, (spell, k) ->
    spell.name = k
    _cast = spell.cast
    spell.cast = (user, target) ->
      #return if spell.target and spell.target != (if target.type then 'task' else 'user')
      _cast(user,target)
      user.stats.mp = user.stats.mp - spell.mana

###
  ---------------------------------------------------------------
  Drops
  ---------------------------------------------------------------
###

items.eggs =
  # value & other defaults set below
  Wolf:             text: 'Wolf', adjective: 'loyal'
  TigerCub:         text: 'Tiger Cub', mountText: 'Tiger', adjective: 'fierce'
  PandaCub:         text: 'Panda Cub', mountText: 'Panda', adjective: 'gentle'
  LionCub:          text: 'Lion Cub',  mountText: 'Lion', adjective: 'regal'
  Fox:              text: 'Fox', adjective: 'wily'
  FlyingPig:        text: 'Flying Pig', adjective: 'whimsical'
  Dragon:           text: 'Dragon', adjective: 'mighty'
  Cactus:           text: 'Cactus', adjective: 'prickly'
  BearCub:          text: 'Bear Cub',  mountText: 'Bear', adjective: 'cuddly'
  #{text: 'Polar Bear Cub', name: 'PolarBearCub', value: 3}
_.each items.eggs, (egg,k) ->
  _.defaults egg,
    value: 3
    name: k
    notes: "Find a hatching potion to pour on this egg, and it will hatch into a #{egg.adjective} #{egg.text}."
    mountText: egg.text

items.hatchingPotions =
  Base:             value: 2, text: 'Base'
  White:            value: 2, text: 'White'
  Desert:           value: 2, text: 'Desert'
  Red:              value: 3, text: 'Red'
  Shade:            value: 3, text: 'Shade'
  Skeleton:         value: 3, text: 'Skeleton'
  Zombie:           value: 4, text: 'Zombie'
  CottonCandyPink:  value: 4, text: 'Cotton Candy Pink'
  CottonCandyBlue:  value: 4, text: 'Cotton Candy Blue'
  Golden:           value: 5, text: 'Golden'
_.each items.hatchingPotions, (pot,k) ->
  _.defaults pot, {name: k, value: 2, notes: "Pour this on an egg, and it will hatch as a #{pot.text} pet."}

items.food =
  Meat:             text: 'Meat', target: 'Base'
  Milk:             text: 'Milk', target: 'White'
  Potatoe:          text: 'Potato', target: 'Desert'
  Strawberry:       text: 'Strawberry', target: 'Red'
  Chocolate:        text: 'Chocolate', target: 'Shade'
  Fish:             text: 'Fish', target: 'Skeleton'
  RottenMeat:       text: 'Rotten Meat', target: 'Zombie'
  CottonCandyPink:  text: 'Pink Cotton Candy', target: 'CottonCandyPink'
  CottonCandyBlue:  text: 'Blue Cotton Candy', target: 'CottonCandyBlue'
  Honey:            text: 'Honey', target: 'Golden'
  # FIXME what to do with these extra items? Should we add "targets" (plural) for food instead of singular, so we don't have awkward extras?
  #Cheese:           text: 'Cheese', target: 'Golden'
  #Watermelon:       text: 'Watermelon', target: 'Golden'
  #SeaWeed:          text: 'SeaWeed', target: 'Golden'
  Saddle:           text: 'Saddle', value: 5, notes: 'Instantly raises your pet into a mount.'
_.each items.food, (food,k) ->
  _.defaults food, {value: 1, name: k, notes: "Feed this to a pet and it may grow into a sturdy steed."}

###
  ---------------------------------------------------------------
  Helper Functions
  ---------------------------------------------------------------
###

module.exports.buyItem = (user, type) ->
  nextItem =
    if type is 'potion' then items.potion
    else _.find items[type][user.stats.class || 'warrior'].slice(~~user.items[type] + 1), ((i) -> i.canOwn user)

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
    changes[type] = _.find(items[type][user.stats.class || 'warrior'].slice(curr+1), ((item) -> item.canOwn user)) or {hide:true}
  changes.potion = items.potion
  changes.reroll =  items.reroll
  changes

###
  Gets an item, and caps max to the last item in its array
###
module.exports.getItem = (type, index=0) ->
  # FIXME
  return items[type].warrior[1]
  # if they set their gear manually to something over what they can own, just set to 0 to avoid errors
  i = if (~~index > items[type].warrior.length - 1) then 0 else ~~index
  items[type].warrior[i]

###
  User's currently equiped item
  TODO this function is ugly, find a more elegant solution
###
module.exports.equipped = (type, user) ->
  #FIXME handle contrib & backer
#  lastStandardItem = items[type].length - 3 # -1 for 0-based index, -2 for backer + contrib
#  if (item > lastStandardItem) and !items[type][item]?.canOwn({backer,contributor})
#    # They entered a # above what's legal in the restore dialog, find first legit item. (we should do checking on the restore-save instead)
#    item = _.find(reversed[type], ((i) -> i.canOwn({backer, contributor}))).index

  # backer / contrib (they don't have gender)
#  return "#{type}_#{item}" if (item > lastStandardItem)

#  # Females have some special thing going on for their armor / helms
#  if (type in ['armor', 'head'] and pref.gender is 'f')
#    return "f_armor_#{item}_#{pref.armorSet}" if (item is 0 and type is 'armor')
#    return "f_head_#{item}_#{pref.armorSet}" if (item > 1 and type is 'head')
#
#  return "#{pref.gender}_#{type}_#{item}"
  return "m_#{type}_#{item.items[type]}-#{user.stats.class}"
