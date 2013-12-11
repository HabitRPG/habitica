_ = require 'lodash'
api = module.exports

###
  ---------------------------------------------------------------
  Gear (Weapons, Armor, Head, Shield)
  Item definitions: {index, text, notes, value, str, def, int, per, classes, type}
  ---------------------------------------------------------------
###


gear =
  weapon:
    base:
      0: text: "No Weapon", notes:'No Weapon.', value:0
    warrior:
      0: text: "Training Sword", notes:'Practice weapon. Confers no benefit.', value:0
      1: text: "Sword", notes:'Common soldier\'s blade. Increases STR by 3.', str: 3, value:20
      2: text: "Axe", notes:'Double-bitted battle-axe. Increases STR by 6.', str: 6, value:30
      3: text: "Morning Star", notes:'Heavy club with brutal spikes. Increases STR by 9.', str: 9, value:45
      4: text: "Sapphire Blade", notes:'Sword whose edge bites like the north wind. Increases STR by 12.', str: 12, value:65
      5: text: "Ruby Sword", notes:'Weapon whose forge-glow never fades. Increases STR by 15.', str: 15, value:90
      6: text: "Golden Sword", notes:'Bane of creatures of darkness. Increases STR by 18.', str: 18, value:120, last: true
    rogue:
      0: text: "Practice Bow", notes:'Training weapon. Confers no benefit.', value:0
      1: text: "Short Bow", notes:'Simple bow best at close ranges. Increases STR by 2.', str: 2, value:20
      2: text: "Long Bow", notes:'Bow with a strong draw for extra distance. Increases STR by 5.', str: 5, value:50
      3: text: "Recurve Bow", notes:'Built with advanced techniques. Increases STR by 8.', str: 8, value:80
      4: text: "Icicle Bow", notes:'Fires arrows of piercing cold. Increases STR by 12.', str: 12, value:120
      5: text: "Meteor Bow", notes:'Rains flame upon your foes. Increases STR by 16.', str: 16, value:160
      6: text: "Golden Bow", notes:'As swift as sunlight and as sharp as lightning. Increases STR by 20.', str: 20, value:200, last: true
    wizard:
      0: twoHanded: true, text: "Apprentice Staff", notes:'Practice staff. Confers no benefit.', value:0
      1: twoHanded: true, text: "Wooden Staff", notes:'Basic implement of carven wood. Increases INT by 3 and PER by 1.', int: 3, per: 1, value:30
      2: twoHanded: true, text: "Jeweled Staff", notes:'Focuses power through a precious stone. Increases INT by 6 and PER by 2.', int: 6, per: 2, value:50
      3: twoHanded: true, text: "Iron Staff", notes:'Plated in metal to channel heat, cold, and lightning. Increases INT by 9 and PER by 3.', int: 9, per: 3, value:80
      4: twoHanded: true, text: "Brass Staff", notes:'As powerful as it is heavy. Increases INT by 12 and PER by 5.', int:12, per: 5, value:120
      5: twoHanded: true, text: "Archmage Staff", notes:'Assists in weaving the most complex of spells. Increases INT by 15 and PER by 7.', int: 15, per: 7, value:160
      6: twoHanded: true, text: "Golden Staff", notes:'Fashioned of orichalcum, the alchemic gold, mighty and rare. Increases INT by 18 and PER by 9.', int: 18, per: 9, value:200, last: true
    healer:
      0: text: "Novice Rod", notes:'For healers in training. Confers no benefit.', value:0
      1: text: "Acolyte Rod", notes:'Crafted during a healer\'s initiation. Increases INT by 2.', int: 2, value:20
      2: text: "Quartz Rod", notes:'Topped with a gem bearing curative properties. Increases INT by 3.', int: 3, value:30
      3: text: "Amethyst Rod", notes:'Purifies poison at a touch. Increases INT by 5.', int: 5, value:45
      4: text: "Priest Rod", notes:'As much a badge of office as a healing tool. Increases INT by 7.', int:7, value:65
      5: text: "Royal Crosier", notes:'Shines with the pure light of blessings. Increases INT by 9.', int: 9, value:90
      6: text: "Golden Crosier", notes:'Soothes the pain of all who look upon it. Increases INT by 11.', int: 11, value:120, last: true
    special:
      0: text: "Dark Souls Blade", notes:'Increases experience gain by 21%.', str: 21, value:150, canOwn: ((u)-> +u.backer?.tier >= 70)
      1: text: "Crystal Blade", notes:'Increases experience gain by 24%.', str: 24, value:170, canOwn: ((u)-> +u.contributor?.level >= 4)
      2: text: "Stephen Weber's Shaft of the Dragon", notes:"Stephen Weber's Shaft of the Dragon", str: 50, per: 50, value:200, canOwn: ((u)-> +u.backer?.tier >= 300)
      3: text: "Mustaine's Milestone Mashing Morning Star", notes:"Mustaine's Milestone Mashing Morning Star", str: 50, int: 50, con: 50, value:200, canOwn: ((u)-> +u.backer?.tier >= 300)

  armor:
    base:
      0: text: "Cloth Armor", notes:'Ordinary clothing. Confers no benefit.', value:0
    warrior:
      #0: text: "Cloth Armor", notes:'Ordinary clothing. Confers no benefit.', value:0
      1: text: "Leather Armor", notes:'Jerkin of sturdy boiled hide. Increases CON by 3.', con: 3, value:30
      2: text: "Chain Mail", notes:'Armor of interlocked metal rings. Increases CON by 5.', con: 5, value:45
      3: text: "Plate Armor", notes:'Suit of all-encasing steel, the pride of knights. Increases CON by 7.', con: 7, value:65
      4: text: "Red Armor", notes:'Heavy plate glowing with defensive enchantments. Increases CON by 9.', con: 9, value:90
      5: text: "Golden Armor", notes:'Looks ceremonial, but no known blade can pierce it. Increases CON by 11.', con: 11, value:120, last: true
    rogue:
      #0: text: "Cloth Armor", notes:'Ordinary clothing. Confers no benefit.', value:0
      1: text: "Oiled Leather", notes:'Leather armor treated to reduce noise. Increases PER by 6.', per: 6, value:30
      2: text: "Black Leather", notes:'Colored with dark dye to blend into shadows. Increases PER by 9', per: 9, value:45
      3: text: "Camouflage Vest", notes:'Equally discreet in dungeon or wilderness. Increases PER by 12.', per: 12, value:65
      4: text: "Penumbral Armor", notes:'Wraps the wearer in a veil of twilight. Increases PER by 15.', per: 15, value:90
      5: text: "Umbral Armor", notes:'Allows stealth in the open in broad daylight. Increases PER by 18.', per: 18, value:120, last: true
    wizard:
      #0: text: "Apprentice Garb", notes:'For students of magic. Confers no benefit.', value:0
      1: text: "Magician Robe", notes:'Hedge-mage\'s outfit. Increases INT by 2.', int: 2, value:30
      2: text: "Wizard Robe", notes:'Clothes for a wandering wonder-worker. Increases INT by 4.', int: 4, value:45
      3: text: "Robe of Mysteries", notes:'Denotes initiation into elite secrets. Increases INT by 6.', int: 6, value:65
      4: text: "Archmage Robe", notes:'Spirits and elementals bow before it. Increases INT by 9.', int: 9, value:90
      5: text: "Royal Magus Robe", notes:'Symbol of the power behind the throne. Increases INT by 12.', int: 12, value:120, last: true
    healer:
      #0: text: "Novice Robe", notes:'For healers in training. Confers no benefit.', value:0
      1: text: "Acolyte Robe", notes:'Garment showing humility and purpose. Increases CON by 6.', con: 6, value:30
      2: text: "Medic Robe", notes:'Worn by those dedicated to tending the wounded in battle. Increases CON by 9.', con: 9, value:45
      3: text: "Defender Vestment", notes:'Turns the healer\'s own magics inward to fend off harm. Increases CON by 12.', con: 12, value:65
      4: text: "Priest Vestment", notes:'Projects authority and dissipates curses. Increases CON by 15.', con: 15, value:90
      5: text: "Royal Vestment", notes:'Attire of those who have saved the lives of kings. Increases CON by 18.', con: 18, value:120, last: true
    special:
      0: text: "Shade Armor",   notes:'Decreases Health loss by 12%.', defense: 12, value:150, canOwn: ((u)-> +u.backer?.tier >= 45)
      1: text: "Crystal Armor", notes:'Decreases Health loss by 14%.', defense: 14, value:170, canOwn: ((u)-> +u.contributor?.level >= 2)
      2: text: "Tarutaru's Noble's Tunic", notes:'Makes you extra fluffy. Adds "Refresh" effect; Cure potency +n%.', int: 50, con: 50, value:200, canOwn: ((u)-> +u.backer?.tier >= 300)

  head:
    base:
      0: text: "No Helm", notes:'No headgear.', value:0
    warrior:
      #0: text: "No Helm", notes:'No headgear.', value:0
      1: text: "Leather Helm", notes:'Cap of sturdy boiled hide. Increases STR by 2.', str: 2, value:15
      2: text: "Chain Coif", notes:'Hood of interlocked metal rings. Increases STR by 4.', str: 4, value:25
      3: text: "Plate Helm", notes:'Thick steel helmet, proof against any blow. Increases STR by 6.', str: 6, value:40
      4: text: "Red Helm", notes:'Set with rubies for power, and glows when the wearer is angered. Increases STR by 9.', str: 9, value:60
      5: text: "Golden Helm", notes:'Regal crown bound to shining armor. Increases STR by 12.', str: 12, value:80, last: true
    rogue:
      #0: text: "No Hood", notes:'No headgear.', value:0
      1: text: "Leather Hood", notes:'Basic protective cowl. Increases PER by 2.', per: 2, value:15
      2: text: "Black Leather Hood", notes:'Useful for both defense and disguise. Increases PER by 4.', per: 4, value:25
      3: text: "Camouflage Hood", notes:'Rugged, but doesn\'t impede hearing. Increases PER by 6.', per: 6, value:40
      4: text: "Penumbral Hood", notes:'Grants perfect vision in darkness. Increases PER by 9.', per: 9, value:60
      5: text: "Umbral Hood", notes:'Conceals even thoughts from those who would probe them. Increases PER by 12.', per: 12, value:80, last: true
    wizard:
      #0: text: "No Hat", notes:'No headgear.', value:0
      1: text: "Magician Hat", notes:'Simple, comfortable, and fashionable. Increases PER by 2.', per: 2, value:15
      2: text: "Cornuthaum", notes:'Traditional headgear of the itinerant wizard. Increases PER by 3.', per: 3, value:25
      3: text: "Astrologer Hat", notes:'Adorned with the rings of Saturn. Increases PER by 5.', per: 5, value:40
      4: text: "Archmage Hat", notes:'Focuses the mind for intensive spellcasting. Increases PER by 7.', per: 7, value:60
      5: text: "Royal Magus Hat", notes:'Shows authority over fortune, weather, and lesser mages. Increases PER by 9.', per: 9, value:80, last: true
    healer:
      #0: text: "No Circlet", notes:'No headgear.', value:0
      1: text: "Quartz Circlet", notes:'Jeweled headpiece, for focus on the task at hand. Increases INT by 2.', int: 2, value:15
      2: text: "Amethyst Circlet", notes:'A taste of luxury for a humble profession. Increases INT by 3.', int: 3, value:25
      3: text: "Sapphire Circlet", notes:'Shines to let sufferers know their salvation is at hand. Increases INT by 5.', int: 5, value:40
      4: text: "Emerald Diadem", notes:'Emits an aura of life and growth. Increases INT by 7.', int: 7, value:60
      5: text: "Royal Diadem", notes:'For king, queen, or miracle-worker. Increases INT by 9.', int: 9, value:80, last: true
    special:
      0: text: "Shade Helm",   notes:'Decreases Health loss by 7%.', defense: 7, value:100, canOwn: ((u)-> +u.backer?.tier >= 45)
      1: text: "Crystal Helm", notes:'Decreases Health loss by 8%.', defense: 8, value:120, canOwn: ((u)-> +u.contributor?.level >= 3)
      2: text: "??? 300-tier Helm", notes:'', value:200, canOwn: ((u)-> +u.backer?.tier >= 300)

  shield:
    base:
      0: text: "No Shield", notes:'No shield.', value:0
    warrior:
      #0: text: "No Shield", notes:'No shield.', value:0
      1: text: "Wooden Shield", notes:'Round shield of thick wood. Increases CON by 2.', con: 2, value:20
      2: text: "Buckler", notes:'Light and sturdy, quick to bring to the defense. Increases CON by 3.', con: 3, value:35
      3: text: "Reinforced Shield", notes:'Made of wood but bolstered with metal bands. Increases CON by 5.', con: 5, value:50
      4: text: "Red Shield", notes:'Rebukes blows with a burst of flame. Increases CON by 7.', con: 7, value:70
      5: text: "Golden Shield", notes:'Shining badge of the vanguard. Increases CON by 9.', con: 9, value:90, last: true
    rogue:
      0: text: "Knife 1", notes:'Knife 1', value:0
      1: text: "Knife 2", notes:'Knife 2', value:1
      2: text: "Knife 3", notes:'Knife 3', value:1
      3: text: "Knife 4", notes:'Knife 4', value:1
      4: text: "Knife 5", notes:'Knife 5', value:1
      5: text: "Knife 6", notes:'Knife 6', value:1
      6: text: "Knife 7", notes:'Knife 7', value:1, last: true
    wizard: {}
      #0: text: "No Shield", notes:'No shield.', def: 0, value:0, last: true
    healer:
      #0: text: "No Shield", notes:'No shield.', def: 0, value:0
      1: text: "Medic Buckler", notes:'Easy to disengage, freeing a hand for bandaging. Increases CON by 2.', con: 2, value:20
      2: text: "Kite Shield", notes:'Tapered shield with the symbol of healing. Increases CON by 4.', con: 4, value:35
      3: text: "Hospitaler Shield", notes:'Traditional shield of defender knights. Increases CON by 6.', con: 6, value:50
      4: text: "Savior Shield", notes:'Turns blows from innocents as well as oneself. Increases CON by 9.', con: 9, value:70
      5: text: "Royal Shield", notes:'Bestowed upon those most dedicated to the kingdom\'s defense. Increases CON by 12.', con: 12, value:90, last: true
    special:
      0: text: "Tormented Skull", notes:'Decreases Health loss by 9%.', defense: 9, value:120, canOwn: ((u)-> +u.backer?.tier >= 45)
      1: text: "Crystal Shield", notes:'Decreases Health loss by 10%.', defense: 10, value:150, canOwn: ((u)-> +u.contributor?.level >= 5)

###
  The gear is exported as a tree (defined above), and a flat list (eg, {weapon_healer_1: .., shield_special_0: ...}) since
  they are needed in different froms at different points in the app
###
api.gear =
  tree: gear
  flat: {}

_.each ['weapon', 'armor', 'head', 'shield'], (type) ->
  _.each ['base', 'warrior', 'rogue', 'healer', 'wizard', 'special'], (klass) ->
    # add "type" to each item, so we can reference that as "weapon" or "armor" in the html
    _.each gear[type][klass], (item, i) ->
      key = "#{type}_#{klass}_#{i}"
      _.defaults item, {type, key, klass, index: i, str:0, int:0, per:0, con:0}
      api.gear.flat[key] = item

###
  ---------------------------------------------------------------
  Potion
  ---------------------------------------------------------------
###

api.potion = type: 'potion', text: "Health Potion", notes: "Recover 15 Health (Instant Use)", value: 25, key: 'potion'

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

api.spells =
  wizard:
    fireball:
      text: 'Burst of Flames'
      mana: 10
      lvl: 6
      target: 'task'
      notes: 'With a crack, flames burst from your staff, scorching a task. You deal much higher damage to the task and gain additional xp.'
      cast: (user, target) ->
        target.value += user.stats.int + crit(user)
    lightning:
      text: 'Lightning Strike'
      mana: 15
      lvl: 7
      target: 'task'
      notes: 'A bolt a lightning pierces through a task. There is a high chance of a critical hit.'
      cast: (user, target) ->
        target.value += user.stats.per*2 + crit(user)
    frost:
      text: 'Chilling Frost'
      mana: 35
      lvl: 8
      target: 'party'
      notes: "Ice forms of the party's tasks, slowing them down and opening them up to more attacks. Your party gains a buff to xp.",
      cast: (user, target) ->
        ## lasts for 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.int = user.stats.int
    darkness:
      text: 'Shroud of Darkness'
      mana: 30
      lvl: 9
      target: 'party'
      notes: "Unearthly shadows form and wisp around your party, concealing their presence. Under the shroud, your party can sneak up on tasks, dealing more critical hits.",
      cast: (user, target) ->
        ## lasts for 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.per = user.stats.per

  warrior:
    smash:
      text: 'Brutal Smash'
      mana: 10
      lvl: 6
      target: 'task'
      notes: "You savagely hit a single task with all of your might, beating it into submission. The task's redness decreases."
      cast: (user, target) ->
        target.value -= user.stat.str
    defensiveStance:
      text: 'Defensive Stance'
      mana: 25
      lvl: 7
      target: 'self'
      notes: "You take a moment to relax your body and enter a defensive stance to ready yourself for the tasks' next onslaught. Reduced damage from dailies at the end of the day."
      cast: (user, target) ->
        ## Only affects health loss at cron from dailies ##
        user.stats.buffs.con = user.stats.con/2
    valorousPresence:
      text: 'Valorous Presence'
      mana: 20
      lvl: 8
      target: 'party'
      notes: "Your presence emboldens the party. Their newfound courage gives them a boost of strength. Party members gain a buff to their STR."
      cast: (user, target) ->
        ## lasts 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.str = user.stats.str/2
    intimidate:
      text: 'Intimidating Gaze'
      mana: 15
      lvl: 9
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
      lvl: 6
      target: 'task'
      notes: "Your nimble fingers run through the task's pockets and 'find' some treasures for yourself. You gain an increased gold bonus on the task and a higher chance of an item drop."
      cast: (user, target) ->
        user.stats.gp += user.stats.per * target.value
    backStab:
      text: 'Backstab'
      mana: 15
      lvl: 7
      target: 'task'
      notes: "Without a sound, you sweep behind a task and stab it in the back. You deal higher damage to the stat, with a higher chance of a critical hit."
      cast: (user, target) ->
        _crit = crit(user)
        target.value -= user.stats.str
        user.stats.exp += _crit
        user.stats.gp += _crit
    stealth:
      text: 'Tools of the Trade'
      mana: 20
      lvl: 8
      target: 'party'
      notes: "You share your thievery tools with the party to aid them in 'acquiring' more gold. The party's gold bonus for tasks is buffed for a day."
      cast: (user, target) ->
        ## lasts 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.per = user.stats.per/2
    speedburst:
      text: 'Burst of Speed'
      mana: 25
      lvl: 9
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
      lvl: 6
      target: 'self'
      notes: 'Light covers your body, healing your wounds. You gain a boost to your health.'
      cast: (user, target) ->
        user.stats.hp += user.stats.con + user.stats.int
    brightness:
      text: 'Searing Brightness'
      mana: 15
      lvl: 7
      target: 'self'
      notes: "You cast a burst of light that blinds all of your tasks. The redness of your tasks is reduced"
      cast: (user, target) ->
        _.each user.tasks, (target) ->
          target.value -= user.stats.int
    protectAura:
      text: 'Protective Aura'
      mana: 30
      lvl: 8
      target: 'party'
      notes: "A magical aura surrounds your party members, protecting them from damage. Your party members gain a buff to their defense."
      cast: (user, target) ->
        ## lasts 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.con = user.stats.con/2
    heallAll:
      text: 'Blessing'
      mana: 25
      lvl: 9
      target: 'party'
      notes: "Soothing light envelops your party and heals them of their injuries. Your party members gain a boost to their health."
      cast: (user, target) ->
        _.each target, (member) ->
          member.stats.hp += user.con/2

crit = (user) -> (Math.random() * user.stats.per + 1)

# Intercept all spells to reduce user.stats.mp after casting the spell
_.each api.spells, (spellClass) ->
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

api.eggs =
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
_.each api.eggs, (egg,k) ->
  _.defaults egg,
    value: 3
    name: k
    notes: "Find a hatching potion to pour on this egg, and it will hatch into a #{egg.adjective} #{egg.text}."
    mountText: egg.text

api.specialPets =
  'Wolf-Veteran':   true
  'Wolf-Cerberus':  true
  'Dragon-Hydra':   true
  'Turkey-Base':    true

api.hatchingPotions =
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
_.each api.hatchingPotions, (pot,k) ->
  _.defaults pot, {name: k, value: 2, notes: "Pour this on an egg, and it will hatch as a #{pot.text} pet."}

api.food =
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
_.each api.food, (food,k) ->
  _.defaults food, {value: 1, name: k, notes: "Feed this to a pet and it may grow into a sturdy steed."}

repeat = {m:true,t:true,w:true,th:true,f:true,s:true,su:true}
api.userDefaults =
  habits: [
    {type: 'habit', text: '1h Productive Work', notes: 'When you create a new Habit, you can click the Edit icon and choose for it to represent a positive habit, a negative habit, or both. For some Habits, like this one, it only makes sense to gain points.', value: 0, up: true, down: false }
    {type: 'habit', text: 'Eat Junk Food', notes: 'For others, it only makes sense to *lose* points.', value: 0, up: false, down: true}
    {type: 'habit', text: 'Take The Stairs', notes: 'For the rest, both + and - make sense (stairs = gain, elevator = lose).', value: 0, up: true, down: true}
  ]

  dailys: [
    {type: 'daily', text: '1h Personal Project', notes: 'All tasks default to yellow when they are created. This means you will take only moderate damage when they are missed and will gain only a moderate reward when they are completed.', value: 0, completed: false, repeat: repeat }
    {type: 'daily', text: 'Exercise', notes: 'Dailies you complete consistently will turn from yellow to green to blue, helping you track your progress. The higher you move up the ladder, the less damage you take for missing and less reward you receive for completing the goal.', value: 3, completed: false, repeat: repeat }
    {type: 'daily', text: '45m Reading', notes: 'If you miss a daily frequently, it will turn darker shades of orange and red. The redder the task is, the more experience and gold it grants for success and the more damage you take for failure. This encourages you to focus on your shortcomings, the reds.', value: -10, completed: false, repeat: repeat }
  ]

  todos: [
    {type: 'todo', text: 'Call Mom', notes: 'While not completing a to-do in a set period of time will not hurt you, they will gradually change from yellow to red, thus becoming more valuable. This will encourage you to wrap up stale To-Dos.', value: -3, completed: false }
  ]

  rewards: [
    {type: 'reward', text: '1 Episode of Game of Thrones', notes: 'Custom rewards can come in many forms. Some people will hold off watching their favorite show unless they have the gold to pay for it.', value: 20 }
    {type: 'reward', text: 'Cake', notes: 'Other people just want to enjoy a nice piece of cake. Try to create rewards that will motivate you best.', value: 10 }
  ]

  tags: [
    {name: 'morning'}
    {name: 'afternoon'}
    {name: 'evening'}
  ]
