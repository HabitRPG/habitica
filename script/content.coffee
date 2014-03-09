_ = require 'lodash'
api = module.exports
moment = require 'moment'
i18n = require './i18n.coffee'
###
  ---------------------------------------------------------------
  Gear (Weapons, Armor, Head, Shield)
  Item definitions: {index, text, notes, value, str, def, int, per, classes, type}
  ---------------------------------------------------------------
###

classes = ['warrior', 'rogue', 'healer', 'wizard']
gearTypes = [ 'weapon', 'armor', 'head', 'shield', 'body', 'back', 'headAccessory']

events =
  winter: {start:'2013-12-31',end:'2014-02-01'}
  birthday: {start:'2013-01-30',end:'2014-02-01'}
  spring: {start:'2014-03-21',end:'2014-05-01'}

mystery =
  201402: {start:'2014-02-22',end:'2014-02-28'}
  201403: {start:'2014-03-24',end:'2014-04-01'}
  201404: {start:'2014-04-24',end:'2014-05-01'}
  wondercon: {start:'2014-03-24',end:'2014-04-01'} # not really, but the mechanic works

gear =
  weapon:
    base:
      0: 
        text: (-> i18n.t('weaponBase0Text')), notes: (-> i18n.t('weaponBase0Notes')), value:0
    warrior:
      0: text: (-> i18n.t('weaponWarrior0Text')), notes: (-> i18n.t('weaponWarrior0Notes')), value:0
      1: text: (-> i18n.t('weaponWarrior1Text')), notes: (-> i18n.t('weaponWarrior1Notes', {str: 3})), str: 3, value:20
      2: text: (-> i18n.t('weaponWarrior2Text')), notes: (-> i18n.t('weaponWarrior2Notes', {str: 6})), str: 6, value:30
      3: text: (-> i18n.t('weaponWarrior3Text')), notes: (-> i18n.t('weaponWarrior3Notes', {str: 9})), str: 9, value:45
      4: text: (-> i18n.t('weaponWarrior4Text')), notes: (-> i18n.t('weaponWarrior4Notes', {str: 12})), str: 12, value:65
      5: text: (-> i18n.t('weaponWarrior5Text')), notes: (-> i18n.t('weaponWarrior5Notes', {str: 15})), str: 15, value:90
      6: text: (-> i18n.t('weaponWarrior6Text')), notes: (-> i18n.t('weaponWarrior6Notes', {str: 18})), str: 18, value:120, last: true
    rogue:
      #Not using bows at the moment, but they would be easy to add back in to an advanced Armory feature, as Quest drops, etc.
      #0: twoHanded: true, text: "Practice Bow", notes:'Training weapon. Confers no benefit.', value:0
      #1: twoHanded: true, text: "Short Bow", notes:'Simple bow best at close ranges. Increases STR by 2.', str: 2, value:20
      #2: twoHanded: true, text: "Long Bow", notes:'Bow with a strong draw for extra distance. Increases STR by 5.', str: 5, value:50
      #3: twoHanded: true, text: "Recurve Bow", notes:'Built with advanced techniques. Increases STR by 8.', str: 8, value:80
      #4: twoHanded: true, text: "Icicle Bow", notes:'Fires arrows of piercing cold. Increases STR by 12.', str: 12, value:120
      #5: twoHanded: true, text: "Meteor Bow", notes:'Rains flame upon your foes. Increases STR by 16.', str: 16, value:160
      #6: twoHanded: true, text: "Golden Bow", notes:'As swift as sunlight and as sharp as lightning. Increases STR by 20.', str: 20, value:200, last: true
      0: text: (-> i18n.t('weaponRogue0Text')), notes: (-> i18n.t('weaponRogue0Notes')), str: 0, value: 0
      1: text: (-> i18n.t('weaponRogue1Text')), notes: (-> i18n.t('weaponRogue1Notes', {str: 2})), str: 2, value: 20
      2: text: (-> i18n.t('weaponRogue2Text')), notes: (-> i18n.t('weaponRogue2Notes', {str: 3})), str: 3, value: 35
      3: text: (-> i18n.t('weaponRogue3Text')), notes: (-> i18n.t('weaponRogue3Notes', {str: 4})), str: 4, value: 50
      4: text: (-> i18n.t('weaponRogue4Text')), notes: (-> i18n.t('weaponRogue4Notes', {str: 6})), str: 6, value: 70
      5: text: (-> i18n.t('weaponRogue5Text')), notes: (-> i18n.t('weaponRogue5Notes', {str: 8})), str: 8, value: 90
      6: text: (-> i18n.t('weaponRogue6Text')), notes: (-> i18n.t('weaponRogue6Notes', {str: 10})), str: 10, value: 120, last: true
    wizard:
      0: twoHanded: true, text: (-> i18n.t('weaponWizard0Text')), notes: (-> i18n.t('weaponWizard0Notes')), value:0
      1: twoHanded: true, text: (-> i18n.t('weaponWizard1Text')), notes: (-> i18n.t('weaponWizard1Notes', {int: 3, per: 1})), int: 3, per: 1, value:30
      2: twoHanded: true, text: (-> i18n.t('weaponWizard2Text')), notes: (-> i18n.t('weaponWizard2Notes', {int: 6, per: 2})), int: 6, per: 2, value:50
      3: twoHanded: true, text: (-> i18n.t('weaponWizard3Text')), notes: (-> i18n.t('weaponWizard3Notes', {int: 9, per: 3})), int: 9, per: 3, value:80
      4: twoHanded: true, text: (-> i18n.t('weaponWizard4Text')), notes: (-> i18n.t('weaponWizard4Notes', {int: 12, per: 5})), int:12, per: 5, value:120
      5: twoHanded: true, text: (-> i18n.t('weaponWizard5Text')), notes: (-> i18n.t('weaponWizard5Notes', {int: 15, per: 7})), int: 15, per: 7, value:160
      6: twoHanded: true, text: (-> i18n.t('weaponWizard6Text')), notes: (-> i18n.t('weaponWizard6Notes', {int: 18, per: 10})), int: 18, per: 10, value:200, last: true
    healer:
      0: text: (-> i18n.t('weaponHealer0Text')), notes: (-> i18n.t('weaponHealer0Notes')), value:0
      1: text: (-> i18n.t('weaponHealer1Text')), notes: (-> i18n.t('weaponHealer1Notes', {int: 2})), int: 2, value:20
      2: text: (-> i18n.t('weaponHealer2Text')), notes: (-> i18n.t('weaponHealer2Notes', {int: 3})), int: 3, value:30
      3: text: (-> i18n.t('weaponHealer3Text')), notes: (-> i18n.t('weaponHealer3Notes', {int: 5})), int: 5, value:45
      4: text: (-> i18n.t('weaponHealer4Text')), notes: (-> i18n.t('weaponHealer4Notes', {int: 7})), int:7, value:65
      5: text: (-> i18n.t('weaponHealer5Text')), notes: (-> i18n.t('weaponHealer5Notes', {int: 9})), int: 9, value:90
      6: text: (-> i18n.t('weaponHealer6Text')), notes: (-> i18n.t('weaponHealer6Notes', {int: 11})), int: 11, value:120, last: true
    special:
      0: text: (-> i18n.t('weaponSpecial0Text')), notes: (-> i18n.t('weaponSpecial0Notes', {str: 20})), str: 20, value:150, canOwn: ((u)-> +u.backer?.tier >= 70)
      1: text: (-> i18n.t('weaponSpecial1Text')), notes: (-> i18n.t('weaponSpecial1Notes', {attrs: 6})), str: 6, per: 6, con: 6, int: 6, value:170, canOwn: ((u)-> +u.contributor?.level >= 4)
      2: text: (-> i18n.t('weaponSpecial2Text')), notes: (-> i18n.t('weaponSpecial2Notes', {attrs: 25})), str: 25, per: 25, value:200, canOwn: ((u)-> (+u.backer?.tier >= 300) or u.items.gear.owned.weapon_special_2?)
      3: text: (-> i18n.t('weaponSpecial3Text')), notes: (-> i18n.t('weaponSpecial3Notes', {attrs: 17})), str: 17, int: 17, con: 17, value:200, canOwn: ((u)-> +u.backer?.tier >= 300)
      critical: text: (-> i18n.t('weaponSpecialCriticalText')), notes: (-> i18n.t('weaponSpecialCriticalNotes', {attrs: 40})), str: 40, per: 40, value:200, canOwn: ((u)-> !!u.contributor?.critical)
      # Winter event gear
      yeti:       event: events.winter, canOwn: ((u)->u.stats.class is 'warrior' ), text: (-> i18n.t('weaponSpecialYetiText')), notes: (-> i18n.t('weaponSpecialYetiNotes', {str: 15})), str: 15, value:90
      ski:        event: events.winter, canOwn: ((u)->u.stats.class is 'rogue'   ), text: (-> i18n.t('weaponSpecialSkiText')), notes: (-> i18n.t('weaponSpecialSkiNotes', {str: 8})), str: 8, value: 90
      candycane:  event: events.winter, canOwn: ((u)->u.stats.class is 'wizard'  ), twoHanded: true, text: (-> i18n.t('weaponSpecialCandycaneText')), notes: (-> i18n.t('weaponSpecialCandycaneNotes', {int: 15, per: 7})), int: 15, per: 7, value:160
      snowflake:  event: events.winter, canOwn: ((u)->u.stats.class is 'healer'  ), text: (-> i18n.t('weaponSpecialSnowflakeText')), notes: (-> i18n.t('weaponSpecialSnowflakeNotes', {int: 9})), int: 9, value:90
      #Spring Fling
      springRogue:    event: events.spring, specialClass: 'rogue',   text: 'Hook Claws', notes: 'Great for scaling tall buildings, and also for shredding carpets. Adds 8 points to STR. Limited Edition 2014 Spring Gear.', value: 80, str: 8
      springWarrior:  event: events.spring, specialClass: 'warrior', text: 'Carrot Sword', notes: 'This mighty sword can slice foes with ease! It also makes a delicious mid-battle snack. Adds 15 points to STR. Limited Edition 2014 Spring Gear.', value: 90, str: 15
      springMage:     event: events.spring, specialClass: 'wizard',  twoHanded:true, text: 'Swiss Cheese Staff', notes: 'Only the most powerful rodents can brave their hunger to wield this potent staff. Adds 15 points to INT and 7 points to PER. Limited Edition 2014 Spring Gear.', value: 160, int:15, per:7
      springHealer:   event: events.spring, specialClass: 'healer',  text: 'Lovely Bone', notes: 'FETCH! Adds 9 points to INT. Limited Edition 2014 Spring Gear.', value: 90, int: 9

  armor:
    base:
      0: text: (-> i18n.t('armorBase0Text')), notes: (-> i18n.t('armorBase0Notes')), value:0
    warrior:
      #0: text: "Plain Clothing", notes:'Ordinary clothing. Confers no benefit.', value:0
      1: text: (-> i18n.t('armorWarrior1Text')), notes: (-> i18n.t('armorWarrior1Notes', {con: 3})), con: 3, value:30
      2: text: (-> i18n.t('armorWarrior2Text')), notes: (-> i18n.t('armorWarrior2Notes', {con: 5})), con: 5, value:45
      3: text: (-> i18n.t('armorWarrior3Text')), notes: (-> i18n.t('armorWarrior3Notes', {con: 7})), con: 7, value:65
      4: text: (-> i18n.t('armorWarrior4Text')), notes: (-> i18n.t('armorWarrior4Notes', {con: 9})), con: 9, value:90
      5: text: (-> i18n.t('armorWarrior5Text')), notes: (-> i18n.t('armorWarrior5Notes', {con: 11})), con: 11, value:120, last: true
    rogue:
      #0: text: "Plain Clothing", notes:'Ordinary clothing. Confers no benefit.', value:0
      1: text: (-> i18n.t('armorRogue1Text')), notes: (-> i18n.t('armorRogue1Notes', {per: 6})), per: 6, value:30
      2: text: (-> i18n.t('armorRogue2Text')), notes: (-> i18n.t('armorRogue2Notes', {per: 9})), per: 9, value:45
      3: text: (-> i18n.t('armorRogue3Text')), notes: (-> i18n.t('armorRogue3Notes', {per: 12})), per: 12, value:65
      4: text: (-> i18n.t('armorRogue4Text')), notes: (-> i18n.t('armorRogue4Notes', {per: 15})), per: 15, value:90
      5: text: (-> i18n.t('armorRogue5Text')), notes: (-> i18n.t('armorRogue5Notes', {per: 18})), per: 18, value:120, last: true
    wizard:
      #0: text: "Apprentice Garb", notes:'For students of magic. Confers no benefit.', value:0
      1: text: (-> i18n.t('armorWizard1Text')), notes: (-> i18n.t('armorWizard1Notes', {int: 2})), int: 2, value:30
      2: text: (-> i18n.t('armorWizard2Text')), notes: (-> i18n.t('armorWizard2Notes', {int: 4})), int: 4, value:45
      3: text: (-> i18n.t('armorWizard3Text')), notes: (-> i18n.t('armorWizard3Notes', {int: 6})), int: 6, value:65
      4: text: (-> i18n.t('armorWizard4Text')), notes: (-> i18n.t('armorWizard4Notes', {int: 9})), int: 9, value:90
      5: text: (-> i18n.t('armorWizard5Text')), notes: (-> i18n.t('armorWizard5Notes', {int: 12})), int: 12, value:120, last: true
    healer:
      #0: text: "Novice Robe", notes:'For healers in training. Confers no benefit.', value:0
      1: text: (-> i18n.t('armorHealer1Text')), notes: (-> i18n.t('armorHealer1Notes', {con: 6})), con: 6, value:30
      2: text: (-> i18n.t('armorHealer2Text')), notes: (-> i18n.t('armorHealer2Notes', {con: 9})), con: 9, value:45
      3: text: (-> i18n.t('armorHealer3Text')), notes: (-> i18n.t('armorHealer3Notes', {con: 12})), con: 12, value:65
      4: text: (-> i18n.t('armorHealer4Text')), notes: (-> i18n.t('armorHealer4Notes', {con: 15})), con: 15, value:90
      5: text: (-> i18n.t('armorHealer5Text')), notes: (-> i18n.t('armorHealer5Notes', {con: 18})), con: 18, value:120, last: true
    special:
      0: text: (-> i18n.t('armorSpecial0Text')), notes: (-> i18n.t('armorSpecial0Notes', {con: 20})), con: 20, value:150, canOwn: ((u)-> +u.backer?.tier >= 45)
      1: text: (-> i18n.t('armorSpecial1Text')), notes: (-> i18n.t('armorSpecial1Notes', {attrs: 6})), con: 6, str: 6, per: 6, int: 6, value:170, canOwn: ((u)-> +u.contributor?.level >= 2)
      2: text: (-> i18n.t('armorSpecial2Text')), notes: (-> i18n.t('armorSpecial2Notes', {attrs: 25})), int: 25, con: 25, value:200, canOwn: ((u)-> +u.backer?.tier >= 300)
      #Winter event
      yeti:       event: events.winter, canOwn: ((u)->u.stats.class is 'warrior' ), text: (-> i18n.t('armorSpecialYetiText')), notes: (-> i18n.t('armorSpecialYetiNotes', {con: 9})), con: 9, value:90
      ski:        event: events.winter, canOwn: ((u)->u.stats.class is 'rogue'   ), text: (-> i18n.t('armorSpecialSkiText')), notes: (-> i18n.t('armorSpecialSkiText', {per: 15})), per: 15, value:90
      candycane:  event: events.winter, canOwn: ((u)->u.stats.class is 'wizard'  ), text: (-> i18n.t('armorSpecialCandycaneText')), notes: (-> i18n.t('armorSpecialCandycaneNotes', {int: 9})), int: 9, value:90
      snowflake:  event: events.winter, canOwn: ((u)->u.stats.class is 'healer'  ), text: (-> i18n.t('armorSpecialSnowflakeText')), notes: (-> i18n.t('armorSpecialSnowflakeNotes', {con: 15})), con: 15, value:90
      birthday:   event: events.birthday, text: (-> i18n.t('armorSpecialBirthdayText')), notes: (-> i18n.t('armorSpecialBirthdayNotes')), value: 0
      # Spring Fling
      springRogue:    event: events.spring, specialClass: 'rogue',   text: 'Sleek Cat Suit', notes: 'Impeccably groomed. Adds 15 points to PER. Limited Edition 2014 Spring Gear.', value: 90, per: 15
      springWarrior:  event: events.spring, specialClass: 'warrior', text: 'Clover-steel Armor', notes: 'Soft as clover, strong as steel! Adds 9 points to CON. Limited Edition 2014 Spring Gear.', value: 90, con: 9
      springMage:     event: events.spring, specialClass: 'wizard',    text: 'Rodentia Robes', notes: 'Mice are nice! Adds 9 points to INT. Limited Edition 2014 Spring Gear.', value: 90, int: 9
      springHealer:   event: events.spring, specialClass: 'healer',  text: 'Fuzzy Puppy Robes', notes: 'Warm and snuggly, but protects its owner from harm. Adds 15 points to CON. Limited Edition 2014 Spring Gear.', value: 90, con: 15
    mystery:
      201402: text: (-> i18n.t('armorMystery201402Text')), notes: (-> i18n.t('armorMystery201402Notes')), mystery:mystery['201402'], value: 10
      201403: text: 'Forest Walker Armor', notes: "This mossy armor of woven wood bends with the movement of the wearer.", mystery:mystery['201403'], value: 10

  head:
    base:
      0: text: (-> i18n.t('headBase0Text')), notes: (-> i18n.t('headBase0Notes')), value:0
    warrior:
      #0: text: "No Helm", notes:'No headgear.', value:0
      1: text: (-> i18n.t('headWarrior1Text')), notes: (-> i18n.t('headWarrior1Notes', {str: 2})), str: 2, value:15
      2: text: (-> i18n.t('headWarrior2Text')), notes: (-> i18n.t('headWarrior2Notes', {str: 4})), str: 4, value:25
      3: text: (-> i18n.t('headWarrior3Text')), notes: (-> i18n.t('headWarrior3Notes', {str: 6})), str: 6, value:40
      4: text: (-> i18n.t('headWarrior4Text')), notes: (-> i18n.t('headWarrior4Notes', {str: 9})), str: 9, value:60
      5: text: (-> i18n.t('headWarrior5Text')), notes: (-> i18n.t('headWarrior5Notes', {str: 12})), str: 12, value:80, last: true
    rogue:
      #0: text: "No Hood", notes:'No headgear.', value:0
      1: text: (-> i18n.t('headRogue1Text')), notes: (-> i18n.t('headRogue1Notes', {per: 2})), per: 2, value:15
      2: text: (-> i18n.t('headRogue2Text')), notes: (-> i18n.t('headRogue2Notes', {per: 4})), per: 4, value:25
      3: text: (-> i18n.t('headRogue3Text')), notes: (-> i18n.t('headRogue3Notes', {per: 6})), per: 6, value:40
      4: text: (-> i18n.t('headRogue4Text')), notes: (-> i18n.t('headRogue4Notes', {per: 9})), per: 9, value:60
      5: text: (-> i18n.t('headRogue5Text')), notes: (-> i18n.t('headRogue5Notes', {per: 12})), per: 12, value:80, last: true
    wizard:
      #0: text: "No Hat", notes:'No headgear.', value:0
      1: text: (-> i18n.t('headWizard1Text')), notes: (-> i18n.t('headWizard1Notes', {per: 2})), per: 2, value:15
      2: text: (-> i18n.t('headWizard2Text')), notes: (-> i18n.t('headWizard2Notes', {per: 3})), per: 3, value:25
      3: text: (-> i18n.t('headWizard3Text')), notes: (-> i18n.t('headWizard3Notes', {per: 5})), per: 5, value:40
      4: text: (-> i18n.t('headWizard4Text')), notes: (-> i18n.t('headWizard4Notes', {per: 7})), per: 7, value:60
      5: text: (-> i18n.t('headWizard5Text')), notes: (-> i18n.t('headWizard5Notes', {per: 10})), per: 10, value:80, last: true
    healer:
      #0: text: "No Circlet", notes:'No headgear.', value:0
      1: text: (-> i18n.t('headHealer1Text')), notes: (-> i18n.t('headHealer1Notes', {int: 2})), int: 2, value:15
      2: text: (-> i18n.t('headHealer2Text')), notes: (-> i18n.t('headHealer2Notes', {int: 3})), int: 3, value:25
      3: text: (-> i18n.t('headHealer3Text')), notes: (-> i18n.t('headHealer3Notes', {int: 5})), int: 5, value:40
      4: text: (-> i18n.t('headHealer4Text')), notes: (-> i18n.t('headHealer4Notes', {int: 7})), int: 7, value:60
      5: text: (-> i18n.t('headHealer5Text')), notes: (-> i18n.t('headHealer5Notes', {int: 9})), int: 9, value:80, last: true
    special:
      0: text: (-> i18n.t('headSpecial0Text')), notes: (-> i18n.t('headSpecial0Notes', {int: 20})), int: 20, value:150, canOwn: ((u)-> +u.backer?.tier >= 45)
      1: text: (-> i18n.t('headSpecial1Text')), notes: (-> i18n.t('headSpecial1Notes', {attrs: 6})), con: 6, str: 6, per: 6, int: 6, value:170, canOwn: ((u)-> +u.contributor?.level >= 3)
      2: text: (-> i18n.t('headSpecial2Text')), notes: (-> i18n.t('headSpecial2Notes', {attrs: 25})), int: 25, str: 25, value:200, canOwn: ((u)-> +u.backer?.tier >= 300)
      #Winter event
      nye:        event: events.winter, text: (-> i18n.t('headSpecialNyeText')), notes: (-> i18n.t('headSpecialNyeNotes')), value: 0
      yeti:       event: events.winter, canOwn: ((u)->u.stats.class is 'warrior' ), text: (-> i18n.t('headSpecialYetiText')), notes: (-> i18n.t('headSpecialYetiNotes', {str: 9})), str: 9, value:60
      ski:        event: events.winter, canOwn: ((u)->u.stats.class is 'rogue'   ), text: (-> i18n.t('headSpecialSkiText')), notes: (-> i18n.t('headSpecialSkiNotes', {per: 9})), per: 9, value:60
      candycane:  event: events.winter, canOwn: ((u)->u.stats.class is 'wizard'  ), text: (-> i18n.t('headSpecialCanycaneText')), notes: (-> i18n.t('headSpecialCanycaneNotes', {per: 7})), per: 7, value:60
      snowflake:  event: events.winter, canOwn: ((u)->u.stats.class is 'healer'  ), text: (-> i18n.t('headSpecialSnowflakeText')), notes: (-> i18n.t('headSpecialSnowflakeNotes', {int: 7})), int: 7, value:60
      # Spring Fling
      springRogue:    event: events.spring, specialClass: 'rogue',   text:'Stealthy Kitty Mask', notes:'Nobody will EVER guess that you are a cat burglar! Adds 9 points to PER. Limited Edition 2014 Spring Gear.',value: 40,per: 9
      springWarrior:  event: events.spring, specialClass: 'warrior', text:'Clover-steel Helmet', notes:'Welded from sweet meadow clover, this helmet can resist even the mightiest blow. Adds 9 points to STR. Limited Edition 2014 Spring Gear.',value: 40,str: 9
      springMage:     event: events.spring, specialClass: 'wizard',    text:'Swiss Cheese Hat', notes:'This hat stores lots of powerful magic! Try not to nibble it. Adds 7 points to PER. Limited Edition 2014 Spring Gear.',value: 40,per: 7
      springHealer:   event: events.spring, specialClass: 'healer',  text:'Crown of Friendship', notes:"This crown symbolizes loyalty and companionship. A dog is an adventurer's best friend, after all! Adds 7 points to INT. Limited Edition 2014 Spring Gear.", value: 40, int: 7
    mystery:
      201402: text: (-> i18n.t('headMystery201402Text')), notes: (-> i18n.t('headMystery201402Notes')), mystery:mystery['201402'], value: 10

  shield:
    base:
      0: text: (-> i18n.t('shieldBase0Text')), notes: (-> i18n.t('shieldBase0Notes')), value:0
      #changed because this is what shows up for all classes, including those without shields
    warrior:
      #0: text: "No Shield", notes:'No shield.', value:0
      1: text: (-> i18n.t('shieldWarrior1Text')), notes: (-> i18n.t('shieldWarrior1Notes', {con: 2})), con: 2, value:20
      2: text: (-> i18n.t('shieldWarrior2Text')), notes: (-> i18n.t('shieldWarrior2Notes', {con: 3})), con: 3, value:35
      3: text: (-> i18n.t('shieldWarrior3Text')), notes: (-> i18n.t('shieldWarrior3Notes', {con: 5})), con: 5, value:50
      4: text: (-> i18n.t('shieldWarrior4Text')), notes: (-> i18n.t('shieldWarrior4Notes', {con: 7})), con: 7, value:70
      5: text: (-> i18n.t('shieldWarrior5Text')), notes: (-> i18n.t('shieldWarrior5Notes', {con: 9})), con: 9, value:90, last: true
    rogue:
      0: text: (-> i18n.t('weaponRogue0Text')), notes: (-> i18n.t('weaponRogue0Notes')), str: 0, value: 0
      1: text: (-> i18n.t('weaponRogue1Text')), notes: (-> i18n.t('weaponRogue1Notes', {str: 2})), str: 2, value: 20
      2: text: (-> i18n.t('weaponRogue2Text')), notes: (-> i18n.t('weaponRogue2Notes', {str: 3})), str: 3, value: 35
      3: text: (-> i18n.t('weaponRogue3Text')), notes: (-> i18n.t('weaponRogue3Notes', {str: 4})), str: 4, value: 50
      4: text: (-> i18n.t('weaponRogue4Text')), notes: (-> i18n.t('weaponRogue4Notes', {str: 6})), str: 6, value: 70
      5: text: (-> i18n.t('weaponRogue5Text')), notes: (-> i18n.t('weaponRogue5Notes', {str: 8})), str: 8, value: 90
      6: text: (-> i18n.t('weaponRogue6Text')), notes: (-> i18n.t('weaponRogue6Notes', {str: 10})), str: 10, value: 120, last: true
    wizard: {}
      #0: text: "No Shield", notes:'No shield.', def: 0, value:0, last: true
    healer:
      #0: text: "No Shield", notes:'No shield.', def: 0, value:0
      1: text: (-> i18n.t('shieldHealer1Text')), notes: (-> i18n.t('shieldHealer1Notes', {con: 2})), con: 2, value:20
      2: text: (-> i18n.t('shieldHealer2Text')), notes: (-> i18n.t('shieldHealer2Notes', {con: 4})), con: 4, value:35
      3: text: (-> i18n.t('shieldHealer3Text')), notes: (-> i18n.t('shieldHealer3Notes', {con: 6})), con: 6, value:50
      4: text: (-> i18n.t('shieldHealer4Text')), notes: (-> i18n.t('shieldHealer4Notes', {con: 9})), con: 9, value:70
      5: text: (-> i18n.t('shieldHealer5Text')), notes: (-> i18n.t('shieldHealer5Notes', {con: 12})), con: 12, value:90, last: true
    special:
      0: text: (-> i18n.t('shieldSpecial0Text')), notes: (-> i18n.t('shieldSpecial0Notes', {per: 20})), per: 20, value:150, canOwn: ((u)-> +u.backer?.tier >= 45)
      1: text: (-> i18n.t('shieldSpecial1Text')), notes: (-> i18n.t('shieldSpecial1Notes', {attrs: 6})), con: 6, str: 6, per: 6, int:6, value:170, canOwn: ((u)-> +u.contributor?.level >= 5)
      #Winter event
      yeti:       event: events.winter, canOwn: ((u)->u.stats.class is 'warrior' ), text: (-> i18n.t('shieldSpecialYetiText')), notes: (-> i18n.t('shieldSpecialYetiNotes', {con: 7})), con: 7, value: 70
      ski:        event: events.winter, canOwn: ((u)->u.stats.class is 'rogue'   ), text: (-> i18n.t('weaponSpecialSkiText')), notes: (-> i18n.t('weaponSpecialSkiNotes', {str: 8})), str: 8, value: 90
      snowflake:  event: events.winter, canOwn: ((u)->u.stats.class is 'healer'  ), text: (-> i18n.t('shieldSpecialSnowflakeText')), notes: (-> i18n.t('shieldSpecialSnowflakeNotes', {con: 9})), con: 9, value: 70
      #Spring Fling
      springRogue:    event: events.spring, specialClass: 'rogue',   text: 'Hook Claws', notes:'Great for scaling tall buildings, and also for shredding carpets. Adds 8 points to STR. Limited Edition 2014 Spring Gear.', value: 80, str: 8
      springWarrior:  event: events.spring, specialClass: 'warrior', text: 'Egg Shield', notes: "This shield never cracks, no matter how hard you hit it! Adds 7 points to CON. Limited Edition 2014 Spring Gear.", value: 70, con: 7
      springHealer:   event: events.spring, specialClass: 'healer',  text: 'Squeaky Ball of Ultimate Protection', notes: "Lets out an obnoxious, continuous squeak when bitten, driving enemies away. Adds 9 points to CON. Limited Edition 2014 Spring Gear.", value: 70, con: 9

  back:
    base:
      0: text: (-> i18n.t('backBase0Text')), notes: (-> i18n.t('backBase0Notes')), value:0
    mystery:
      201402: text: (-> i18n.t('backMystery201402Text')), notes: (-> i18n.t('headMystery201402Notes')), mystery:mystery['201402'], value: 10
      201404: text: 'Twilight Butterfly Wings', notes: "Be a butterfly and flutter by!", mystery:mystery['201404'], value: 10
    special:
      wondercon_red: text: 'Mighty Cape', notes: 'Swishes with strength and beauty. Special edition convention armor.', value: 0, mystery:mystery.wondercon
      wondercon_black: text: 'Sneaky Cape', notes: 'Spun of shadows and whispers. Special edition convention armor.', value: 0,   mystery:mystery.wondercon

  body:
    base:
      0: text: "No Body Accessory", notes:'No Body Accessory.', value:0
    special:
      wondercon_red: text: 'Ruby Collar', notes: 'An attractive ruby collar! Special edition convention armor.', value: 0,      mystery:mystery.wondercon
      wondercon_gold: text: 'Golden Collar', notes: 'An attractive gold collar! Special edition convention armor.', value: 0,   mystery:mystery.wondercon
      wondercon_black: text: 'Ebony Collar', notes: 'An attractive ebony collar! Special edition convention armor.', value: 0,  mystery:mystery.wondercon

  headAccessory:
    base:
      0: text: 'No Head Accessory', notes: 'No Head Accessory', value: 0, last: true
    special:
      # Spring Event
      springRogue:   event: events.spring, specialClass: 'rogue',   text: "Purple Cat Ears", notes: "These feline ears twitch to detect incoming threats. Confers no stat bonus. Limited Edition 2014 Spring Gear.", value: 20
      springWarrior: event: events.spring, specialClass: 'warrior', text: 'Green Bunny Ears', notes: "Bunny ears that keenly detect every crunch of a carrot. Confers no stat bonus. Limited Edition 2014 Spring Gear.", value: 20
      springMage:    event: events.spring, specialClass: 'wizard',    text: 'Blue Mouse Ears', notes: 'These round mouse ears are silky-soft. Confers no stat bonus. Limited Edition 2014 Spring Gear.', value: 20
      springHealer:  event: events.spring, specialClass: 'healer',  text: 'Yellow Dog Ears', notes: 'Floppy but cute. Wanna play? Confers no stat bonus. Limited Edition 2014 Spring Gear.', value: 20
      wondercon_red: text: 'Mighty Mask', notes: 'What a powerful face accessory! Special edition convention armor.', value: 0,           mystery:mystery.wondercon
      wondercon_black: text: 'Sneaky Mask', notes: 'Your motives are definitely legitimate. Special edition convention armor.', value: 0, mystery:mystery.wondercon
    mystery:
      201403: text: 'Forest Walker Antlers', notes: "These antlers shimmer with moss and lichen.", mystery:mystery['201403'], value: 10
      201404: text: 'Twilight Butterfly Antennae', notes: "These antennae help the wearer sense dangerous distractions!", mystery:mystery['201404'], value: 10

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
          _canOwn(u) and
            (u.items.gear.owned[key]? or (moment().isAfter(item.event.start) and moment().isBefore(item.event.end))) and
            (if item.specialClass then (u.stats.class is item.specialClass) else true)

      if item.mystery
        item.canOwn = (u)-> u.items.gear.owned[key]?

      api.gear.flat[key] = item

###
  ---------------------------------------------------------------
  Potion
  ---------------------------------------------------------------
###

api.potion = type: 'potion', text: (-> i18n.t('potionText')), notes: (-> i18n.t('potionNotes')), value: 25, key: 'potion'

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
      text: (-> i18n.t('spellWizardFireballText'))
      mana: 10
      lvl: 11
      target: 'task'
      notes: (-> i18n.t('spellWizardFireballNotes'))
      cast: (user, target) ->
        # I seriously have no idea what I'm doing here. I'm just mashing buttons until numbers seem right-ish. Anyone know math?
        bonus = user._statsComputed.int * user.fns.crit('per')
        target.value += diminishingReturns(bonus*.02, 4)
        bonus *= Math.ceil ((if target.value < 0 then 1 else target.value+1) *.075)
        #console.log {bonus, expBonus:bonus,upBonus:bonus*.1}
        user.stats.exp += diminishingReturns(bonus,75)
        user.party.quest.progress.up += diminishingReturns(bonus*.1,50,30) if user.party.quest.key

    mpheal:
      text: (-> i18n.t('spellWizardMPHealText'))
      mana: 30
      lvl: 12
      target: 'party'
      notes: (-> i18n.t('spellWizardMPHealNotes')),
      cast: (user, target)->
        _.each target, (member) ->
          bonus = Math.ceil(user._statsComputed.int * .1)
          bonus = 25 if bonus > 25 #prevent ability to replenish own mp infinitely
          member.stats.mp += bonus

    earth:
      text: (-> i18n.t('spellWizardEarthText'))
      mana: 35
      lvl: 13
      target: 'party'
      notes: (-> i18n.t('spellWizardEarthNotes')),
      cast: (user, target) ->
        _.each target, (member) ->
          member.stats.buffs.int ?= 0
          member.stats.buffs.int += Math.ceil(user._statsComputed.int * .05)

    frost:
      text: (-> i18n.t('spellWizardFrostText')),
      mana: 40
      lvl: 14
      target: 'self'
      notes: (-> i18n.t('spellWizardFrostNotes')),
      cast: (user, target) ->
        user.stats.buffs.streaks = true

  warrior:
    smash:
      text: (-> i18n.t('spellWarriorSmashText'))
      mana: 10
      lvl: 11
      target: 'task'
      notes: (-> i18n.t('spellWarriorSmashNotes'))
      cast: (user, target) ->
        target.value += 2.5 * (user._statsComputed.str / (user._statsComputed.str + 50)) * user.fns.crit('con')
        user.party.quest.progress.up += Math.ceil(user._statsComputed.str * .2) if user.party.quest.key
    defensiveStance:
      text: (-> i18n.t('spellWarriorDefensiveStanceText'))
      mana: 25
      lvl: 12
      target: 'self'
      notes: (-> i18n.t('spellWarriorDefensiveStanceNotes'))
      cast: (user, target) ->
        user.stats.buffs.con ?= 0
        user.stats.buffs.con += Math.ceil(user._statsComputed.con * .05)
    valorousPresence:
      text: (-> i18n.t('spellWarriorValorousPresenceText'))
      mana: 20
      lvl: 13
      target: 'party'
      notes: (-> i18n.t('spellWarriorValorousPresenceNotes'))
      cast: (user, target) ->
        _.each target, (member) ->
          member.stats.buffs.str ?= 0
          member.stats.buffs.str += Math.ceil(user._statsComputed.str * .05)
    intimidate:
      text: (-> i18n.t('spellWarriorIntimidateText'))
      mana: 15
      lvl: 14
      target: 'party'
      notes: (-> i18n.t('spellWarriorIntimidateNotes'))
      cast: (user, target) ->
        _.each target, (member) ->
          member.stats.buffs.con ?= 0
          member.stats.buffs.con += Math.ceil(user._statsComputed.con *  .03)

  rogue:
    pickPocket:
      text: (-> i18n.t('spellRoguePickPocketText'))
      mana: 10
      lvl: 11
      target: 'task'
      notes: (-> i18n.t('spellRoguePickPocketNotes'))
      cast: (user, target) ->
        bonus = (if target.value < 0 then 1 else target.value+2) + (user._statsComputed.per * 0.5)
        user.stats.gp += 25 * (bonus / (bonus + 75))
    backStab:
      text: (-> i18n.t('spellRogueBackStabText'))
      mana: 15
      lvl: 12
      target: 'task'
      notes: (-> i18n.t('spellRogueBackStabNotes'))
      cast: (user, target) ->
        _crit = user.fns.crit('str', .3)
        target.value += _crit * .03
        bonus =  (if target.value < 0 then 1 else target.value+1) * _crit
        user.stats.exp += bonus
        user.stats.gp += bonus
        # user.party.quest.progress.up += bonus if user.party.quest.key # remove hurting bosses for rogues, seems OP for now
    toolsOfTrade:
      text: (-> i18n.t('spellRogueToolsOfTradeText'))
      mana: 25
      lvl: 13
      target: 'party'
      notes: (-> i18n.t('spellRogueToolsOfTradeNotes'))
      cast: (user, target) ->
        ## lasts 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.per ?= 0
          member.stats.buffs.per += Math.ceil(user._statsComputed.per * .03)
    stealth:
      text: (-> i18n.t('spellRogueStealthText'))
      mana: 45
      lvl: 14
      target: 'self'
      notes: (-> i18n.t('spellRogueStealthNotes'))
      cast: (user, target) ->
        user.stats.buffs.stealth ?= 0
        ## scales to user's # of dailies; maxes out at 100% at 100 per ##
        user.stats.buffs.stealth += Math.ceil(user.dailys.length * user._statsComputed.per / 100)

  healer:
    heal:
      text: (-> i18n.t('spellHealerHealText'))
      mana: 15
      lvl: 11
      target: 'self'
      notes: (-> i18n.t('spellHealerHealNotes'))
      cast: (user, target) ->
        user.stats.hp += (user._statsComputed.con + user._statsComputed.int + 5) * .075
        user.stats.hp = 50 if user.stats.hp > 50
    brightness:
      text: (-> i18n.t('spellHealerBrightnessText'))
      mana: 15
      lvl: 12
      target: 'self'
      notes: (-> i18n.t('spellHealerBrightnessNotes'))
      cast: (user, target) ->
        _.each user.tasks, (target) ->
          return if target.type is 'reward'
          target.value += 1.5 * (user._statsComputed.int / (user._statsComputed.int + 40))
    protectAura:
      text: (-> i18n.t('spellHealerProtectAuraText'))
      mana: 30
      lvl: 13
      target: 'party'
      notes: (-> i18n.t('spellHealerProtectAuraNotes'))
      cast: (user, target) ->
        ## lasts 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.con ?= 0
          member.stats.buffs.con += Math.ceil(user._statsComputed.con * .15)
    heallAll:
      text: (-> i18n.t('spellHealerHealAllText'))
      mana: 25
      lvl: 14
      target: 'party'
      notes: (-> i18n.t('spellHealerHealAllNotes'))
      cast: (user, target) ->
        _.each target, (member) ->
          member.stats.hp += (user._statsComputed.con + user._statsComputed.int + 5) * .04
          member.stats.hp = 50 if member.stats.hp > 50

  special:
    snowball:
      text: (-> i18n.t('spellSpecialSnowballText'))
      mana: 0
      value: 1
      target: 'user'
      notes: (-> i18n.t('spellSpecialSnowballNotes'))
      cast: (user, target) ->
        target.stats.buffs.snowball = true
        target.achievements.snowball ?= 0
        target.achievements.snowball++
        user.items.special.snowball--

    salt:
      text: (-> i18n.t('spellSpecialSaltText'))
      mana: 0
      value: 5
      target: 'self'
      notes: (-> i18n.t('spellSpecialSaltNotes'))
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
  Wolf:             text: (-> i18n.t('dropEggWolfText')), adjective: (-> i18n.t('dropEggWolfAdjective'))
  TigerCub:         text: (-> i18n.t('dropEggTigerCubText')), mountText: (-> i18n.t('dropEggTigerCubMountText')), adjective: (-> i18n.t('dropEggTigerCubAdjective'))
  PandaCub:         text: (-> i18n.t('dropEggPandaCubText')), mountText: (-> i18n.t('dropEggPandaCubMountText')), adjective: (-> i18n.t('dropEggPandaCubAdjective'))
  LionCub:          text: (-> i18n.t('dropEggLionCubText')),  mountText: (-> i18n.t('dropEggLionCubMountText')), adjective: (-> i18n.t('dropEggLionCubAdjective'))
  Fox:              text: (-> i18n.t('dropEggFoxText')), adjective: (-> i18n.t('dropEggFoxAdjective'))
  FlyingPig:        text: (-> i18n.t('dropEggFlyingPigText')), adjective: (-> i18n.t('dropEggFlyingPigAdjective'))
  Dragon:           text: (-> i18n.t('dropEggDragonText')), adjective: (-> i18n.t('dropEggDragonAdjective'))
  Cactus:           text: (-> i18n.t('dropEggCactusText')), adjective: (-> i18n.t('dropEggCactusAdjective'))
  BearCub:          text: (-> i18n.t('dropEggBearCubText')),  mountText: (-> i18n.t('dropEggBearCubMountText')), adjective: (-> i18n.t('dropEggBearCubAdjective'))
_.each api.dropEggs, (egg,key) ->
  _.defaults egg,
    canBuy:true
    value: 3
    key: key
    notes: (-> i18n.t('eggNotes', {eggText: egg.text(), eggAdjective: egg.adjective()}))
    mountText: egg.text

api.questEggs =
  # value & other defaults set below
  Gryphon:          text: (-> i18n.t('questEggGryphonText')),  adjective: (-> i18n.t('questEggGryphonAdjective')), canBuy: false
  Hedgehog:         text: (-> i18n.t('questEggHedgehogText')), adjective: (-> i18n.t('questEggHedgehogAdjective')), canBuy: false
  Deer:             text: 'Deer',     adjective: 'elegant', canBuy: false
  Egg:              text: 'Egg',     adjective: 'colorful', canBuy: false
_.each api.questEggs, (egg,key) ->
  _.defaults egg,
    canBuy:false
    value: 3
    key: key
    notes: (-> i18n.t('eggNotes', {eggText: egg.text(), eggAdjective: egg.adjective()}))
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
  Base:             value: 2, text: (-> i18n.t('hatchingPotionBase'))
  White:            value: 2, text: (-> i18n.t('hatchingPotionWhite'))
  Desert:           value: 2, text: (-> i18n.t('hatchingPotionDesert'))
  Red:              value: 3, text: (-> i18n.t('hatchingPotionRed'))
  Shade:            value: 3, text: (-> i18n.t('hatchingPotionShade'))
  Skeleton:         value: 3, text: (-> i18n.t('hatchingPotionSkeleton'))
  Zombie:           value: 4, text: (-> i18n.t('hatchingPotionZombie'))
  CottonCandyPink:  value: 4, text: (-> i18n.t('hatchingPotionCottonCandyPink'))
  CottonCandyBlue:  value: 4, text: (-> i18n.t('hatchingPotionCottonCandyBlue'))
  Golden:           value: 5, text: (-> i18n.t('hatchingPotionGolden'))
_.each api.hatchingPotions, (pot,key) ->
  _.defaults pot, {key, value: 2, notes: (-> i18n.t('hatchingPotionNotes', {potText: pot.text()}))}

api.pets = _.transform api.dropEggs, (m, egg) ->
  _.defaults m, _.transform api.hatchingPotions, (m2, pot) ->
    m2[egg.key + "-" + pot.key] = true

api.questPets = _.transform api.questEggs, (m, egg) ->
  _.defaults m, _.transform api.hatchingPotions, (m2, pot) ->
    m2[egg.key + "-" + pot.key] = true

api.food =
  Meat:             text: (-> i18n.t('foodMeat')), target: 'Base', article: ''
  Milk:             text: (-> i18n.t('foodMilk')), target: 'White', article: ''
  Potatoe:          text: (-> i18n.t('foodPotatoe')), target: 'Desert', article: 'a '
  Strawberry:       text: (-> i18n.t('foodStrawberry')), target: 'Red', article: 'a '
  Chocolate:        text: (-> i18n.t('foodChocolate')), target: 'Shade', article: ''
  Fish:             text: (-> i18n.t('foodFish')), target: 'Skeleton', article: 'a '
  RottenMeat:       text: (-> i18n.t('foodRottenMeat')), target: 'Zombie', article: ''
  CottonCandyPink:  text: (-> i18n.t('foodCottonCandyPink')), target: 'CottonCandyPink', article: ''
  CottonCandyBlue:  text: (-> i18n.t('foodCottonCandyBlue')), target: 'CottonCandyBlue', article: ''
  # FIXME what to do with these extra items? Should we add "targets" (plural) for food instead of singular, so we don't have awkward extras?
  #Cheese:           text: 'Cheese', target: 'Golden'
  #Watermelon:       text: 'Watermelon', target: 'Golden'
  #SeaWeed:          text: 'SeaWeed', target: 'Golden'

  Cake_Skeleton:        canBuy: false, text: (-> i18n.t('foodCakeSkeleton')), target: 'Skeleton', article: ''
  Cake_Base:            canBuy: false, text: (-> i18n.t('foodCakeBase')), target: 'Base', article: ''
  Cake_CottonCandyBlue: canBuy: false, text: (-> i18n.t('foodCakeCottonCandyBlue')), target: 'CottonCandyBlue', article: ''
  Cake_CottonCandyPink: canBuy: false, text: (-> i18n.t('foodCakeCottonCandyPink')), target: 'CottonCandyPink', article: ''
  Cake_Shade:           canBuy: false, text: (-> i18n.t('foodCakeShade')), target: 'Shade', article: ''
  Cake_White:           canBuy: false, text: (-> i18n.t('foodCakeWhite')), target: 'White', article: ''
  Cake_Golden:          canBuy: false, text: (-> i18n.t('foodCakeGolden')), target: 'Golden', article: ''
  Cake_Zombie:          canBuy: false, text: (-> i18n.t('foodCakeZombie')), target: 'Zombie', article: ''
  Cake_Desert:          canBuy: false, text: (-> i18n.t('foodCakeDesert')), target: 'Desert', article: ''
  Cake_Red:             canBuy: false, text: (-> i18n.t('foodCakeRed')), target: 'Red', article: ''

  # Tests hack, put honey last so the faux random picks it up in unit tests
  Honey:            text: (-> i18n.t('foodHoney')), target: 'Golden', article: ''

  Saddle:           text: (-> i18n.t('foodSaddleText')), value: 5, notes: (-> i18n.t('foodSaddleNotes'))
_.each api.food, (food,key) ->
  _.defaults food, {value: 1, key, notes: (-> i18n.t('foodNotes')), canBuy:true}

api.quests =

  evilsanta:
    canBuy:false
    text: (-> i18n.t('questEvilSantaText')) # title of the quest (eg, Deep into Vice's Layer)
    notes: (-> i18n.t('questEvilSantaNotes'))
    completion: (-> i18n.t('questEvilSantaCompletion'))
    value: 4 # Gem cost to buy, GP sell-back
    #mechanic: enum['perfectDailies', ...]
    boss:
      name: (-> i18n.t('questEvilSantaBoss')) # name of the boss himself (eg, Vice)
      hp: 300
      str: 1 # Multiplier of users' missed dailies
    drop:
      items: [
        {type: 'mounts', key: 'BearCub-Polar', text: (-> i18n.t('questEvilSantaDropBearCubPolarMount'))}
      ]
      gp: 20
      exp: 100 # Exp bonus from defeating the boss

  evilsanta2:
    canBuy:false
    text: (-> i18n.t('questEvilSanta2Text'))
    notes: (-> i18n.t('questEvilSanta2Notes'))
    completion: (-> i18n.t('questEvilSanta2Completion'))
    value: 4
    previous: 'evilsanta'
    collect:
      tracks: text: (-> i18n.t('questEvilSanta2CollectTracks')), count: 20
      branches: text: (-> i18n.t('questEvilSanta2CollectBranches')), count: 10
    drop:
      items: [
        {type: 'pets', key: 'BearCub-Polar', text: (-> i18n.t('questEvilSanta2DropBearCubPolarPet'))}
      ]
      gp: 20
      exp: 100

  gryphon:
    text: (-> i18n.t('questGryphonText'))
    notes: (-> i18n.t('questGryphonNotes'))
    completion: (-> i18n.t('questGryphonCompletion'))
    value: 4 # Gem cost to buy, GP sell-back
    boss:
      name: (-> i18n.t('questGryphonBoss')) # name of the boss himself (eg, Vice)
      hp: 300
      str: 1.5 # Multiplier of users' missed dailies
    drop:
      items: [
        {type: 'eggs', key: 'Gryphon', text: (-> i18n.t('questGryphonDropGryphonEgg'))}
        {type: 'eggs', key: 'Gryphon', text: (-> i18n.t('questGryphonDropGryphonEgg'))}
        {type: 'eggs', key: 'Gryphon', text: (-> i18n.t('questGryphonDropGryphonEgg'))}
      ]
      gp: 25
      exp: 125
      
  hedgehog:
    text: (-> i18n.t('questHedgehogText'))
    notes: (-> i18n.t('questHedgehogNotes'))
    completion: (-> i18n.t('questHedgehogCompletion'))
    value: 4 # Gem cost to buy, GP sell-back
    boss:
      name: (-> i18n.t('questHedgehogBoss')) # name of the boss himself (eg, Vice)
      hp: 400
      str: 1.25 # Multiplier of users' missed dailies
    drop:
      items: [
        {type: 'eggs', key: 'Hedgehog', text: (-> i18n.t('questHedgehogDropGryphonEgg'))}
        {type: 'eggs', key: 'Hedgehog', text: (-> i18n.t('questHedgehogDropGryphonEgg'))}
        {type: 'eggs', key: 'Hedgehog', text: (-> i18n.t('questHedgehogDropGryphonEgg'))}
      ]
      gp: 30
      exp: 125


  ghost_stag:
    text: "The Spirit of Spring"
    notes: "Ahh, Spring. The time of year when color once again begins to fill the landscape. Gone are the cold, snowy mounds of winter. Where frost once stood, vibrant plant life takes its place. Luscious green leaves fill in the trees, grass returns to its former vivid hue, a rainbow of flowers rise along the plains, and a white mystical fog covers the land! ... Wait. Mystical fog? \"Oh no,\" <strong>Inventrix</strong> says apprehensively, \"It would appear that some kind of spirit is the cause of this fog. Oh, and it is charging right at you.\""
    completion: "The spirit, seemingly unwounded, lowers its nose to the ground. A calming voice envelops your party. \"I apologize for my behavior. I have only just awoken from my slumber, and it would appear my wits have not completely returned to me. Please take these as a token of my apology.\" A cluster of eggs materialize on the grass before the spirit. Without another word, the spirit runs off into the forest with flowers falling in his wake."
    value: 4
    boss:
      name: "Ghost Stag"
      hp: 1200
      str: 2.5
    drop:
      items: [
        {type: 'eggs', key: 'Deer', text: "Deer (Egg)"}
        {type: 'eggs', key: 'Deer', text: "Deer (Egg)"}
        {type: 'eggs', key: 'Deer', text: "Deer (Egg)"}
      ]
      gp: 80
      exp: 800


  vice1:
    text: (-> i18n.t('questVice1Text'))
    notes: (-> i18n.t('questVice1Notes'))
    value: 4
    lvl: 30
    boss:
      name: (-> i18n.t('questVice1Boss'))
      hp: 750
      str: 1.5
    drop:
      items: [
        {type: 'quests', key: "vice2", text: (-> i18n.t('questVice1DropVice2Quest'))}
      ]
      gp: 20
      exp: 100

  vice2:
    text: (-> i18n.t('questVice2Text'))
    notes: (-> i18n.t('questVice2Notes'))
    value: 4
    lvl: 35
    previous: 'vice1'
    collect:
      lightCrystal: text: (-> i18n.t('questVice2CollectLightCrystal')), count: 45
    drop:
      items: [
        {type: 'quests', key: 'vice3', text: (-> i18n.t('questVice2DropVice3Quest'))}
      ]
      gp: 20
      exp: 75

  vice3:
    text: (-> i18n.t('questVice3Text'))
    notes: (-> i18n.t('questVice3Notes'))
    completion: (-> i18n.t('questVice3Completion'))
    previous: 'vice2'
    value: 4
    lvl: 40
    boss:
      name: (-> i18n.t('questVice3Boss'))
      hp: 1500
      str: 3
    drop:
      items: [
        {type: 'gear', key: "weapon_special_2", text: (-> i18n.t('questVice3DropWeaponSpecial2'))}
        {type: 'eggs', key: 'Dragon', text: (-> i18n.t('questVice3DropDragonEgg'))}
        {type: 'eggs', key: 'Dragon', text: (-> i18n.t('questVice3DropDragonEgg'))}
        {type: 'hatchingPotions', key: 'Shade', text: (-> i18n.t('questVice3DropShadeHatchingPotion'))}
        {type: 'hatchingPotions', key: 'Shade', text: (-> i18n.t('questVice3DropShadeHatchingPotion'))}
      ]
      gp: 100
      exp: 1000

  egg:
    text: "Egg Hunt"
    notes: "Overnight, strange plain eggs have appeared everywhere: in Matt's stables, behind the counter at the Tavern, and even among the pet eggs at the Marketplace! What a nuisance! \"Nobody knows where they came from, or what they might hatch into,\" says <strong>Megan</strong>, \"but we can't just leave them laying around! Work hard and search hard to help me gather up these mysterious eggs. Maybe if you collect enough, there will be some extras left over for you...\""
    completion: "You did it! In gratitude, <strong>Megan</strong> gives you ten of the eggs. \"I don't think they hatch, exactly,\" she says, \"and they certainly won't grow into mounts. But that doesn't mean you can't dye them beautiful colors!\""
    value: 1
    canBuy: false
    collect:
      plainEgg: text: 'Plain Egg', count: 100
    drop:
      items: [
        {type: 'eggs', key: 'Egg', text: "Plain Egg"}
        {type: 'eggs', key: 'Egg', text: "Plain Egg"}
        {type: 'eggs', key: 'Egg', text: "Plain Egg"}
        {type: 'eggs', key: 'Egg', text: "Plain Egg"}
        {type: 'eggs', key: 'Egg', text: "Plain Egg"}
        {type: 'eggs', key: 'Egg', text: "Plain Egg"}
        {type: 'eggs', key: 'Egg', text: "Plain Egg"}
        {type: 'eggs', key: 'Egg', text: "Plain Egg"}
        {type: 'eggs', key: 'Egg', text: "Plain Egg"}
        {type: 'eggs', key: 'Egg', text: "Plain Egg"}
      ]
      gp: 0
      exp: 0


_.each api.quests, (v,key) ->
  _.defaults v, {key,canBuy:true}

repeat = {m:true,t:true,w:true,th:true,f:true,s:true,su:true}
api.userDefaults =
  habits: [
    {type: 'habit', text: (-> i18n.t('defaultHabit1Text')), notes: (-> i18n.t('defaultHabit1Notes')), value: 0, up: true, down: false, attribute: 'per' }
    {type: 'habit', text: (-> i18n.t('defaultHabit2Text')), notes: (-> i18n.t('defaultHabit2Notes')), value: 0, up: false, down: true, attribute: 'con'}
    {type: 'habit', text: (-> i18n.t('defaultHabit3Text')), notes: (-> i18n.t('defaultHabit3Notes')), value: 0, up: true, down: true, attribute: 'str'}
  ]

  dailys: [
    {type: 'daily', text: (-> i18n.t('defaultDaily1Text')), notes: (-> i18n.t('defaultDaily1Notes')), value: 0, completed: false, repeat: repeat, attribute: 'per' }
    {type: 'daily', text: (-> i18n.t('defaultDaily2Text')), notes: (-> i18n.t('defaultDaily2Notes')), value: 3, completed: false, repeat: repeat, attribute: 'str' }
    {type: 'daily', text: (-> i18n.t('defaultDaily3Text')), notes: (-> i18n.t('defaultDaily3Notes')), value: -10, completed: false, repeat: repeat, attribute: 'int' }
  ]

  todos: [
    {type: 'todo', text: (-> i18n.t('defaultTodo1Text')), notes: (-> i18n.t('defaultTodo1Notes')), value: -3, completed: false, attribute: 'per' }
  ]

  rewards: [
    {type: 'reward', text: (-> i18n.t('defaultReward1Text')), notes: (-> i18n.t('defaultReward1Notes')), value: 20 }
    {type: 'reward', text: (-> i18n.t('defaultReward2Text')), notes: (-> i18n.t('defaultReward2Notes')), value: 10 }
  ]

  tags: [
    {name: (-> i18n.t('defaultTag1'))}
    {name: (-> i18n.t('defaultTag2'))}
    {name: (-> i18n.t('defaultTag3'))}
  ]
