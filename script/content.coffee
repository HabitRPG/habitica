_ = require 'lodash'
api = module.exports
moment = require 'moment'

###
  ---------------------------------------------------------------
  Gear (Weapons, Armor, Head, Shield)
  Item definitions: {index, text, notes, value, str, def, int, per, classes, type}
  ---------------------------------------------------------------
###

classes = ['warrior', 'rogue', 'healer', 'wizard']
gearTypes = ['armor', 'weapon', 'shield', 'head', 'back', 'headAccessory']

events =
  winter: {start:'2013-12-31',end:'2014-02-01'}
  birthday: {start:'2013-01-30',end:'2014-02-01'}
  spring: {start:'2014-03-21',end:'2014-05-01'}

mystery =
  201402: {start:'2014-02-22',end:'2014-02-28'}

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
      #Not using bows at the moment, but they would be easy to add back in to an advanced Armory feature, as Quest drops, etc.
      #0: twoHanded: true, text: "Practice Bow", notes:'Training weapon. Confers no benefit.', value:0
      #1: twoHanded: true, text: "Short Bow", notes:'Simple bow best at close ranges. Increases STR by 2.', str: 2, value:20
      #2: twoHanded: true, text: "Long Bow", notes:'Bow with a strong draw for extra distance. Increases STR by 5.', str: 5, value:50
      #3: twoHanded: true, text: "Recurve Bow", notes:'Built with advanced techniques. Increases STR by 8.', str: 8, value:80
      #4: twoHanded: true, text: "Icicle Bow", notes:'Fires arrows of piercing cold. Increases STR by 12.', str: 12, value:120
      #5: twoHanded: true, text: "Meteor Bow", notes:'Rains flame upon your foes. Increases STR by 16.', str: 16, value:160
      #6: twoHanded: true, text: "Golden Bow", notes:'As swift as sunlight and as sharp as lightning. Increases STR by 20.', str: 20, value:200, last: true
      0: text: "Dagger", notes: 'A rogue\'s most basic weapon. Confers no benefit.', str: 0, value: 0
      1: text: "Short Sword", notes: 'Light, concealable blade. Increases STR by 2.', str: 2, value: 20
      2: text: "Scimitar", notes: 'Slashing sword, swift to deliver a killing blow. Increases STR by 3.', str: 3, value: 35
      3: text: "Kukri", notes: 'Distinctive bush knife, both survival tool and weapon. Increases STR by 4.', str: 4, value: 50
      4: text: "Nunchaku", notes: 'Heavy batons whirled about on a length of chain. Increases STR by 6.', str: 6, value: 70
      5: text: "Ninja-to", notes: 'Sleek and deadly as the ninja themselves. Increases STR by 8.', str: 8, value: 90
      6: text: "Hook Sword", notes: 'Complex weapon adept at ensnaring and disarming opponents. Increases STR by 10.', str: 10, value: 120, last: true
    wizard:
      0: twoHanded: true, text: "Apprentice Staff", notes:'Practice staff. Confers no benefit.', value:0
      1: twoHanded: true, text: "Wooden Staff", notes:'Basic implement of carven wood. Increases INT by 3 and PER by 1.', int: 3, per: 1, value:30
      2: twoHanded: true, text: "Jeweled Staff", notes:'Focuses power through a precious stone. Increases INT by 6 and PER by 2.', int: 6, per: 2, value:50
      3: twoHanded: true, text: "Iron Staff", notes:'Plated in metal to channel heat, cold, and lightning. Increases INT by 9 and PER by 3.', int: 9, per: 3, value:80
      4: twoHanded: true, text: "Brass Staff", notes:'As powerful as it is heavy. Increases INT by 12 and PER by 5.', int:12, per: 5, value:120
      5: twoHanded: true, text: "Archmage Staff", notes:'Assists in weaving the most complex of spells. Increases INT by 15 and PER by 7.', int: 15, per: 7, value:160
      6: twoHanded: true, text: "Golden Staff", notes:'Fashioned of orichalcum, the alchemic gold, mighty and rare. Increases INT by 18 and PER by 10.', int: 18, per: 10, value:200, last: true
    healer:
      0: text: "Novice Rod", notes:'For healers in training. Confers no benefit.', value:0
      1: text: "Acolyte Rod", notes:'Crafted during a healer\'s initiation. Increases INT by 2.', int: 2, value:20
      2: text: "Quartz Rod", notes:'Topped with a gem bearing curative properties. Increases INT by 3.', int: 3, value:30
      3: text: "Amethyst Rod", notes:'Purifies poison at a touch. Increases INT by 5.', int: 5, value:45
      4: text: "Physician Rod", notes:'As much a badge of office as a healing tool. Increases INT by 7.', int:7, value:65
      5: text: "Royal Scepter", notes:'Fit to grace the hand of a monarch, or of one who stands at a monarch\'s right hand. Increases INT by 9.', int: 9, value:90
      6: text: "Golden Scepter", notes:'Soothes the pain of all who look upon it. Increases INT by 11.', int: 11, value:120, last: true
    special:
      0: text: "Dark Souls Blade", notes:'Feasts upon foes\' life essence to power its wicked strokes. Increases STR by 20.', str: 20, value:150, canOwn: ((u)-> +u.backer?.tier >= 70)
      1: text: "Crystal Blade", notes:'Its glittering facets tell the tale of a hero. Increases all attributes by 6.', str: 6, per: 6, con: 6, int: 6, value:170, canOwn: ((u)-> +u.contributor?.level >= 4)
      2: text: "Stephen Weber's Shaft of the Dragon", notes:'Feel the potency of the dragon surge from within! Increases STR and PER by 25 each.', str: 25, per: 25, value:200, canOwn: ((u)-> +u.backer?.tier >= 300)
      3: text: "Mustaine's Milestone Mashing Morning Star", notes:"Meetings, monsters, malaise: managed! Mash! Increases STR, INT, and CON by 17 each.", str: 17, int: 17, con: 17, value:200, canOwn: ((u)-> +u.backer?.tier >= 300)
      critical: text: "Critical Hammer of Bug-Crushing", notes:"This champion slew a critical Github foe where many warriors fell. Fashioned from the bones of Bug, this hammer deals a mighty critical hit. Increases STR and PER by 40 each.", str: 40, per: 40, value:200, canOwn: ((u)-> !!u.contributor?.critical)

      # Winter event gear
      yeti:       event: events.winter, canOwn: ((u)->u.stats.class is 'warrior' ), text: "Yeti-Tamer Spear", notes:'Limited Edition 2013 Winter Gear! This spear allows its user to command any yeti. Increases STR by 15.', str: 15, value:90
      ski:        event: events.winter, canOwn: ((u)->u.stats.class is 'rogue'   ), text: "Ski-sassin Pole", notes: 'Limited Edition 2013 Winter Gear! A weapon capable of destroying hordes of enemies! It also helps the user make very nice parallel turns. Increases STR by 8.', str: 8, value: 90
      candycane:  event: events.winter, canOwn: ((u)->u.stats.class is 'wizard'  ), twoHanded: true, text: "Candy Cane Staff", notes:"Limited Edition 2013 Winter Gear! A powerful mage's staff. Powerfully DELICIOUS, we mean! Two-handed weapon. Increases INT by 15 and PER by 7.", int: 15, per: 7, value:160
      snowflake:  event: events.winter, canOwn: ((u)->u.stats.class is 'healer'  ), text: "Snowflake Wand", notes:'Limited Edition 2013 Winter Gear! This wand sparkles with unlimited healing power. Increases INT by 9.', int: 9, value:90

  armor:
    base:
      0: text: "Plain Clothing", notes:'Ordinary clothing. Confers no benefit.', value:0
    warrior:
      #0: text: "Plain Clothing", notes:'Ordinary clothing. Confers no benefit.', value:0
      1: text: "Leather Armor", notes:'Jerkin of sturdy boiled hide. Increases CON by 3.', con: 3, value:30
      2: text: "Chain Mail", notes:'Armor of interlocked metal rings. Increases CON by 5.', con: 5, value:45
      3: text: "Plate Armor", notes:'Suit of all-encasing steel, the pride of knights. Increases CON by 7.', con: 7, value:65
      4: text: "Red Armor", notes:'Heavy plate glowing with defensive enchantments. Increases CON by 9.', con: 9, value:90
      5: text: "Golden Armor", notes:'Looks ceremonial, but no known blade can pierce it. Increases CON by 11.', con: 11, value:120, last: true
    rogue:
      #0: text: "Plain Clothing", notes:'Ordinary clothing. Confers no benefit.', value:0
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
      3: text: "Defender Mantle", notes:'Turns the healer\'s own magics inward to fend off harm. Increases CON by 12.', con: 12, value:65
      4: text: "Physician Mantle", notes:'Projects authority and dissipates curses. Increases CON by 15.', con: 15, value:90
      5: text: "Royal Mantle", notes:'Attire of those who have saved the lives of kings. Increases CON by 18.', con: 18, value:120, last: true
    special:
      0: text: "Shade Armor",   notes:'Screams when struck, for it feels pain in its wearer\'s place. Increases CON by 20.', con: 20, value:150, canOwn: ((u)-> +u.backer?.tier >= 45)
      1: text: "Crystal Armor", notes:'Its tireless power inures the wearer to mundane discomfort. Increases all attributes by 6.', con: 6, str: 6, per: 6, int: 6, value:170, canOwn: ((u)-> +u.contributor?.level >= 2)
      2: text: "Jean Chalard's Noble Tunic", notes:'Makes you extra fluffy! Increases CON and INT by 25 each.', int: 25, con: 25, value:200, canOwn: ((u)-> +u.backer?.tier >= 300)
      # Winter event
      yeti:       event: events.winter, canOwn: ((u)->u.stats.class is 'warrior' ), text: "Yeti-Tamer Robe", notes:'Limited Edition 2013 Winter Gear! Fuzzy and fierce. Increases CON by 9.', con: 9, value:90
      ski:        event: events.winter, canOwn: ((u)->u.stats.class is 'rogue'   ), text: "Ski-sassin Parka", notes:'Limited Edition 2013 Winter Gear! Full of secret daggers and ski trail maps. Increases PER by 15.', per: 15, value:90
      candycane:  event: events.winter, canOwn: ((u)->u.stats.class is 'wizard'  ), text: "Candy Cane Robe", notes:'Limited Edition 2013 Winter Gear! Spun from sugar and silk. Increases INT by 9.', int: 9, value:90
      snowflake:  event: events.winter, canOwn: ((u)->u.stats.class is 'healer'  ), text: "Snowflake Robe", notes:'Limited Edition 2013 Winter Gear! A robe to keep you warm, even in a blizzard. Increases CON by 15.', con: 15, value:90
      birthday:   event: events.birthday, text: "Absurd Party Robes", notes:"As part of the festivities, Absurd Party Robes are available free of charge in the Item Store! Swath yourself in those silly garbs and don your matching hats to celebrate this momentous day.", value: 0
    mystery:
      201402: text: 'Messenger Robes', notes: "Shimmering and strong, these robes have many pockets to carry letters.", mystery:mystery['201402'], value: 10

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
      5: text: "Royal Magus Hat", notes:'Shows authority over fortune, weather, and lesser mages. Increases PER by 10.', per: 10, value:80, last: true
    healer:
      #0: text: "No Circlet", notes:'No headgear.', value:0
      1: text: "Quartz Circlet", notes:'Jeweled headpiece, for focus on the task at hand. Increases INT by 2.', int: 2, value:15
      2: text: "Amethyst Circlet", notes:'A taste of luxury for a humble profession. Increases INT by 3.', int: 3, value:25
      3: text: "Sapphire Circlet", notes:'Shines to let sufferers know their salvation is at hand. Increases INT by 5.', int: 5, value:40
      4: text: "Emerald Diadem", notes:'Emits an aura of life and growth. Increases INT by 7.', int: 7, value:60
      5: text: "Royal Diadem", notes:'For king, queen, or miracle-worker. Increases INT by 9.', int: 9, value:80, last: true
    special:
      0: text: "Shade Helm",   notes:'Blood and ash, lava and obsidian give this helm its imagery and power. Increases INT by 20.', int: 20, value:150, canOwn: ((u)-> +u.backer?.tier >= 45)
      1: text: "Crystal Helm", notes:'The favored crown of those who lead by example. Increases all attributes by 6.', con: 6, str: 6, per: 6, int: 6, value:170, canOwn: ((u)-> +u.contributor?.level >= 3)
      2: text: "Nameless Helm", notes:'A testament to those who gave of themselves while asking nothing in return. Increases INT and STR by 25 each.', int: 25, str: 25, value:200, canOwn: ((u)-> +u.backer?.tier >= 300)

      #Winter event
      nye:        event: events.winter, text: "Absurd Party Hat", notes:"You've received an Absurd Party Hat! Wear it with pride while ringing in the New Year!", value: 0
      yeti:       event: events.winter, canOwn: ((u)->u.stats.class is 'warrior' ), text: "Yeti-Tamer Helm", notes:'Limited Edition 2013 Winter Gear! An adorably fearsome hat. Increases STR by 9.', str: 9, value:60
      ski:        event: events.winter, canOwn: ((u)->u.stats.class is 'rogue'   ), text: "Ski-sassin Helm", notes:"Limited Edition 2013 Winter Gear! Keeps the wearer's identity secret... and their face toasty. Increases PER by 9.", per: 9, value:60
      candycane:  event: events.winter, canOwn: ((u)->u.stats.class is 'wizard'  ), text: "Candy Cane Hat", notes:"Limited Edition 2013 Winter Gear! This is the most delicious hat in the world. It's also known to appear and disappear mysteriously. Increases PER by 7.", per: 7, value:60
      snowflake:  event: events.winter, canOwn: ((u)->u.stats.class is 'healer'  ), text: "Snowflake Crown", notes:'Limited Edition 2013 Winter Gear! The wearer of this crown is never cold. Increases INT by 7.', int: 7, value:60

    mystery:
      201402: text: 'Winged Helm', notes: "This winged circlet imbues the wearer with the speed of the wind!", mystery:mystery['201402'], value: 10

  shield:
    base:
      0: text: "No Off-Hand Equipment", notes:'No shield or second weapon.', value:0
      #changed because this is what shows up for all classes, including those without shields
    warrior:
      #0: text: "No Shield", notes:'No shield.', value:0
      1: text: "Wooden Shield", notes:'Round shield of thick wood. Increases CON by 2.', con: 2, value:20
      2: text: "Buckler", notes:'Light and sturdy, quick to bring to the defense. Increases CON by 3.', con: 3, value:35
      3: text: "Reinforced Shield", notes:'Made of wood but bolstered with metal bands. Increases CON by 5.', con: 5, value:50
      4: text: "Red Shield", notes:'Rebukes blows with a burst of flame. Increases CON by 7.', con: 7, value:70
      5: text: "Golden Shield", notes:'Shining badge of the vanguard. Increases CON by 9.', con: 9, value:90, last: true
    rogue:
      0: text: "Dagger", notes: 'A rogue\'s most basic weapon. Confers no benefit.', str: 0, value: 0
      1: text: "Short Sword", notes: 'Light, concealable blade. Increases STR by 2.', str: 2, value: 20
      2: text: "Scimitar", notes: 'Slashing sword, swift to deliver a killing blow. Increases STR by 3.', str: 3, value: 35
      3: text: "Kukri", notes: 'Distinctive bush knife, both survival tool and weapon. Increases STR by 4.', str: 4, value: 50
      4: text: "Nunchaku", notes: 'Heavy batons whirled about on a length of chain. Increases STR by 6.', str: 6, value: 70
      5: text: "Ninja-to", notes: 'Sleek and deadly as the ninja themselves. Increases STR by 8.', str: 8, value: 90
      6: text: "Hook Sword", notes: 'Complex weapon adept at ensnaring and disarming opponents. Increases STR by 10.', str: 10, value: 120, last: true
    wizard: {}
      #0: text: "No Shield", notes:'No shield.', def: 0, value:0, last: true
    healer:
      #0: text: "No Shield", notes:'No shield.', def: 0, value:0
      1: text: "Medic Buckler", notes:'Easy to disengage, freeing a hand for bandaging. Increases CON by 2.', con: 2, value:20
      2: text: "Kite Shield", notes:'Tapered shield with the symbol of healing. Increases CON by 4.', con: 4, value:35
      3: text: "Protector Shield", notes:'Traditional shield of defender knights. Increases CON by 6.', con: 6, value:50
      4: text: "Savior Shield", notes:'Stops blows aimed at nearby innocents as well as those aimed at you. Increases CON by 9.', con: 9, value:70
      5: text: "Royal Shield", notes:'Bestowed upon those most dedicated to the kingdom\'s defense. Increases CON by 12.', con: 12, value:90, last: true
    special:
      0: text: "Tormented Skull", notes:'Sees beyond the veil of death, and displays what it finds there for enemies to fear. Increases PER by 20.', per: 20, value:150, canOwn: ((u)-> +u.backer?.tier >= 45)
      1: text: "Crystal Shield", notes:'Shatters arrows and deflects the words of naysayers. Increases all attributes by 6.', con: 6, str: 6, per: 6, int:6, value:170, canOwn: ((u)-> +u.contributor?.level >= 5)

      #Winter event
      yeti:       event: events.winter, canOwn: ((u)->u.stats.class is 'warrior' ), text: "Yeti-Tamer Shield", notes:'Limited Edition 2013 Winter Gear! This shield reflects light from the snow. Increases CON by 7.', con: 7, value:70
      ski:        event: events.winter, canOwn: ((u)->u.stats.class is 'rogue'   ), text: "Ski-sassin Pole", notes:'Limited Edition 2013 Winter Gear! A weapon capable of destroying hordes of enemies! It also helps the user make very nice parallel turns. Increases STR by 8.', str: 8, value: 90
      snowflake:  event: events.winter, canOwn: ((u)->u.stats.class is 'healer'   ), text: "Snowflake Shield", notes:'Limited Edition 2013 Winter Gear! Every shield is unique. Increases CON by 9.', con: 9, value:70

  back:
    base:
      0: text: "No Back Accessory", notes:'No Back Accessory.', value:0, last:true
    mystery:
      201402: text: 'Golden Wings', notes: "These shining wings have feathers that glitter in the sun!", mystery:mystery['201402'], value: 10

###
  The gear is exported as a tree (defined above), and a flat list (eg, {weapon_healer_1: .., shield_special_0: ...}) since
  they are needed in different froms at different points in the app
###
api.gear =
  tree: gear
  flat: {}

_.each gearTypes, (type) ->
  _.each classes.concat(['base', 'special', 'mystery']), (klass) ->
    # add "type" to each item, so we can reference that as "weapon" or "armor" in the html
    _.each gear[type][klass], (item, i) ->
      key = "#{type}_#{klass}_#{i}"
      _.defaults item, {type, key, klass, index: i, str:0, int:0, per:0, con:0}

      if item.event
        #? indicates null/undefined. true means they own currently, false means they once owned - and false is what we're
        # after (they can buy back if they bought it during the event's timeframe)
        _canOwn = item.canOwn or (->true)
        item.canOwn = (u)->
          _canOwn(u) and (u.items.gear.owned[key]? or (moment().isAfter(item.event.start) and moment().isBefore(item.event.end)))

      if item.mystery
        item.canOwn = (u)-> u.items.gear.owned[key]?

      api.gear.flat[key] = item

###
  ---------------------------------------------------------------
  Potion
  ---------------------------------------------------------------
###

api.potion = type: 'potion', text: "Health Potion", notes: "Recover 15 Health (Instant Use)", value: 25, key: 'potion'

###
   ---------------------------------------------------------------
   Classes
   ---------------------------------------------------------------
###

api.classes = classes

###
   ---------------------------------------------------------------
   Gear Types
   ---------------------------------------------------------------
###

api.gearTypes = gearTypes

###
  ---------------------------------------------------------------
  Spells
  ---------------------------------------------------------------
  Text, notes, and mana are obvious. The rest:

  * {target}: one of [task, self, party, user]. This is very important, because if the cast() function is expecting one
    thing and receives another, it will cause errors. `self` is used for self buffs, multi-task debuffs, AOEs (eg, meteor-shower),
    etc. Basically, use self for anything that's not [task, party, user] and is an instant-cast

  * {cast}: the function that's run to perform the ability's action. This is pretty slick - because this is exported to the
    web, this function can be performed on the client and on the server. `user` param is self (needed for determining your
    own stats for effectiveness of cast), and `target` param is one of [task, party, user]. In the case of `self` spells,
    you act on `user` instead of `target`. You can trust these are the correct objects, as long as the `target` attr of the
    spell is correct. Take a look at habitrpg/src/models/user.js and habitrpg/src/models/task.js for what attributes are
    available on each model. Note `task.value` is its "redness". If party is passed in, it's an array of users,
    so you'll want to iterate over them like: `_.each(target,function(member){...})`

  Note, user.stats.mp is docked after automatically (it's appended to functions automatically down below in an _.each)
###

#
diminishingReturns = (bonus, max, halfway=max/2) -> max*(bonus/(bonus+halfway))

api.spells =

  wizard:
    fireball:
      text: 'Burst of Flames'
      mana: 10
      lvl: 11
      target: 'task'
      notes: 'With a crack, flames burst from your staff, scorching a task. You deal high damage to the task, and gain additional experience (more experience for greens).'
      cast: (user, target) ->
        # I seriously have no idea what I'm doing here. I'm just mashing buttons until numbers seem right-ish. Anyone know math?
        bonus = user._statsComputed.int * user.fns.crit('per')
        target.value += diminishingReturns(bonus*.02, 4)
        bonus *= Math.ceil ((if target.value < 0 then 1 else target.value+1) *.075)
        #console.log {bonus, expBonus:bonus,upBonus:bonus*.1}
        user.stats.exp += diminishingReturns(bonus,75)
        user.party.quest.progress.up += diminishingReturns(bonus*.1,50,30) if user.party.quest.key

    mpheal:
      text: 'Ethereal Surge'
      mana: 30
      lvl: 12
      target: 'party'
      notes: "A flow of magical energy rushes from your hands and recharges your party. Your party recovers MP.",
      cast: (user, target)->
        _.each target, (member) ->
          bonus = Math.ceil(user._statsComputed.int * .1)
          bonus = 25 if bonus > 25 #prevent ability to replenish own mp infinitely
          member.stats.mp += bonus

    earth:
      text: 'Earthquake'
      mana: 35
      lvl: 13
      target: 'party'
      notes: "The ground below your party's tasks cracks and shakes with extreme intensity, slowing them down and opening them up to more attacks. Your party gains a buff to experience.",
      cast: (user, target) ->
        _.each target, (member) ->
          member.stats.buffs.int ?= 0
          member.stats.buffs.int += Math.ceil(user._statsComputed.int * .05)

    frost:
      text: 'Chilling Frost'
      mana: 40
      lvl: 14
      target: 'self'
      notes: "Ice erupts from every surface, swallowing your tasks and freezing them in place. Your dailies' streaks won't reset at the end of the day."
      cast: (user, target) ->
        user.stats.buffs.streaks = true

  warrior:
    smash:
      text: 'Brutal Smash'
      mana: 10
      lvl: 11
      target: 'task'
      notes: "You savagely hit a single task with all of your might, beating it into submission. The task's redness decreases."
      cast: (user, target) ->
        target.value += 2.5 * (user._statsComputed.str / (user._statsComputed.str + 50)) * user.fns.crit('per')
        user.party.quest.progress.up += Math.ceil(user._statsComputed.str * .2) if user.party.quest.key
    defensiveStance:
      text: 'Defensive Stance'
      mana: 25
      lvl: 12
      target: 'self'
      notes: "You take a moment to relax your body and enter a defensive stance to ready yourself for the tasks' next onslaught. Reduces damage from dailies at the end of the day."
      cast: (user, target) ->
        user.stats.buffs.con ?= 0
        user.stats.buffs.con += Math.ceil(user._statsComputed.con * .05)
    valorousPresence:
      text: 'Valorous Presence'
      mana: 20
      lvl: 13
      target: 'party'
      notes: "Your presence emboldens the party. Their newfound courage gives them a boost of strength. Party members gain a buff to their STR."
      cast: (user, target) ->
        _.each target, (member) ->
          member.stats.buffs.str ?= 0
          member.stats.buffs.str += Math.ceil(user._statsComputed.str * .05)
    intimidate:
      text: 'Intimidating Gaze'
      mana: 15
      lvl: 14
      target: 'party'
      notes: "Your gaze strikes fear into the hearts of your party's enemies. The party gains a moderate boost to defense."
      cast: (user, target) ->
        _.each target, (member) ->
          member.stats.buffs.con ?= 0
          member.stats.buffs.con += Math.ceil(user._statsComputed.con *  .03)

  rogue:
    pickPocket:
      text: 'Pickpocket'
      mana: 10
      lvl: 11
      target: 'task'
      notes: "Your nimble fingers run through the task's pockets and find some treasures for yourself. You gain an increased gold bonus on the task, higher yet the 'fatter' (bluer) your task."
      cast: (user, target) ->
        bonus = (if target.value < 0 then 1 else target.value+2) + (user._statsComputed.per * 0.5)
        user.stats.gp += 25 * (bonus / (bonus + 75))
    backStab:
      text: 'Backstab'
      mana: 15
      lvl: 12
      target: 'task'
      notes: "Without a sound, you sweep behind a task and stab it in the back. You deal higher damage to the task, with a higher chance of a critical hit."
      cast: (user, target) ->
        _crit = user.fns.crit('per', .3)
        target.value += _crit * .03
        bonus =  (if target.value < 0 then 1 else target.value+1) * _crit
        user.stats.exp += bonus
        user.stats.gp += bonus
        # user.party.quest.progress.up += bonus if user.party.quest.key # remove hurting bosses for rogues, seems OP for now
    toolsOfTrade:
      text: 'Tools of the Trade'
      mana: 25
      lvl: 13
      target: 'party'
      notes: "You share your thievery tools with the party to aid them in 'acquiring' more gold. The party's gold bonus for tasks and chance of drops is buffed for a day."
      cast: (user, target) ->
        ## lasts 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.per ?= 0
          member.stats.buffs.per += Math.ceil(user._statsComputed.per * .03)
    stealth:
      text: 'Stealth'
      mana: 45
      lvl: 14
      target: 'self'
      notes: "You duck into the shadows, pulling up your hood. Many dailies won't find you this night; fewer yet the higher your Perception."
      cast: (user, target) ->
        user.stats.buffs.stealth ?= 0
        ## scales to user's # of dailies; maxes out at 100% at 100 per ##
        user.stats.buffs.stealth += Math.ceil(user.dailys.length * user._statsComputed.per / 100)

  healer:
    heal:
      text: 'Healing Light'
      mana: 15
      lvl: 11
      target: 'self'
      notes: 'Light covers your body, healing your wounds. You gain a boost to your health.'
      cast: (user, target) ->
        user.stats.hp += (user._statsComputed.con + user._statsComputed.int + 5) * .075
        user.stats.hp = 50 if user.stats.hp > 50
    brightness:
      text: 'Searing Brightness'
      mana: 15
      lvl: 12
      target: 'self'
      notes: "You cast a burst of light that blinds all of your tasks. The redness of your tasks is reduced."
      cast: (user, target) ->
        _.each user.tasks, (target) ->
          return if target.type is 'reward'
          target.value += 1.5 * (user._statsComputed.int / (user._statsComputed.int + 40))
    protectAura:
      text: 'Protective Aura'
      mana: 30
      lvl: 13
      target: 'party'
      notes: "A magical aura surrounds your party members, protecting them from damage. Your party members gain a buff to their defense."
      cast: (user, target) ->
        ## lasts 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.con ?= 0
          member.stats.buffs.con += Math.ceil(user._statsComputed.con * .15)
    heallAll:
      text: 'Blessing'
      mana: 25
      lvl: 14
      target: 'party'
      notes: "Soothing light envelops your party and heals them of their injuries. Your party members gain a boost to their health."
      cast: (user, target) ->
        _.each target, (member) ->
          member.stats.hp += (user._statsComputed.con + user._statsComputed.int + 5) * .04
          member.stats.hp = 50 if member.stats.hp > 50

  special:
    snowball:
      text: 'Snowball'
      mana: 0
      value: 1
      target: 'user'
      notes: "Throw a snowball at a party member, what could possibly go wrong? Lasts until member's new day."
      cast: (user, target) ->
        target.stats.buffs.snowball = true
        target.achievements.snowball ?= 0
        target.achievements.snowball++
        user.items.special.snowball--

    salt:
      text: 'Salt'
      mana: 0
      value: 5
      target: 'self'
      notes: 'Someone has snowballed you. Ha ha, very funny. Now get this snow off me!'
      cast: (user, target) ->
        user.stats.buffs.snowball = false
        user.stats.gp -= 5

# Intercept all spells to reduce user.stats.mp after casting the spell
_.each api.spells, (spellClass) ->
  _.each spellClass, (spell, key) ->
    spell.key = key
    _cast = spell.cast
    spell.cast = (user, target) ->
      #return if spell.target and spell.target != (if target.type then 'task' else 'user')
      _cast(user,target)
      user.stats.mp -= spell.mana

api.special = api.spells.special

###
  ---------------------------------------------------------------
  Drops
  ---------------------------------------------------------------
###

api.dropEggs =
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
_.each api.dropEggs, (egg,key) ->
  _.defaults egg,
    canBuy:true
    value: 3
    key: key
    notes: "Find a hatching potion to pour on this egg, and it will hatch into a #{egg.adjective} #{egg.text}."
    mountText: egg.text

api.questEggs =
  # value & other defaults set below
  Gryphon:          text: 'Gryphon',  adjective: 'proud', canBuy: false
  Hedgehog:         text: 'Hedgehog', adjective: 'spiky', canBuy: false
_.each api.questEggs, (egg,key) ->
  _.defaults egg,
    canBuy:false
    value: 3
    key: key
    notes: "Find a hatching potion to pour on this egg, and it will hatch into a #{egg.adjective} #{egg.text}."
    mountText: egg.text

api.eggs = _.assign(_.cloneDeep(api.dropEggs), api.questEggs)

api.specialPets =
  'Wolf-Veteran':   true
  'Wolf-Cerberus':  true
  'Dragon-Hydra':   true
  'Turkey-Base':    true
  'BearCub-Polar':  true

api.specialMounts =
  'BearCub-Polar':	true
  'LionCub-Ethereal':	true

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
_.each api.hatchingPotions, (pot,key) ->
  _.defaults pot, {key, value: 2, notes: "Pour this on an egg, and it will hatch as a #{pot.text} pet."}

api.pets = _.transform api.dropEggs, (m, egg) ->
  _.defaults m, _.transform api.hatchingPotions, (m2, pot) ->
    m2[egg.key + "-" + pot.key] = true

api.questPets = _.transform api.questEggs, (m, egg) ->
  _.defaults m, _.transform api.hatchingPotions, (m2, pot) ->
    m2[egg.key + "-" + pot.key] = true

api.food =
  Meat:             text: 'Meat', target: 'Base', article: ''
  Milk:             text: 'Milk', target: 'White', article: ''
  Potatoe:          text: 'Potato', target: 'Desert', article: 'a '
  Strawberry:       text: 'Strawberry', target: 'Red', article: 'a '
  Chocolate:        text: 'Chocolate', target: 'Shade', article: ''
  Fish:             text: 'Fish', target: 'Skeleton', article: 'a '
  RottenMeat:       text: 'Rotten Meat', target: 'Zombie', article: ''
  CottonCandyPink:  text: 'Pink Cotton Candy', target: 'CottonCandyPink', article: ''
  CottonCandyBlue:  text: 'Blue Cotton Candy', target: 'CottonCandyBlue', article: ''
  # FIXME what to do with these extra items? Should we add "targets" (plural) for food instead of singular, so we don't have awkward extras?
  #Cheese:           text: 'Cheese', target: 'Golden'
  #Watermelon:       text: 'Watermelon', target: 'Golden'
  #SeaWeed:          text: 'SeaWeed', target: 'Golden'

  Cake_Skeleton:        canBuy: false, text: 'Bare Bones Cake', target: 'Skeleton', article: ''
  Cake_Base:            canBuy: false, text: 'Basic Cake', target: 'Base', article: ''
  Cake_CottonCandyBlue: canBuy: false, text: 'Candy Blue Cake', target: 'CottonCandyBlue', article: ''
  Cake_CottonCandyPink: canBuy: false, text: 'Candy Pink Cake', target: 'CottonCandyPink', article: ''
  Cake_Shade:           canBuy: false, text: 'Chocolate Cake', target: 'Shade', article: ''
  Cake_White:           canBuy: false, text: 'Cream Cake', target: 'White', article: ''
  Cake_Golden:          canBuy: false, text: 'Honey Cake', target: 'Golden', article: ''
  Cake_Zombie:          canBuy: false, text: 'Rotten Cake', target: 'Zombie', article: ''
  Cake_Desert:          canBuy: false, text: 'Sand Cake', target: 'Desert', article: ''
  Cake_Red:             canBuy: false, text: 'Strawberry Cake', target: 'Red', article: ''

  # Tests hack, put honey last so the faux random picks it up in unit tests
  Honey:            text: 'Honey', target: 'Golden', article: ''

  Saddle:           text: 'Saddle', value: 5, notes: 'Instantly raises one of your pets into a mount.'
_.each api.food, (food,key) ->
  _.defaults food, {value: 1, key, notes: "Feed this to a pet and it may grow into a sturdy steed.", canBuy:true}

api.quests =

  evilsanta:
    canBuy:false
    text: "Trapper Santa" # title of the quest (eg, Deep into Vice's Layer)
    notes: "You hear bemoaned roars deep in the icefields. You follow the roars and growls - punctuated by another voice's cackling - to a clearing in the woods where you see a fully-grown polar bear. She's caged and shackled, roaring for life. Dancing atop the cage is a malicious little imp wearing castaway Christmas costumes. Vanquish Trapper Santa, and save the beast!"
    completion: "Trapper Santa squeals in anger, and bounces off into the night. A grateful she-bear, through roars and growls, tries to tell you something. You take her back to the stables, where Matt Boch the whisperer listens to her tale with a gasp of horror. She has a cub! He ran off into the icefields when mama bear was captured. Help her find her baby!"
    value: 4 # Gem cost to buy, GP sell-back
    #mechanic: enum['perfectDailies', ...]
    boss:
      name: "Trapper Santa" # name of the boss himself (eg, Vice)
      hp: 300
      str: 1 # Multiplier of users' missed dailies
    drop:
      items: [
        {type: 'mounts', key: 'BearCub-Polar', text: "Polar Bear (Mount)"}
      ]
      gp: 20
      exp: 100 # Exp bonus from defeating the boss

  evilsanta2:
    canBuy:false
    text: "Find The Cub"
    notes: "Mama bear's cub had run off into the icefields when she was captured by the trapper. At the edge of the woods, she sniffs the air. You hear twig-snaps and snow crunch through the crystaline sound of the forest. Paw prints! You both start racing to follow the trail. Find all the prints and broken twigs, and retrieve her cub!"
    completion: "You've found the cub! Mama and baby bear couldn't be more grateful. As a token, they've decided to keep you company till the end of days."
    value: 4
    previous: 'evilsanta'
    collect:
      tracks: text: 'Tracks', count: 20
      branches: text: 'Broken Twigs', count: 10
    drop:
      items: [
        {type: 'pets', key: 'BearCub-Polar', text: "Polar Bear (Pet)"}
      ]
      gp: 20
      exp: 100

  gryphon:
    text: "The Fiery Gryphon"
    notes: 'The grand beastmaster, @baconsaur, has come to your party seeking help. "Please, adventurers, you must help me! My prized gryphon has broken free and is terrorizing Habit City! If you can stop her, I could reward you with some of her eggs!"'
    completion: 'Defeated, the mighty beast ashamedly slinks back to its master."My word! Well done, adventurers!" @baconsaur exclaims, "Please, have some of the gryphon\'s eggs. I am sure you will raise these young ones well!'
    value: 4 # Gem cost to buy, GP sell-back
    boss:
      name: "Fiery Gryphon" # name of the boss himself (eg, Vice)
      hp: 300
      str: 1.5 # Multiplier of users' missed dailies
    drop:
      items: [
        {type: 'eggs', key: 'Gryphon', text: "Gryphon (Egg)"}
        {type: 'eggs', key: 'Gryphon', text: "Gryphon (Egg)"}
        {type: 'eggs', key: 'Gryphon', text: "Gryphon (Egg)"}
      ]
      gp: 25
      exp: 125
      
  hedgehog:
    text: "The Hedgebeast"
    notes: 'Hedgehogs are a funny group of animals. They are some of the most affectionate pets a Habiteer could own. But rumor has it, if you feed them milk after midnight, they grow quite irritable. And fifty times their size. And @Inventrix did just that. Oops.'
    completion: 'Your party successfully calmed down the hedgehog! After shrinking down to a normal size, she hobbles away to her eggs. She returns squeeking and nudging some of her eggs along towards your party. Hopefully, these hedgehogs like milk better!'
    value: 4 # Gem cost to buy, GP sell-back
    boss:
      name: "Hedgebeast" # name of the boss himself (eg, Vice)
      hp: 400
      str: 1.25 # Multiplier of users' missed dailies
    drop:
      items: [
        {type: 'eggs', key: 'Hedgehog', text: "Hedgehog (Egg)"}
        {type: 'eggs', key: 'Hedgehog', text: "Hedgehog (Egg)"}
        {type: 'eggs', key: 'Hedgehog', text: "Hedgehog (Egg)"}
      ]
      gp: 30
      exp: 125

  vice1:
    text: "Free Yourself of the Dragon's Influence"
    notes: "<p>They say there lies a terrible evil in the caverns of Mt. Habitica. A monster whose presence twists the wills of the strong heroes of the land, turning them towards bad habits and laziness! The beast is a grand dragon of immense power and comprised of the shadows themselves. Vice, the treacherous Shadow Wyrm. Brave Habiteers, stand up and defeat this foul beast once and for all, but only if you believe you can stand against its immense power. </p><h3>Vice Part 1: </h3><p>How can you expect to the fight the beast if it already has control over you? Don't fall victim to laziness and vice! Work hard to fight against the dragon's dark influence and dispel his hold on you! </p>"
    value: 4
    lvl: 30
    boss:
      name: "Vice's Shade"
      hp: 750
      str: 1.5
    drop:
      items: [
        {type: 'quests', key: "vice2", text: "Vice Part 2 (Scroll)"}
      ]
      gp: 20
      exp: 100

  vice2:
    text: "Find the Lair of the Wyrm"
    notes: "With Vice's influence over you dispelled, you feel a surge of strength you didn't know you had return to you. Confident in yourselves and your ability to withstand the wyrm's influence, your party makes it's way to Mt. Habitica. You approach the entrance to the mountain's caverns and pause. Swells of shadows, almost like fog, wisp out from the opening. It is near impossible to see anything in front of you. The light from your lanterns seem to end abruptly where the shadows begin. It is said that only magical light can pierce the dragon's infernal haze. If you can find enough light crystals, you could make your way to the dragon."
    value: 4
    lvl: 35
    previous: 'vice1'
    collect:
      lightCrystal: text: 'Light Crystal', count: 45
    drop:
      items: [
        {type: 'quests', key: 'vice3', text: "Vice Part 3 (Scroll)"}
      ]
      gp: 20
      exp: 75

  vice3:
    text: "Vice Awakens"
    notes: "After much effort, your party has discovered Vice's lair. The hulking monster eyes your party with distaste. As shadows swirl around you, a voice whispers through your head, \"More foolish citizens of Habitica come to stop me? Cute. You'd have been wise not to come.\" The scaly titan rears back its head and prepares to attack. This is your chance! Give it everything you've got and defeat Vice once and for all!"
    completion: "The shadows dissipate from the cavern and a steely silence falls. My word, you've done it! You have defeated Vice! You and your party may finally breath a sigh of relief. Enjoy your victory, brave Habiteers, but take the lessons you've learned from battling Vice and move forward. There are still habits to be done and potentially worse evils to conquer!"
    previous: 'vice2'
    value: 4
    lvl: 40
    boss:
      name: "Vice, the Shadow Wyrm"
      hp: 1500
      str: 3
    drop:
      items: [
        {type: 'gear', key: "weapon_special_2", text: "Stephen Weber's Shaft of the Dragon"}
        {type: 'eggs', key: 'Dragon', text: "Dragon (Egg)"}
        {type: 'eggs', key: 'Dragon', text: "Dragon (Egg)"}
        {type: 'hatchingPotions', key: 'Shade', text: "Shade Hatching Potion"}
        {type: 'hatchingPotions', key: 'Shade', text: "Shade Hatching Potion"}
      ]
      gp: 100
      exp: 1000


_.each api.quests, (v,key) ->
  _.defaults v, {key,canBuy:true}

repeat = {m:true,t:true,w:true,th:true,f:true,s:true,su:true}
api.userDefaults =
  habits: [
    {type: 'habit', text: '1h Productive Work', notes: 'When you create a new Habit, you can click the Edit icon and choose for it to represent a positive habit, a negative habit, or both. For some Habits, like this one, it only makes sense to gain points.', value: 0, up: true, down: false, attribute: 'per' }
    {type: 'habit', text: 'Eat Junk Food', notes: 'For others, it only makes sense to *lose* points.', value: 0, up: false, down: true, attribute: 'con'}
    {type: 'habit', text: 'Take The Stairs', notes: 'For the rest, both + and - make sense (stairs = gain, elevator = lose).', value: 0, up: true, down: true, attribute: 'str'}
  ]

  dailys: [
    {type: 'daily', text: '1h Personal Project', notes: 'All tasks default to yellow when they are created. This means you will take only moderate damage when they are missed and will gain only a moderate reward when they are completed.', value: 0, completed: false, repeat: repeat, attribute: 'per' }
    {type: 'daily', text: 'Exercise', notes: 'Dailies you complete consistently will turn from yellow to green to blue, helping you track your progress. The higher you move up the ladder, the less damage you take for missing and less reward you receive for completing the goal.', value: 3, completed: false, repeat: repeat, attribute: 'str' }
    {type: 'daily', text: '45m Reading', notes: 'If you miss a daily frequently, it will turn darker shades of orange and red. The redder the task is, the more experience and gold it grants for success and the more damage you take for failure. This encourages you to focus on your shortcomings, the reds.', value: -10, completed: false, repeat: repeat, attribute: 'int' }
  ]

  todos: [
    {type: 'todo', text: 'Call Mom', notes: 'While not completing a to-do in a set period of time will not hurt you, they will gradually change from yellow to red, thus becoming more valuable. This will encourage you to wrap up stale To-Dos.', value: -3, completed: false, attribute: 'per' }
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
