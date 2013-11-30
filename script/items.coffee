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
    {index: 0, text: "Training Sword", notes:'Practice weapon. Confers no benefit.', value:0}
    {index: 1, text: "Sword", notes:'Common soldier\'s blade. Increases STR by 3.', str: 3, value:20}
    {index: 2, text: "Axe", notes:'Double-bitted battle-axe. Increases STR by 6.', str: 6, value:30}
    {index: 3, text: "Morning Star", notes:'Heavy club with brutal spikes. Increases STR by 9.', str: 9, value:45}
    {index: 4, text: "Sapphire Blade", notes:'Sword whose edge bites like the north wind. Increases STR by 12.', str: 12, value:65}
    {index: 5, text: "Ruby Sword", notes:'Weapon whose forge-glow never fades. Increases STR by 15.', str: 15, value:90}
    {index: 6, text: "Golden Sword", notes:'Bane of creatures of darkness. Increases STR by 18.', str: 18, value:120}
  ]
  rogue: [
    {index: 0, text: "Practice Bow", notes:'Training weapon. Confers no benefit.', value:0}
    {index: 1, text: "Short Bow", notes:'Simple bow best at close ranges. Increases STR by 2.', str: 2, value:20}
    {index: 2, text: "Long Bow", notes:'Bow with a strong draw for extra distance. Increases STR by 5.', str: 5, value:50}
    {index: 3, text: "Recurve Bow", notes:'Built with advanced techniques. Increases STR by 8.', str: 8, value:80}
    {index: 4, text: "Icicle Bow", notes:'Fires arrows of piercing cold. Increases STR by 12.', str: 12, value:120}
    {index: 5, text: "Meteor Bow", notes:'Rains flame upon your foes. Increases STR by 16.', str: 16, value:160}
    {index: 6, text: "Golden Bow", notes:'As swift as sunlight and as sharp as lightning. Increases STR by 20.', str: 20, value:200}
  ]
  mage: [
    {index: 0, text: "Apprentice Staff", notes:'Practice staff. Confers no benefit.', value:0}
    {index: 1, text: "Wooden Staff", notes:'Basic implement of carven wood. Increases INT by 3 and PER by 1.', int: 3, per: 1, value:30}
    {index: 2, text: "Jeweled Staff", notes:'Focuses power through a precious stone. Increases INT by 6 and PER by 2.', int: 6, per: 2, value:50}
    {index: 3, text: "Iron Staff", notes:'Plated in metal to channel heat, cold, and lightning. Increases INT by 9 and PER by 3.', int: 9, per: 3, value:80}
    {index: 4, text: "Brass Staff", notes:'As powerful as it is heavy. Increases INT by 12 and PER by 5.', int:12, per: 5, value:120}
    {index: 5, text: "Archmage Staff", notes:'Assists in weaving the most complex of spells. Increases INT by 15 and PER by 7.', int: 15, per: 7, value:160}
    {index: 6, text: "Golden Staff", notes:'Fashioned of orichalcum, the alchemic gold, mighty and rare. Increases INT by 18 and PER by 9.', int: 18, per: 9, value:200}
  ]
  healer: [
    {index: 0, text: "Novice Rod", notes:'For healers in training. Confers no benefit.', value:0}
    {index: 1, text: "Acolyte Rod", notes:'Crafted during a healer\'s initiation. Increases INT by 2.', int: 2, value:20}
    {index: 2, text: "Quartz Rod", notes:'Topped with a gem bearing curative properties. Increases INT by 3.', int: 3, value:30}
    {index: 3, text: "Amethyst Rod", notes:'Purifies poison at a touch. Increases INT by 5.', int: 5, value:45}
    {index: 4, text: "Priest Rod", notes:'As much a badge of office as a healing tool. Increases INT by 7.', int:7, value:65}
    {index: 5, text: "Royal Crosier", notes:'Shines with the pure light of blessings. Increases INT by 9.', int: 9, value:90}
    {index: 6, text: "Golden Crosier", notes:'Soothes the pain of all who look upon it. Increases INT by 11.', int: 11, value:120}
  ]

items.armor =
  warrior: [
    {index: 0, text: "Cloth Armor", notes:'Ordinary clothing. Confers no benefit.', value:0}
    {index: 1, text: "Leather Armor", notes:'Jerkin of sturdy boiled hide. Increases CON by 3.', con: 3, value:30}
    {index: 2, text: "Chain Mail", notes:'Armor of interlocked metal rings. Increases CON by 5.', con: 5, value:45}
    {index: 3, text: "Plate Armor", notes:'Suit of all-encasing steel, the pride of knights. Increases CON by 7.', con: 7, value:65}
    {index: 4, text: "Red Armor", notes:'Heavy plate glowing with defensive enchantments. Increases CON by 9.', con: 9, value:90}
    {index: 5, text: "Golden Armor", notes:'Looks ceremonial, but no known blade can pierce it. Increases CON by 11.', con: 11, value:120}
  ]
  rogue: [
    {index: 0, text: "Cloth Armor", notes:'Ordinary clothing. Confers no benefit.', value:0}
    {index: 1, text: "Oiled Leather", notes:'Leather armor treated to reduce noise. Increases PER by 6.', per: 6, value:30}
    {index: 2, text: "Black Leather", notes:'Colored with dark dye to blend into shadows. Increases PER by 9', per: 9, value:45}
    {index: 3, text: "Camouflage Vest", notes:'Equally discreet in dungeon or wilderness. Increases PER by 12.', per: 12, value:65}
    {index: 4, text: "Penumbral Armor", notes:'Wraps the wearer in a veil of twilight. Increases PER by 15.', per: 15, value:90}
    {index: 5, text: "Umbral Armor", notes:'Allows stealth in the open in broad daylight. Increases PER by 18.', per: 18, value:120}
  ]
  mage: [
    {index: 0, text: "Apprentice Garb", notes:'For students of magic. Confers no benefit.', value:0}
    {index: 1, text: "Magician Robe", notes:'Hedge-mage\'s outfit. Increases INT by 2.', int: 2, value:30}
    {index: 2, text: "Wizard Robe", notes:'Clothes for a wandering wonder-worker. Increases INT by 4.', int: 4, value:45}
    {index: 3, text: "Robe of Mysteries", notes:'Denotes initiation into elite secrets. Increases INT by 6.', int: 6, value:65}
    {index: 4, text: "Archmage Robe", notes:'Spirits and elementals bow before it. Increases INT by 9.', int: 9, value:90}
    {index: 5, text: "Royal Magus Robe", notes:'Symbol of the power behind the throne. Increases INT by 12.', int: 12, value:120}
  ]
  healer: [
    {index: 0, text: "Novice Robe", notes:'For healers in training. Confers no benefit.', value:0}
    {index: 1, text: "Acolyte Robe", notes:'Garment showing humility and purpose. Increases CON by 6.', con: 6, value:30}
    {index: 2, text: "Medic Robe", notes:'Worn by those dedicated to tending the wounded in battle. Increases CON by 9.', con: 9, value:45}
    {index: 3, text: "Defender Vestment", notes:'Turns the healer\'s own magics inward to fend off harm. Increases CON by 12.', con: 12, value:65}
    {index: 4, text: "Priest Vestment", notes:'Projects authority and dissipates curses. Increases CON by 15.', con: 15, value:90}
    {index: 5, text: "Royal Vestment", notes:'Attire of those who have saved the lives of kings. Increases CON by 18.', con: 18, value:120}
  ]

items.head =
  warrior: [
    {index: 0, text: "No Helm", notes:'No headgear.', value:0}
    {index: 1, text: "Leather Helm", notes:'Cap of sturdy boiled hide. Increases STR by 2.', str: 2, value:15}
    {index: 2, text: "Chain Coif", notes:'Hood of interlocked metal rings. Increases STR by 4.', str: 4, value:25}
    {index: 3, text: "Plate Helm", notes:'Thick steel helmet, proof against any blow. Increases STR by 6.', str: 6, value:40}
    {index: 4, text: "Red Helm", notes:'Set with rubies for power, and glows when the wearer is angered. Increases STR by 9.', str: 9, value:60}
    {index: 5, text: "Golden Helm", notes:'Regal crown bound to shining armor. Increases STR by 12.', str: 12, value:80}
  ]
  rogue: [
    {index: 0, text: "No Hood", notes:'No headgear.', value:0}
    {index: 1, text: "Leather Hood", notes:'Basic protective cowl. Increases PER by 2.', per: 2, value:15}
    {index: 2, text: "Black Leather Hood", notes:'Useful for both defense and disguise. Increases PER by 4.', per: 4, value:25}
    {index: 3, text: "Camouflage Hood", notes:'Rugged, but doesn\'t impede hearing. Increases PER by 6.', per: 6, value:40}
    {index: 4, text: "Penumbral Hood", notes:'Grants perfect vision in darkness. Increases PER by 9.', per: 9, value:60}
    {index: 5, text: "Umbral Hood", notes:'Conceals even thoughts from those who would probe them. Increases PER by 12.', per: 12, value:80}
  ]
  mage: [
    {index: 0, text: "No Hat", notes:'No headgear.', value:0}
    {index: 1, text: "Magician Hat", notes:'Simple, comfortable, and fashionable. Increases PER by 2.', per: 2, value:15}
    {index: 2, text: "Cornuthaum", notes:'Traditional headgear of the itinerant wizard. Increases PER by 3.', per: 3, value:25}
    {index: 3, text: "Astrologer Hat", notes:'Adorned with the rings of Saturn. Increases PER by 5.', per: 5, value:40}
    {index: 4, text: "Archmage Hat", notes:'Focuses the mind for intensive spellcasting. Increases PER by 7.', per: 7, value:60}
    {index: 5, text: "Royal Magus Hat", notes:'Shows authority over fortune, weather, and lesser mages. Increases PER by 9.', per: 9, value:80}
  ]
  healer: [
    {index: 0, text: "No Circlet", notes:'No headgear.', value:0}
    {index: 1, text: "Quartz Circlet", notes:'Jeweled headpiece, for focus on the task at hand. Increases INT by 2.', int: 2, value:15}
    {index: 2, text: "Amethyst Circlet", notes:'A taste of luxury for a humble profession. Increases INT by 3.', int: 3, value:25}
    {index: 3, text: "Sapphire Circlet", notes:'Shines to let sufferers know their salvation is at hand. Increases INT by 5.', int: 5, value:40}
    {index: 4, text: "Emerald Diadem", notes:'Emits an aura of life and growth. Increases INT by 7.', int: 7, value:60}
    {index: 5, text: "Royal Diadem", notes:'For king, queen, or miracle-worker. Increases INT by 9.', int: 9, value:80}
  ]


items.shield =
  warrior: [
    {index: 0, text: "No Shield", notes:'No shield.', value:0}
    {index: 1, text: "Wooden Shield", notes:'Round shield of thick wood. Increases CON by 2.', con: 2, value:20}
    {index: 2, text: "Buckler", notes:'Light and sturdy, quick to bring to the defense. Increases CON by 3.', con: 3, value:35}
    {index: 3, text: "Reinforced Shield", notes:'Made of wood but bolstered with metal bands. Increases CON by 5.', con: 5, value:50}
    {index: 4, text: "Red Shield", notes:'Rebukes blows with a burst of flame. Increases CON by 7.', con: 7, value:70}
    {index: 5, text: "Golden Shield", notes:'Shining badge of the vanguard. Increases CON by 9.', con: 9, value:90}
  ]
  rogue: [
    {index: 0, text: "No Shield", notes:'No shield.', value:0}
  ]
  mage: [
    {index: 0, text: "No Shield", notes:'No shield.', def: 0, value:0}
  ]
  healer: [
    {index: 0, text: "No Shield", notes:'No shield.', def: 0, value:0}
    {index: 1, text: "Medic Buckler", notes:'Easy to disengage, freeing a hand for bandaging. Increases CON by 2.', con: 2, value:20}
    {index: 2, text: "Kite Shield", notes:'Tapered shield with the symbol of healing. Increases CON by 4.', con: 4, value:35}
    {index: 3, text: "Hospitaler Shield", notes:'Traditional shield of defender knights. Increases CON by 6.', con: 6, value:50}
    {index: 4, text: "Savior Shield", notes:'Turns blows from innocents as well as oneself. Increases CON by 9.', con: 9, value:70}
    {index: 5, text: "Royal Shield", notes:'Bestowed upon those most dedicated to the kingdom\'s defense. Increases CON by 12.', con: 12, value:90}
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
