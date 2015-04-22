_ = require 'lodash'
api = module.exports
moment = require 'moment'
i18n = require './i18n.coffee'
t = (string, vars) ->
  func = (lang) ->
    vars ?= {a: 'a'}
    i18n.t(string, vars, lang)
  func.i18nLangFunc = true #Trick to recognize this type of function
  func

###
  ---------------------------------------------------------------
  Gear (Weapons, Armor, Head, Shield)
  Item definitions: {index, text, notes, value, str, def, int, per, classes, type}
  ---------------------------------------------------------------
###

classes = ['warrior', 'rogue', 'healer', 'wizard']
gearTypes = [ 'weapon', 'armor', 'head', 'shield', 'body', 'back', 'headAccessory', 'eyewear']

events =
  winter: {start:'2013-12-31',end:'2014-02-01'}
  birthday: {start:'2013-01-30',end:'2014-02-01'}
  spring: {start:'2014-03-21',end:'2014-05-01'}
  summer: {start:'2014-06-20',end:'2014-08-01'}
  gaymerx: {start:'2014-07-02',end:'2014-08-01'}
  fall: {start:'2014-09-21',end:'2014-11-01'}
  winter2015: {start:'2014-12-21',end:'2015-02-02'}
  spring2015: {start:'2015-03-20',end:'2015-05-02'}
# IMPORTANT: The end date should be one to two days AFTER the actual end of
# the event, to allow people in different timezones to still buy the
# event gear up until at least the actual end of the event.

api.mystery =
  201402: {start:'2014-02-22',end:'2014-02-28', text:'Winged Messenger Set'}
  201403: {start:'2014-03-24',end:'2014-04-02', text:'Forest Walker Set'}
  201404: {start:'2014-04-24',end:'2014-05-02', text:'Twilight Butterfly Set'}
  201405: {start:'2014-05-21',end:'2014-06-02', text:'Flame Wielder Set'}
  201406: {start:'2014-06-23',end:'2014-07-02', text:'Octomage Set'}
  201407: {start:'2014-07-23',end:'2014-08-02', text:'Undersea Explorer Set'}
  201408: {start:'2014-08-23',end:'2014-09-02', text:'Sun Sorcerer Set'}
  201409: {start:'2014-09-24',end:'2014-10-02', text:'Autumn Strider Set'}
  201410: {start:'2014-10-24',end:'2014-11-02', text:'Winged Goblin Set'}
  201411: {start:'2014-11-24',end:'2014-12-02', text:'Feast and Fun Set'}
  201412: {start:'2014-12-25',end:'2015-01-02', text:'Penguin Set'}
  201501: {start:'2015-01-26',end:'2015-02-02', text:'Starry Knight Set'}
  201502: {start:'2015-02-24',end:'2015-03-02', text:'Winged Enchanter Set'}
  201503: {start:'2015-03-25',end:'2015-04-02', text:'Aquamarine Set'}
  201504: {start:'2015-04-24',end:'2015-05-02', text:'Busy Bee Set'}
  301404: {start:'3014-03-24',end:'3014-04-02', text:'Steampunk Standard Set'}
  301405: {start:'3014-04-24',end:'3014-05-02', text:'Steampunk Accessories Set'}
  wondercon: {start:'2014-03-24',end:'2014-04-01'} # not really, but the mechanic works
_.each api.mystery, (v,k)->v.key = k

gear =
  weapon:
    base:
      0:
        text: t('weaponBase0Text'), notes: t('weaponBase0Notes'), value:0
    warrior:
      0: text: t('weaponWarrior0Text'), notes: t('weaponWarrior0Notes'), value:1
      1: text: t('weaponWarrior1Text'), notes: t('weaponWarrior1Notes', {str: 3}), str: 3, value:20
      2: text: t('weaponWarrior2Text'), notes: t('weaponWarrior2Notes', {str: 6}), str: 6, value:30
      3: text: t('weaponWarrior3Text'), notes: t('weaponWarrior3Notes', {str: 9}), str: 9, value:45
      4: text: t('weaponWarrior4Text'), notes: t('weaponWarrior4Notes', {str: 12}), str: 12, value:65
      5: text: t('weaponWarrior5Text'), notes: t('weaponWarrior5Notes', {str: 15}), str: 15, value:90
      6: text: t('weaponWarrior6Text'), notes: t('weaponWarrior6Notes', {str: 18}), str: 18, value:120, last: true
    rogue:
      #Not using bows at the moment, but they would be easy to add back in to an advanced Armory feature, as Quest drops, etc.
      #0: twoHanded: true, text: "Practice Bow", notes:'Training weapon. Confers no benefit.', value:0
      #1: twoHanded: true, text: "Short Bow", notes:'Simple bow best at close ranges. Increases STR by 2.', str: 2, value:20
      #2: twoHanded: true, text: "Long Bow", notes:'Bow with a strong draw for extra distance. Increases STR by 5.', str: 5, value:50
      #3: twoHanded: true, text: "Recurve Bow", notes:'Built with advanced techniques. Increases STR by 8.', str: 8, value:80
      #4: twoHanded: true, text: "Icicle Bow", notes:'Fires arrows of piercing cold. Increases STR by 12.', str: 12, value:120
      #5: twoHanded: true, text: "Meteor Bow", notes:'Rains flame upon your foes. Increases STR by 16.', str: 16, value:160
      #6: twoHanded: true, text: "Golden Bow", notes:'As swift as sunlight and as sharp as lightning. Increases STR by 20.', str: 20, value:200, last: true
      0: text: t('weaponRogue0Text'), notes: t('weaponRogue0Notes'), str: 0, value: 0
      1: text: t('weaponRogue1Text'), notes: t('weaponRogue1Notes', {str: 2}), str: 2, value: 20
      2: text: t('weaponRogue2Text'), notes: t('weaponRogue2Notes', {str: 3}), str: 3, value: 35
      3: text: t('weaponRogue3Text'), notes: t('weaponRogue3Notes', {str: 4}), str: 4, value: 50
      4: text: t('weaponRogue4Text'), notes: t('weaponRogue4Notes', {str: 6}), str: 6, value: 70
      5: text: t('weaponRogue5Text'), notes: t('weaponRogue5Notes', {str: 8}), str: 8, value: 90
      6: text: t('weaponRogue6Text'), notes: t('weaponRogue6Notes', {str: 10}), str: 10, value: 120, last: true
    wizard:
      0: twoHanded: true, text: t('weaponWizard0Text'), notes: t('weaponWizard0Notes'), value:0
      1: twoHanded: true, text: t('weaponWizard1Text'), notes: t('weaponWizard1Notes', {int: 3, per: 1}), int: 3, per: 1, value:30
      2: twoHanded: true, text: t('weaponWizard2Text'), notes: t('weaponWizard2Notes', {int: 6, per: 2}), int: 6, per: 2, value:50
      3: twoHanded: true, text: t('weaponWizard3Text'), notes: t('weaponWizard3Notes', {int: 9, per: 3}), int: 9, per: 3, value:80
      4: twoHanded: true, text: t('weaponWizard4Text'), notes: t('weaponWizard4Notes', {int: 12, per: 5}), int:12, per: 5, value:120
      5: twoHanded: true, text: t('weaponWizard5Text'), notes: t('weaponWizard5Notes', {int: 15, per: 7}), int: 15, per: 7, value:160
      6: twoHanded: true, text: t('weaponWizard6Text'), notes: t('weaponWizard6Notes', {int: 18, per: 10}), int: 18, per: 10, value:200, last: true
    healer:
      0: text: t('weaponHealer0Text'), notes: t('weaponHealer0Notes'), value:0
      1: text: t('weaponHealer1Text'), notes: t('weaponHealer1Notes', {int: 2}), int: 2, value:20
      2: text: t('weaponHealer2Text'), notes: t('weaponHealer2Notes', {int: 3}), int: 3, value:30
      3: text: t('weaponHealer3Text'), notes: t('weaponHealer3Notes', {int: 5}), int: 5, value:45
      4: text: t('weaponHealer4Text'), notes: t('weaponHealer4Notes', {int: 7}), int:7, value:65
      5: text: t('weaponHealer5Text'), notes: t('weaponHealer5Notes', {int: 9}), int: 9, value:90
      6: text: t('weaponHealer6Text'), notes: t('weaponHealer6Notes', {int: 11}), int: 11, value:120, last: true
    special:
      0: text: t('weaponSpecial0Text'), notes: t('weaponSpecial0Notes', {str: 20}), str: 20, value:150, canOwn: ((u)-> +u.backer?.tier >= 70)
      1: text: t('weaponSpecial1Text'), notes: t('weaponSpecial1Notes', {attrs: 6}), str: 6, per: 6, con: 6, int: 6, value:170, canOwn: ((u)-> +u.contributor?.level >= 4)
      2: text: t('weaponSpecial2Text'), notes: t('weaponSpecial2Notes', {attrs: 25}), str: 25, per: 25, value:200, canOwn: ((u)-> (+u.backer?.tier >= 300) or u.items.gear.owned.weapon_special_2?)
      3: text: t('weaponSpecial3Text'), notes: t('weaponSpecial3Notes', {attrs: 17}), str: 17, int: 17, con: 17, value:200, canOwn: ((u)-> (+u.backer?.tier >= 300) or u.items.gear.owned.weapon_special_3?)
      critical: text: t('weaponSpecialCriticalText'), notes: t('weaponSpecialCriticalNotes', {attrs: 40}), str: 40, per: 40, value:200, canOwn: ((u)-> !!u.contributor?.critical)
      # Winter event gear
      yeti:       event: events.winter, specialClass: 'warrior', text: t('weaponSpecialYetiText'), notes: t('weaponSpecialYetiNotes', {str: 15}), str: 15, value:90
      ski:        event: events.winter, specialClass: 'rogue', text: t('weaponSpecialSkiText'), notes: t('weaponSpecialSkiNotes', {str: 8}), str: 8, value: 90
      candycane:  event: events.winter, specialClass: 'wizard', twoHanded: true, text: t('weaponSpecialCandycaneText'), notes: t('weaponSpecialCandycaneNotes', {int: 15, per: 7}), int: 15, per: 7, value:160
      snowflake:  event: events.winter, specialClass: 'healer', text: t('weaponSpecialSnowflakeText'), notes: t('weaponSpecialSnowflakeNotes', {int: 9}), int: 9, value:90
      #Spring Fling
      springRogue:    event: events.spring, specialClass: 'rogue',   text: t('weaponSpecialSpringRogueText'), notes: t('weaponSpecialSpringRogueNotes', {str: 8}), value: 80, str: 8
      springWarrior:  event: events.spring, specialClass: 'warrior', text: t('weaponSpecialSpringWarriorText'), notes: t('weaponSpecialSpringWarriorNotes', {str: 15}), value: 90, str: 15
      springMage:     event: events.spring, specialClass: 'wizard',  twoHanded:true, text: t('weaponSpecialSpringMageText'), notes: t('weaponSpecialSpringMageNotes', {int: 15, per: 7}), value: 160, int:15, per:7
      springHealer:   event: events.spring, specialClass: 'healer',  text: t('weaponSpecialSpringHealerText'), notes: t('weaponSpecialSpringHealerNotes', {int: 9}), value: 90, int: 9
      #Summer
      summerRogue:    event: events.summer, specialClass: 'rogue',   text: t('weaponSpecialSummerRogueText'), notes: t('weaponSpecialSummerRogueNotes', {str: 8}), value: 80, str: 8
      summerWarrior:  event: events.summer, specialClass: 'warrior', text: t('weaponSpecialSummerWarriorText'), notes: t('weaponSpecialSummerWarriorNotes', {str: 15}), value: 90, str: 15
      summerMage:     event: events.summer, specialClass: 'wizard',  twoHanded:true, text: t('weaponSpecialSummerMageText'), notes: t('weaponSpecialSummerMageNotes', {int: 15, per: 7}), value: 160, int:15, per:7
      summerHealer:   event: events.summer, specialClass: 'healer',  text: t('weaponSpecialSummerHealerText'), notes: t('weaponSpecialSummerHealerNotes', {int: 9}), value: 90, int: 9
      #Fall
      fallRogue:    event: events.fall, specialClass: 'rogue',   text: t('weaponSpecialFallRogueText'), notes: t('weaponSpecialFallRogueNotes', {str: 8}), value: 80, str: 8
      fallWarrior:  event: events.fall, specialClass: 'warrior', text: t('weaponSpecialFallWarriorText'), notes: t('weaponSpecialFallWarriorNotes', {str: 15}), value: 90, str: 15
      fallMage:     event: events.fall, specialClass: 'wizard',  twoHanded:true, text: t('weaponSpecialFallMageText'), notes: t('weaponSpecialFallMageNotes', {int: 15, per: 7}), value: 160, int:15, per:7
      fallHealer:   event: events.fall, specialClass: 'healer',  text: t('weaponSpecialFallHealerText'), notes: t('weaponSpecialFallHealerNotes', {int: 9}), value: 90, int: 9
      # Winter 2015
      winter2015Rogue:    event: events.winter2015, specialClass: 'rogue', text: t('weaponSpecialWinter2015RogueText'), notes: t('weaponSpecialWinter2015RogueNotes', {str: 8}), value: 80, str: 8
      winter2015Warrior:  event: events.winter2015, specialClass: 'warrior', text: t('weaponSpecialWinter2015WarriorText'), notes: t('weaponSpecialWinter2015WarriorNotes', {str: 15}), value: 90, str: 15
      winter2015Mage:     event: events.winter2015, specialClass: 'wizard',  twoHanded:true, text: t('weaponSpecialWinter2015MageText'), notes: t('weaponSpecialWinter2015MageNotes', {int: 15, per: 7}), value: 160, int:15, per:7
      winter2015Healer:   event: events.winter2015, specialClass: 'healer',  text: t('weaponSpecialWinter2015HealerText'), notes: t('weaponSpecialWinter2015HealerNotes', {int: 9}), value: 90, int: 9
      # Spring 2015
      spring2015Rogue:    event: events.spring2015, specialClass: 'rogue', text: t('weaponSpecialSpring2015RogueText'), notes: t('weaponSpecialSpring2015RogueNotes', {str: 8}), value: 80, str: 8
      spring2015Warrior:  event: events.spring2015, specialClass: 'warrior', text: t('weaponSpecialSpring2015WarriorText'), notes: t('weaponSpecialSpring2015WarriorNotes', {str: 15}), value: 90, str: 15
      spring2015Mage:     event: events.spring2015, specialClass: 'wizard',  twoHanded:true, text: t('weaponSpecialSpring2015MageText'), notes: t('weaponSpecialSpring2015MageNotes', {int: 15, per: 7}), value: 160, int:15, per:7
      spring2015Healer:   event: events.spring2015, specialClass: 'healer',  text: t('weaponSpecialSpring2015HealerText'), notes: t('weaponSpecialSpring2015HealerNotes', {int: 9}), value: 90, int: 9
    mystery:
      201411: text: t('weaponMystery201411Text'), notes: t('weaponMystery201411Notes'), mystery:'201411', value: 0
      201502: text: t('weaponMystery201502Text'), notes: t('weaponMystery201502Notes'), mystery:'201502', value: 0
      301404: text: t('weaponMystery301404Text'), notes: t('weaponMystery301404Notes'), mystery:'301404', value: 0

  armor:
    base:
      0: text: t('armorBase0Text'), notes: t('armorBase0Notes'), value:0
    warrior:
      #0: text: "Plain Clothing", notes:'Ordinary clothing. Confers no benefit.', value:0
      1: text: t('armorWarrior1Text'), notes: t('armorWarrior1Notes', {con: 3}), con: 3, value:30
      2: text: t('armorWarrior2Text'), notes: t('armorWarrior2Notes', {con: 5}), con: 5, value:45
      3: text: t('armorWarrior3Text'), notes: t('armorWarrior3Notes', {con: 7}), con: 7, value:65
      4: text: t('armorWarrior4Text'), notes: t('armorWarrior4Notes', {con: 9}), con: 9, value:90
      5: text: t('armorWarrior5Text'), notes: t('armorWarrior5Notes', {con: 11}), con: 11, value:120, last: true
    rogue:
      #0: text: "Plain Clothing", notes:'Ordinary clothing. Confers no benefit.', value:0
      1: text: t('armorRogue1Text'), notes: t('armorRogue1Notes', {per: 6}), per: 6, value:30
      2: text: t('armorRogue2Text'), notes: t('armorRogue2Notes', {per: 9}), per: 9, value:45
      3: text: t('armorRogue3Text'), notes: t('armorRogue3Notes', {per: 12}), per: 12, value:65
      4: text: t('armorRogue4Text'), notes: t('armorRogue4Notes', {per: 15}), per: 15, value:90
      5: text: t('armorRogue5Text'), notes: t('armorRogue5Notes', {per: 18}), per: 18, value:120, last: true
    wizard:
      #0: text: "Apprentice Garb", notes:'For students of magic. Confers no benefit.', value:0
      1: text: t('armorWizard1Text'), notes: t('armorWizard1Notes', {int: 2}), int: 2, value:30
      2: text: t('armorWizard2Text'), notes: t('armorWizard2Notes', {int: 4}), int: 4, value:45
      3: text: t('armorWizard3Text'), notes: t('armorWizard3Notes', {int: 6}), int: 6, value:65
      4: text: t('armorWizard4Text'), notes: t('armorWizard4Notes', {int: 9}), int: 9, value:90
      5: text: t('armorWizard5Text'), notes: t('armorWizard5Notes', {int: 12}), int: 12, value:120, last: true
    healer:
      #0: text: "Novice Robe", notes:'For healers in training. Confers no benefit.', value:0
      1: text: t('armorHealer1Text'), notes: t('armorHealer1Notes', {con: 6}), con: 6, value:30
      2: text: t('armorHealer2Text'), notes: t('armorHealer2Notes', {con: 9}), con: 9, value:45
      3: text: t('armorHealer3Text'), notes: t('armorHealer3Notes', {con: 12}), con: 12, value:65
      4: text: t('armorHealer4Text'), notes: t('armorHealer4Notes', {con: 15}), con: 15, value:90
      5: text: t('armorHealer5Text'), notes: t('armorHealer5Notes', {con: 18}), con: 18, value:120, last: true
    special:
      0: text: t('armorSpecial0Text'), notes: t('armorSpecial0Notes', {con: 20}), con: 20, value:150, canOwn: ((u)-> +u.backer?.tier >= 45)
      1: text: t('armorSpecial1Text'), notes: t('armorSpecial1Notes', {attrs: 6}), con: 6, str: 6, per: 6, int: 6, value:170, canOwn: ((u)-> +u.contributor?.level >= 2)
      2: text: t('armorSpecial2Text'), notes: t('armorSpecial2Notes', {attrs: 25}), int: 25, con: 25, value:200, canOwn: ((u)-> +u.backer?.tier >= 300 or u.items.gear.owned.armor_special_2?)
      #Winter event
      yeti:       event: events.winter, specialClass: 'warrior', text: t('armorSpecialYetiText'), notes: t('armorSpecialYetiNotes', {con: 9}), con: 9, value:90
      ski:        event: events.winter, specialClass: 'rogue', text: t('armorSpecialSkiText'), notes: t('armorSpecialSkiNotes', {per: 15}), per: 15, value:90
      candycane:  event: events.winter, specialClass: 'wizard', text: t('armorSpecialCandycaneText'), notes: t('armorSpecialCandycaneNotes', {int: 9}), int: 9, value:90
      snowflake:  event: events.winter, specialClass: 'healer', text: t('armorSpecialSnowflakeText'), notes: t('armorSpecialSnowflakeNotes', {con: 15}), con: 15, value:90
      birthday:   event: events.birthday, text: t('armorSpecialBirthdayText'), notes: t('armorSpecialBirthdayNotes'), value: 0
      # Spring Fling
      springRogue:    event: events.spring, specialClass: 'rogue',   text: t('armorSpecialSpringRogueText'), notes: t('armorSpecialSpringRogueNotes', {per: 15}), value: 90, per: 15
      springWarrior:  event: events.spring, specialClass: 'warrior', text: t('armorSpecialSpringWarriorText'), notes: t('armorSpecialSpringWarriorNotes', {con: 9}), value: 90, con: 9
      springMage:     event: events.spring, specialClass: 'wizard',    text: t('armorSpecialSpringMageText'), notes: t('armorSpecialSpringMageNotes', {int: 9}), value: 90, int: 9
      springHealer:   event: events.spring, specialClass: 'healer',  text: t('armorSpecialSpringHealerText'), notes: t('armorSpecialSpringHealerNotes', {con: 15}), value: 90, con: 15
      # Summer
      summerRogue:    event: events.summer, specialClass: 'rogue',   text: t('armorSpecialSummerRogueText'), notes: t('armorSpecialSummerRogueNotes', {per: 15}), value: 90, per: 15
      summerWarrior:  event: events.summer, specialClass: 'warrior', text: t('armorSpecialSummerWarriorText'), notes: t('armorSpecialSummerWarriorNotes', {con: 9}), value: 90, con: 9
      summerMage:     event: events.summer, specialClass: 'wizard',    text: t('armorSpecialSummerMageText'), notes: t('armorSpecialSummerMageNotes', {int: 9}), value: 90, int: 9
      summerHealer:   event: events.summer, specialClass: 'healer',  text: t('armorSpecialSummerHealerText'), notes: t('armorSpecialSummerHealerNotes', {con: 15}), value: 90, con: 15
      # Fall
      fallRogue:    event: events.fall, specialClass: 'rogue',   text: t('armorSpecialFallRogueText'), notes: t('armorSpecialFallRogueNotes', {per: 15}), value: 90, per: 15
      fallWarrior:  event: events.fall, specialClass: 'warrior', text: t('armorSpecialFallWarriorText'), notes: t('armorSpecialFallWarriorNotes', {con: 9}), value: 90, con: 9
      fallMage:     event: events.fall, specialClass: 'wizard',    text: t('armorSpecialFallMageText'), notes: t('armorSpecialFallMageNotes', {int: 9}), value: 90, int: 9
      fallHealer:   event: events.fall, specialClass: 'healer',  text: t('armorSpecialFallHealerText'), notes: t('armorSpecialFallHealerNotes', {con: 15}), value: 90, con: 15
      # Winter 2015
      winter2015Rogue:    event: events.winter2015, specialClass: 'rogue',   text: t('armorSpecialWinter2015RogueText'), notes: t('armorSpecialWinter2015RogueNotes', {per: 15}), value: 90, per: 15
      winter2015Warrior:  event: events.winter2015, specialClass: 'warrior', text: t('armorSpecialWinter2015WarriorText'), notes: t('armorSpecialWinter2015WarriorNotes', {con: 9}), value: 90, con: 9
      winter2015Mage:     event: events.winter2015, specialClass: 'wizard',    text: t('armorSpecialWinter2015MageText'), notes: t('armorSpecialWinter2015MageNotes', {int: 9}), value: 90, int: 9
      winter2015Healer:   event: events.winter2015, specialClass: 'healer',  text: t('armorSpecialWinter2015HealerText'), notes: t('armorSpecialWinter2015HealerNotes', {con: 15}), value: 90, con: 15
      birthday2015:   text: t('armorSpecialBirthday2015Text'), notes: t('armorSpecialBirthday2015Notes'), value: 0, canOwn: ((u)-> u.items.gear.owned.armor_special_birthday2015?)
      # Spring 2015
      spring2015Rogue:    event: events.spring2015, specialClass: 'rogue',   text: t('armorSpecialSpring2015RogueText'), notes: t('armorSpecialSpring2015RogueNotes', {per: 15}), value: 90, per: 15
      spring2015Warrior:  event: events.spring2015, specialClass: 'warrior', text: t('armorSpecialSpring2015WarriorText'), notes: t('armorSpecialSpring2015WarriorNotes', {con: 9}), value: 90, con: 9
      spring2015Mage:     event: events.spring2015, specialClass: 'wizard',    text: t('armorSpecialSpring2015MageText'), notes: t('armorSpecialSpring2015MageNotes', {int: 9}), value: 90, int: 9
      spring2015Healer:   event: events.spring2015, specialClass: 'healer',  text: t('armorSpecialSpring2015HealerText'), notes: t('armorSpecialSpring2015HealerNotes', {con: 15}), value: 90, con: 15
      # Other
      gaymerx:    event: events.gaymerx, text: t('armorSpecialGaymerxText'), notes: t('armorSpecialGaymerxNotes'), value: 0
    mystery:
      201402: text: t('armorMystery201402Text'), notes: t('armorMystery201402Notes'), mystery:'201402', value: 0
      201403: text: t('armorMystery201403Text'), notes: t('armorMystery201403Notes'), mystery:'201403', value: 0
      201405: text: t('armorMystery201405Text'), notes: t('armorMystery201405Notes'), mystery:'201405', value: 0
      201406: text: t('armorMystery201406Text'), notes: t('armorMystery201406Notes'), mystery:'201406', value: 0
      201407: text: t('armorMystery201407Text'), notes: t('armorMystery201407Notes'), mystery:'201407', value: 0
      201408: text: t('armorMystery201408Text'), notes: t('armorMystery201408Notes'), mystery:'201408', value: 0
      201409: text: t('armorMystery201409Text'), notes: t('armorMystery201409Notes'), mystery:'201409', value: 0
      201410: text: t('armorMystery201410Text'), notes: t('armorMystery201410Notes'), mystery:'201410', value: 0
      201412: text: t('armorMystery201412Text'), notes: t('armorMystery201412Notes'), mystery:'201412', value: 0
      201501: text: t('armorMystery201501Text'), notes: t('armorMystery201501Notes'), mystery:'201501', value: 0
      201503: text: t('armorMystery201503Text'), notes: t('armorMystery201503Notes'), mystery:'201503', value: 0
      201504: text: t('armorMystery201504Text'), notes: t('armorMystery201504Notes'), mystery:'201504', value: 0
      301404: text: t('armorMystery301404Text'), notes: t('armorMystery301404Notes'), mystery:'301404', value: 0

  head:
    base:
      0: text: t('headBase0Text'), notes: t('headBase0Notes'), value:0
    warrior:
      #0: text: "No Helm", notes:'No headgear.', value:0
      1: text: t('headWarrior1Text'), notes: t('headWarrior1Notes', {str: 2}), str: 2, value:15
      2: text: t('headWarrior2Text'), notes: t('headWarrior2Notes', {str: 4}), str: 4, value:25
      3: text: t('headWarrior3Text'), notes: t('headWarrior3Notes', {str: 6}), str: 6, value:40
      4: text: t('headWarrior4Text'), notes: t('headWarrior4Notes', {str: 9}), str: 9, value:60
      5: text: t('headWarrior5Text'), notes: t('headWarrior5Notes', {str: 12}), str: 12, value:80, last: true
    rogue:
      #0: text: "No Hood", notes:'No headgear.', value:0
      1: text: t('headRogue1Text'), notes: t('headRogue1Notes', {per: 2}), per: 2, value:15
      2: text: t('headRogue2Text'), notes: t('headRogue2Notes', {per: 4}), per: 4, value:25
      3: text: t('headRogue3Text'), notes: t('headRogue3Notes', {per: 6}), per: 6, value:40
      4: text: t('headRogue4Text'), notes: t('headRogue4Notes', {per: 9}), per: 9, value:60
      5: text: t('headRogue5Text'), notes: t('headRogue5Notes', {per: 12}), per: 12, value:80, last: true
    wizard:
      #0: text: "No Hat", notes:'No headgear.', value:0
      1: text: t('headWizard1Text'), notes: t('headWizard1Notes', {per: 2}), per: 2, value:15
      2: text: t('headWizard2Text'), notes: t('headWizard2Notes', {per: 3}), per: 3, value:25
      3: text: t('headWizard3Text'), notes: t('headWizard3Notes', {per: 5}), per: 5, value:40
      4: text: t('headWizard4Text'), notes: t('headWizard4Notes', {per: 7}), per: 7, value:60
      5: text: t('headWizard5Text'), notes: t('headWizard5Notes', {per: 10}), per: 10, value:80, last: true
    healer:
      #0: text: "No Circlet", notes:'No headgear.', value:0
      1: text: t('headHealer1Text'), notes: t('headHealer1Notes', {int: 2}), int: 2, value:15
      2: text: t('headHealer2Text'), notes: t('headHealer2Notes', {int: 3}), int: 3, value:25
      3: text: t('headHealer3Text'), notes: t('headHealer3Notes', {int: 5}), int: 5, value:40
      4: text: t('headHealer4Text'), notes: t('headHealer4Notes', {int: 7}), int: 7, value:60
      5: text: t('headHealer5Text'), notes: t('headHealer5Notes', {int: 9}), int: 9, value:80, last: true
    special:
      0: text: t('headSpecial0Text'), notes: t('headSpecial0Notes', {int: 20}), int: 20, value:150, canOwn: ((u)-> +u.backer?.tier >= 45)
      1: text: t('headSpecial1Text'), notes: t('headSpecial1Notes', {attrs: 6}), con: 6, str: 6, per: 6, int: 6, value:170, canOwn: ((u)-> +u.contributor?.level >= 3)
      2: text: t('headSpecial2Text'), notes: t('headSpecial2Notes', {attrs: 25}), int: 25, str: 25, value:200, canOwn: ((u)-> (+u.backer?.tier >= 300) or u.items.gear.owned.head_special_2?)
      #Winter event
      nye:        event: events.winter, text: t('headSpecialNyeText'), notes: t('headSpecialNyeNotes'), value: 0
      yeti:       event: events.winter, specialClass: 'warrior', text: t('headSpecialYetiText'), notes: t('headSpecialYetiNotes', {str: 9}), str: 9, value:60
      ski:        event: events.winter, specialClass: 'rogue', text: t('headSpecialSkiText'), notes: t('headSpecialSkiNotes', {per: 9}), per: 9, value:60
      candycane:  event: events.winter, specialClass: 'wizard', text: t('headSpecialCandycaneText'), notes: t('headSpecialCandycaneNotes', {per: 7}), per: 7, value:60
      snowflake:  event: events.winter, specialClass: 'healer', text: t('headSpecialSnowflakeText'), notes: t('headSpecialSnowflakeNotes', {int: 7}), int: 7, value:60
      # Spring Fling
      springRogue:    event: events.spring, specialClass: 'rogue',   text: t('headSpecialSpringRogueText'), notes: t('headSpecialSpringRogueNotes', {per: 9}),value: 60,per: 9
      springWarrior:  event: events.spring, specialClass: 'warrior', text: t('headSpecialSpringWarriorText'), notes: t('headSpecialSpringWarriorNotes', {str: 9}),value: 60,str: 9
      springMage:     event: events.spring, specialClass: 'wizard',    text: t('headSpecialSpringMageText'), notes: t('headSpecialSpringMageNotes', {per: 7}),value: 60,per: 7
      springHealer:   event: events.spring, specialClass: 'healer',  text: t('headSpecialSpringHealerText'), notes: t('headSpecialSpringHealerNotes', {int: 7}), value: 60, int: 7
      # Summer
      summerRogue:    event: events.summer, specialClass: 'rogue',   text: t('headSpecialSummerRogueText'), notes: t('headSpecialSummerRogueNotes', {per: 9}),value: 60,per: 9
      summerWarrior:  event: events.summer, specialClass: 'warrior', text: t('headSpecialSummerWarriorText'), notes: t('headSpecialSummerWarriorNotes', {str: 9}),value: 60,str: 9
      summerMage:     event: events.summer, specialClass: 'wizard',    text: t('headSpecialSummerMageText'), notes: t('headSpecialSummerMageNotes', {per: 7}),value: 60,per: 7
      summerHealer:   event: events.summer, specialClass: 'healer',  text: t('headSpecialSummerHealerText'), notes: t('headSpecialSummerHealerNotes', {int: 7}), value: 60, int: 7
      # Fall
      fallRogue:    event: events.fall, specialClass: 'rogue',   text: t('headSpecialFallRogueText'), notes: t('headSpecialFallRogueNotes', {per: 9}),value: 60,per: 9
      fallWarrior:  event: events.fall, specialClass: 'warrior', text: t('headSpecialFallWarriorText'), notes: t('headSpecialFallWarriorNotes', {str: 9}),value: 60,str: 9
      fallMage:     event: events.fall, specialClass: 'wizard',    text: t('headSpecialFallMageText'), notes: t('headSpecialFallMageNotes', {per: 7}),value: 60,per: 7
      fallHealer:   event: events.fall, specialClass: 'healer',  text: t('headSpecialFallHealerText'), notes: t('headSpecialFallHealerNotes', {int: 7}), value: 60, int: 7
      # Winter 2015
      winter2015Rogue:    event: events.winter2015, specialClass: 'rogue',   text: t('headSpecialWinter2015RogueText'), notes: t('headSpecialWinter2015RogueNotes', {per: 9}),value: 60,per: 9
      winter2015Warrior:  event: events.winter2015, specialClass: 'warrior', text: t('headSpecialWinter2015WarriorText'), notes: t('headSpecialWinter2015WarriorNotes', {str: 9}),value: 60,str: 9
      winter2015Mage:     event: events.winter2015, specialClass: 'wizard',    text: t('headSpecialWinter2015MageText'), notes: t('headSpecialWinter2015MageNotes', {per: 7}),value: 60,per: 7
      winter2015Healer:   event: events.winter2015, specialClass: 'healer',  text: t('headSpecialWinter2015HealerText'), notes: t('headSpecialWinter2015HealerNotes', {int: 7}), value: 60, int: 7
      nye2014:      text: t('headSpecialNye2014Text'), notes: t('headSpecialNye2014Notes'), value: 0, canOwn: ((u)-> u.items.gear.owned.head_special_nye2014?)
      # Spring 2015
      spring2015Rogue:    event: events.spring2015, specialClass: 'rogue',   text: t('headSpecialSpring2015RogueText'), notes: t('headSpecialSpring2015RogueNotes', {per: 9}),value: 60,per: 9
      spring2015Warrior:  event: events.spring2015, specialClass: 'warrior', text: t('headSpecialSpring2015WarriorText'), notes: t('headSpecialSpring2015WarriorNotes', {str: 9}),value: 60,str: 9
      spring2015Mage:     event: events.spring2015, specialClass: 'wizard',    text: t('headSpecialSpring2015MageText'), notes: t('headSpecialSpring2015MageNotes', {per: 7}),value: 60,per: 7
      spring2015Healer:   event: events.spring2015, specialClass: 'healer',  text: t('headSpecialSpring2015HealerText'), notes: t('headSpecialSpring2015HealerNotes', {int: 7}), value: 60, int: 7
      # Other
      gaymerx:        event: events.gaymerx, text: t('headSpecialGaymerxText'), notes: t('headSpecialGaymerxNotes'), value: 0
    mystery:
      201402: text: t('headMystery201402Text'), notes: t('headMystery201402Notes'), mystery:'201402', value: 0
      201405: text: t('headMystery201405Text'), notes: t('headMystery201405Notes'), mystery:'201405', value: 0
      201406: text: t('headMystery201406Text'), notes: t('headMystery201406Notes'), mystery:'201406', value: 0
      201407: text: t('headMystery201407Text'), notes: t('headMystery201407Notes'), mystery:'201407', value: 0
      201408: text: t('headMystery201408Text'), notes: t('headMystery201408Notes'), mystery:'201408', value: 0
      201411: text: t('headMystery201411Text'), notes: t('headMystery201411Notes'), mystery:'201411', value: 0
      201412: text: t('headMystery201412Text'), notes: t('headMystery201412Notes'), mystery:'201412', value: 0
      201501: text: t('headMystery201501Text'), notes: t('headMystery201501Notes'), mystery:'201501', value: 0
      301404: text: t('headMystery301404Text'), notes: t('headMystery301404Notes'), mystery:'301404', value: 0
      301405: text: t('headMystery301405Text'), notes: t('headMystery301405Notes'), mystery:'301405', value: 0

  shield:
    base:
      0: text: t('shieldBase0Text'), notes: t('shieldBase0Notes'), value:0
      #changed because this is what shows up for all classes, including those without shields
    warrior:
      #0: text: "No Shield", notes:'No shield.', value:0
      1: text: t('shieldWarrior1Text'), notes: t('shieldWarrior1Notes', {con: 2}), con: 2, value:20
      2: text: t('shieldWarrior2Text'), notes: t('shieldWarrior2Notes', {con: 3}), con: 3, value:35
      3: text: t('shieldWarrior3Text'), notes: t('shieldWarrior3Notes', {con: 5}), con: 5, value:50
      4: text: t('shieldWarrior4Text'), notes: t('shieldWarrior4Notes', {con: 7}), con: 7, value:70
      5: text: t('shieldWarrior5Text'), notes: t('shieldWarrior5Notes', {con: 9}), con: 9, value:90, last: true
    rogue:
      0: text: t('weaponRogue0Text'), notes: t('weaponRogue0Notes'), str: 0, value: 0
      1: text: t('weaponRogue1Text'), notes: t('weaponRogue1Notes', {str: 2}), str: 2, value: 20
      2: text: t('weaponRogue2Text'), notes: t('weaponRogue2Notes', {str: 3}), str: 3, value: 35
      3: text: t('weaponRogue3Text'), notes: t('weaponRogue3Notes', {str: 4}), str: 4, value: 50
      4: text: t('weaponRogue4Text'), notes: t('weaponRogue4Notes', {str: 6}), str: 6, value: 70
      5: text: t('weaponRogue5Text'), notes: t('weaponRogue5Notes', {str: 8}), str: 8, value: 90
      6: text: t('weaponRogue6Text'), notes: t('weaponRogue6Notes', {str: 10}), str: 10, value: 120, last: true
    wizard: {}
      #0: text: "No Shield", notes:'No shield.', def: 0, value:0, last: true
    healer:
      #0: text: "No Shield", notes:'No shield.', def: 0, value:0
      1: text: t('shieldHealer1Text'), notes: t('shieldHealer1Notes', {con: 2}), con: 2, value:20
      2: text: t('shieldHealer2Text'), notes: t('shieldHealer2Notes', {con: 4}), con: 4, value:35
      3: text: t('shieldHealer3Text'), notes: t('shieldHealer3Notes', {con: 6}), con: 6, value:50
      4: text: t('shieldHealer4Text'), notes: t('shieldHealer4Notes', {con: 9}), con: 9, value:70
      5: text: t('shieldHealer5Text'), notes: t('shieldHealer5Notes', {con: 12}), con: 12, value:90, last: true
    special:
      0: text: t('shieldSpecial0Text'), notes: t('shieldSpecial0Notes', {per: 20}), per: 20, value:150, canOwn: ((u)-> +u.backer?.tier >= 45)
      1: text: t('shieldSpecial1Text'), notes: t('shieldSpecial1Notes', {attrs: 6}), con: 6, str: 6, per: 6, int:6, value:170, canOwn: ((u)-> +u.contributor?.level >= 5)
      goldenknight: text: t('shieldSpecialGoldenknightText'), notes: t('shieldSpecialGoldenknightNotes', {attrs: 25}), con: 25, per: 25, value:200, canOwn: ((u)-> u.items.gear.owned.shield_special_goldenknight?)
      #Winter event
      yeti:       event: events.winter, specialClass: 'warrior', text: t('shieldSpecialYetiText'), notes: t('shieldSpecialYetiNotes', {con: 7}), con: 7, value: 70
      ski:        event: events.winter, specialClass: 'rogue', text: t('weaponSpecialSkiText'), notes: t('weaponSpecialSkiNotes', {str: 8}), str: 8, value: 90
      snowflake:  event: events.winter, specialClass: 'healer', text: t('shieldSpecialSnowflakeText'), notes: t('shieldSpecialSnowflakeNotes', {con: 9}), con: 9, value: 70
      #Spring Fling
      springRogue:    event: events.spring, specialClass: 'rogue',   text: t('shieldSpecialSpringRogueText'), notes: t('shieldSpecialSpringRogueNotes', {str: 8}), value: 80, str: 8
      springWarrior:  event: events.spring, specialClass: 'warrior', text: t('shieldSpecialSpringWarriorText'), notes: t('shieldSpecialSpringWarriorNotes', {con: 7}), value: 70, con: 7
      springHealer:   event: events.spring, specialClass: 'healer',  text: t('shieldSpecialSpringHealerText'), notes: t('shieldSpecialSpringHealerNotes', {con: 9}), value: 70, con: 9
      #Summer
      summerRogue:    event: events.summer, specialClass: 'rogue',   text: t('shieldSpecialSummerRogueText'), notes: t('shieldSpecialSummerRogueNotes', {str: 8}), value: 80, str: 8
      summerWarrior:  event: events.summer, specialClass: 'warrior', text: t('shieldSpecialSummerWarriorText'), notes: t('shieldSpecialSummerWarriorNotes', {con: 7}), value: 70, con: 7
      summerHealer:   event: events.summer, specialClass: 'healer',  text: t('shieldSpecialSummerHealerText'), notes: t('shieldSpecialSummerHealerNotes', {con: 9}), value: 70, con: 9
      #Fall
      fallRogue:    event: events.fall, specialClass: 'rogue',   text: t('shieldSpecialFallRogueText'), notes: t('shieldSpecialFallRogueNotes', {str: 8}), value: 80, str: 8
      fallWarrior:  event: events.fall, specialClass: 'warrior', text: t('shieldSpecialFallWarriorText'), notes: t('shieldSpecialFallWarriorNotes', {con: 7}), value: 70, con: 7
      fallHealer:   event: events.fall, specialClass: 'healer',  text: t('shieldSpecialFallHealerText'), notes: t('shieldSpecialFallHealerNotes', {con: 9}), value: 70, con: 9
      # Winter 2015
      winter2015Rogue:    event: events.winter2015, specialClass: 'rogue',   text: t('shieldSpecialWinter2015RogueText'), notes: t('shieldSpecialWinter2015RogueNotes', {str: 8}), value: 80, str: 8
      winter2015Warrior:  event: events.winter2015, specialClass: 'warrior', text: t('shieldSpecialWinter2015WarriorText'), notes: t('shieldSpecialWinter2015WarriorNotes', {con: 7}), value: 70, con: 7
      winter2015Healer:   event: events.winter2015, specialClass: 'healer',  text: t('shieldSpecialWinter2015HealerText'), notes: t('shieldSpecialWinter2015HealerNotes', {con: 9}), value: 70, con: 9
      # Spring 2015
      spring2015Rogue:    event: events.spring2015, specialClass: 'rogue',   text: t('shieldSpecialSpring2015RogueText'), notes: t('shieldSpecialSpring2015RogueNotes', {str: 8}), value: 80, str: 8
      spring2015Warrior:  event: events.spring2015, specialClass: 'warrior', text: t('shieldSpecialSpring2015WarriorText'), notes: t('shieldSpecialSpring2015WarriorNotes', {con: 7}), value: 70, con: 7
      spring2015Healer:   event: events.spring2015, specialClass: 'healer',  text: t('shieldSpecialSpring2015HealerText'), notes: t('shieldSpecialSpring2015HealerNotes', {con: 9}), value: 70, con: 9
    mystery:
      301405: text: t('shieldMystery301405Text'), notes: t('shieldMystery301405Notes'), mystery:'301405', value: 0

  back:
    base:
      0: text: t('backBase0Text'), notes: t('backBase0Notes'), value:0
    mystery:
      201402: text: t('backMystery201402Text'), notes: t('backMystery201402Notes'), mystery:'201402', value: 0
      201404: text: t('backMystery201404Text'), notes: t('backMystery201404Notes'), mystery:'201404', value: 0
      201410: text: t('backMystery201410Text'), notes: t('backMystery201410Notes'), mystery:'201410', value: 0
      201504: text: t('backMystery201504Text'), notes: t('backMystery201504Notes'), mystery:'201504', value: 0
    special:
      wondercon_red: text: t('backSpecialWonderconRedText'), notes: t('backSpecialWonderconRedNotes'), value: 0, mystery:'wondercon'
      wondercon_black: text: t('backSpecialWonderconBlackText'), notes: t('backSpecialWonderconBlackNotes'), value: 0, mystery:'wondercon'

  body:
    base:
      0: text: t('bodyBase0Text'), notes:t('bodyBase0Notes'), value:0
    special:
      wondercon_red: text: t('bodySpecialWonderconRedText'), notes: t('bodySpecialWonderconRedNotes'), value: 0,        mystery:'wondercon'
      wondercon_gold: text: t('bodySpecialWonderconGoldText'), notes: t('bodySpecialWonderconGoldNotes'), value: 0,     mystery:'wondercon'
      wondercon_black: text: t('bodySpecialWonderconBlackText'), notes: t('bodySpecialWonderconBlackNotes'), value: 0,  mystery:'wondercon'
      # Summer
      summerHealer:   event: events.summer, specialClass: 'healer',  text: t('bodySpecialSummerHealerText'), notes: t('bodySpecialSummerHealerNotes'), value: 20
      summerMage:     event: events.summer, specialClass: 'wizard',  text: t('bodySpecialSummerMageText'), notes: t('bodySpecialSummerMageNotes'), value: 20

  headAccessory:
    base:
      0: text: t('headAccessoryBase0Text'), notes: t('headAccessoryBase0Notes'), value: 0, last: true
    special:
      # Spring Event
      springRogue:   event: events.spring, specialClass: 'rogue',   text: t('headAccessorySpecialSpringRogueText'), notes: t('headAccessorySpecialSpringRogueNotes'), value: 20
      springWarrior: event: events.spring, specialClass: 'warrior', text: t('headAccessorySpecialSpringWarriorText'), notes: t('headAccessorySpecialSpringWarriorNotes'), value: 20
      springMage:    event: events.spring, specialClass: 'wizard',  text: t('headAccessorySpecialSpringMageText'), notes: t('headAccessorySpecialSpringMageNotes'), value: 20
      springHealer:  event: events.spring, specialClass: 'healer',  text: t('headAccessorySpecialSpringHealerText'), notes: t('headAccessorySpecialSpringHealerNotes'), value: 20
      # Spring 2015
      spring2015Rogue:   event: events.spring2015, specialClass: 'rogue',   text: t('headAccessorySpecialSpring2015RogueText'), notes: t('headAccessorySpecialSpring2015RogueNotes'), value: 20
      spring2015Warrior: event: events.spring2015, specialClass: 'warrior', text: t('headAccessorySpecialSpring2015WarriorText'), notes: t('headAccessorySpecialSpring2015WarriorNotes'), value: 20
      spring2015Mage:    event: events.spring2015, specialClass: 'wizard',  text: t('headAccessorySpecialSpring2015MageText'), notes: t('headAccessorySpecialSpring2015MageNotes'), value: 20
      spring2015Healer:  event: events.spring2015, specialClass: 'healer',  text: t('headAccessorySpecialSpring2015HealerText'), notes: t('headAccessorySpecialSpring2015HealerNotes'), value: 20

    mystery:
      201403: text: t('headAccessoryMystery201403Text'), notes: t('headAccessoryMystery201403Notes'), mystery:'201403', value: 0
      201404: text: t('headAccessoryMystery201404Text'), notes: t('headAccessoryMystery201404Notes'), mystery:'201404', value: 0
      201409: text: t('headAccessoryMystery201409Text'), notes: t('headAccessoryMystery201409Notes'), mystery:'201409', value: 0
      201502: text: t('headAccessoryMystery201502Text'), notes: t('headAccessoryMystery201502Notes'), mystery:'201502', value: 0
      301405: text: t('headAccessoryMystery301405Text'), notes: t('headAccessoryMystery301405Notes'), mystery:'301405', value: 0

  eyewear:
    base:
      0: text: t('eyewearBase0Text'), notes: t('eyewearBase0Notes'), value: 0, last: true
    special:
      wondercon_red: text: t('eyewearSpecialWonderconRedText'), notes: t('eyewearSpecialWonderconRedNotes'), value: 0, mystery:'wondercon'
      wondercon_black: text: t('eyewearSpecialWonderconBlackText'), notes: t('eyewearSpecialWonderconBlackNotes'), value: 0, mystery:'wondercon'
      #Summer
      summerRogue:   event: events.summer, specialClass: 'rogue',   text: t('eyewearSpecialSummerRogueText'), notes: t('eyewearSpecialSummerRogueNotes'), value: 20
      summerWarrior: event: events.summer, specialClass: 'warrior', text: t('eyewearSpecialSummerWarriorText'), notes: t('eyewearSpecialSummerWarriorNotes'), value: 20
    mystery:
      201503: text: t('eyewearMystery201503Text'), notes: t('eyewearMystery201503Notes'), mystery:'201503', value: 0
      301404: text: t('eyewearMystery301404Text'), notes: t('eyewearMystery301404Notes'), mystery:'301404', value: 0
      301405: text: t('eyewearMystery301405Text'), notes: t('eyewearMystery301405Notes'), mystery:'301405', value: 0

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
  Time Traveler Store, mystery sets need their items mapped in
###
_.each api.mystery, (v,k)-> v.items = _.where api.gear.flat, {mystery:k}
api.timeTravelerStore = (owned) ->
  ownedKeys = _.keys owned.toObject?() or owned # mongoose workaround
  _.reduce api.mystery, (m,v,k)->
    return m if k=='wondercon' or ~ownedKeys.indexOf(v.items[0].key) # skip wondercon and already-owned sets
    m[k] = v;m
  , {}

###
  ---------------------------------------------------------------
  Potion
  ---------------------------------------------------------------
###

api.potion = type: 'potion', text: t('potionText'), notes: t('potionNotes'), value: 25, key: 'potion'

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
      text: t('spellWizardFireballText')
      mana: 10
      lvl: 11
      target: 'task'
      notes: t('spellWizardFireballNotes')
      cast: (user, target) ->
        # I seriously have no idea what I'm doing here. I'm just mashing buttons until numbers seem right-ish. Anyone know math?
        bonus = user._statsComputed.int * user.fns.crit('per')
        target.value += diminishingReturns(bonus*.02, 4)
        bonus *= Math.ceil ((if target.value < 0 then 1 else target.value+1) *.075)
        #console.log {bonus, expBonus:bonus,upBonus:bonus*.1}
        user.stats.exp += diminishingReturns(bonus,75)
        user.party.quest.progress.up += diminishingReturns(bonus*.1,50,30)
        #Sync the user stats to see if we level the user
        req = { language: user.preferences.language }
        user.fns.updateStats( user.stats , req )

    mpheal:
      text: t('spellWizardMPHealText')
      mana: 30
      lvl: 12
      target: 'party'
      notes: t('spellWizardMPHealNotes'),
      cast: (user, target)->
        _.each target, (member) ->
          bonus = Math.ceil(user._statsComputed.int * .1)
          bonus = 25 if bonus > 25 #prevent ability to replenish own mp infinitely
          member.stats.mp += bonus

    earth:
      text: t('spellWizardEarthText')
      mana: 35
      lvl: 13
      target: 'party'
      notes: t('spellWizardEarthNotes'),
      cast: (user, target) ->
        _.each target, (member) ->
          member.stats.buffs.int ?= 0
          member.stats.buffs.int += Math.ceil(user._statsComputed.int * .05)

    frost:
      text: t('spellWizardFrostText'),
      mana: 40
      lvl: 14
      target: 'self'
      notes: t('spellWizardFrostNotes'),
      cast: (user, target) ->
        user.stats.buffs.streaks = true

  warrior:
    smash:
      text: t('spellWarriorSmashText')
      mana: 10
      lvl: 11
      target: 'task'
      notes: t('spellWarriorSmashNotes')
      cast: (user, target) ->
        target.value += 2.5 * (user._statsComputed.str / (user._statsComputed.str + 50)) * user.fns.crit('con')
        user.party.quest.progress.up += Math.ceil(user._statsComputed.str * .2)
    defensiveStance:
      text: t('spellWarriorDefensiveStanceText')
      mana: 25
      lvl: 12
      target: 'self'
      notes: t('spellWarriorDefensiveStanceNotes')
      cast: (user, target) ->
        user.stats.buffs.con ?= 0
        user.stats.buffs.con += Math.ceil(user._statsComputed.con * .05)
    valorousPresence:
      text: t('spellWarriorValorousPresenceText')
      mana: 20
      lvl: 13
      target: 'party'
      notes: t('spellWarriorValorousPresenceNotes')
      cast: (user, target) ->
        _.each target, (member) ->
          member.stats.buffs.str ?= 0
          member.stats.buffs.str += Math.ceil(user._statsComputed.str * .05)
    intimidate:
      text: t('spellWarriorIntimidateText')
      mana: 15
      lvl: 14
      target: 'party'
      notes: t('spellWarriorIntimidateNotes')
      cast: (user, target) ->
        _.each target, (member) ->
          member.stats.buffs.con ?= 0
          member.stats.buffs.con += Math.ceil(user._statsComputed.con *  .03)

  rogue:
    pickPocket:
      text: t('spellRoguePickPocketText')
      mana: 10
      lvl: 11
      target: 'task'
      notes: t('spellRoguePickPocketNotes')
      cast: (user, target) ->
        bonus = (if target.value < 0 then 1 else target.value+2) + (user._statsComputed.per * 0.5)
        user.stats.gp += 25 * (bonus / (bonus + 75))
    backStab:
      text: t('spellRogueBackStabText')
      mana: 15
      lvl: 12
      target: 'task'
      notes: t('spellRogueBackStabNotes')
      cast: (user, target) ->
        _crit = user.fns.crit('str', .3)
        target.value += _crit * .03
        bonus =  (if target.value < 0 then 1 else target.value+1) * _crit
        user.stats.exp += bonus
        user.stats.gp += bonus
        # user.party.quest.progress.up += bonus if user.party.quest.key # remove hurting bosses for rogues, seems OP for now
        #Sync the user stats to see if we level the user
        req = { language: user.preferences.language }
        user.fns.updateStats( user.stats , req )
    toolsOfTrade:
      text: t('spellRogueToolsOfTradeText')
      mana: 25
      lvl: 13
      target: 'party'
      notes: t('spellRogueToolsOfTradeNotes')
      cast: (user, target) ->
        ## lasts 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.per ?= 0
          member.stats.buffs.per += Math.ceil(user._statsComputed.per * .03)
    stealth:
      text: t('spellRogueStealthText')
      mana: 45
      lvl: 14
      target: 'self'
      notes: t('spellRogueStealthNotes')
      cast: (user, target) ->
        user.stats.buffs.stealth ?= 0
        ## scales to user's # of dailies; maxes out at 100% at 100 per ##
        user.stats.buffs.stealth += Math.ceil(user.dailys.length * user._statsComputed.per / 100)

  healer:
    heal:
      text: t('spellHealerHealText')
      mana: 15
      lvl: 11
      target: 'self'
      notes: t('spellHealerHealNotes')
      cast: (user, target) ->
        user.stats.hp += (user._statsComputed.con + user._statsComputed.int + 5) * .075
        user.stats.hp = 50 if user.stats.hp > 50
    brightness:
      text: t('spellHealerBrightnessText')
      mana: 15
      lvl: 12
      target: 'self'
      notes: t('spellHealerBrightnessNotes')
      cast: (user, target) ->
        _.each user.tasks, (target) ->
          return if target.type is 'reward'
          target.value += 1.5 * (user._statsComputed.int / (user._statsComputed.int + 40))
    protectAura:
      text: t('spellHealerProtectAuraText')
      mana: 30
      lvl: 13
      target: 'party'
      notes: t('spellHealerProtectAuraNotes')
      cast: (user, target) ->
        ## lasts 24 hours ##
        _.each target, (member) ->
          member.stats.buffs.con ?= 0
          member.stats.buffs.con += Math.ceil(user._statsComputed.con * .15)
    heallAll:
      text: t('spellHealerHealAllText')
      mana: 25
      lvl: 14
      target: 'party'
      notes: t('spellHealerHealAllNotes')
      cast: (user, target) ->
        _.each target, (member) ->
          member.stats.hp += (user._statsComputed.con + user._statsComputed.int + 5) * .04
          member.stats.hp = 50 if member.stats.hp > 50

  special:
    snowball:
      text: t('spellSpecialSnowballAuraText')
      mana: 0
      value: 15
      target: 'user'
      notes: t('spellSpecialSnowballAuraNotes')
      cast: (user, target) ->
        target.stats.buffs.snowball = true
        target.stats.buffs.spookDust = false
        target.stats.buffs.shinySeed = false
        target.achievements.snowball ?= 0
        target.achievements.snowball++
        user.items.special.snowball--

    salt:
      text: t('spellSpecialSaltText')
      mana: 0
      value: 5
      immediateUse: true
      target: 'self'
      notes: t('spellSpecialSaltNotes')
      cast: (user, target) ->
        user.stats.buffs.snowball = false
        user.stats.gp -= 5

    spookDust:
      text: t('spellSpecialSpookDustText')
      mana: 0
      value: 15
      target: 'user'
      notes: t('spellSpecialSpookDustNotes')
      cast: (user, target) ->
        target.stats.buffs.snowball = false
        target.stats.buffs.spookDust = true
        target.stats.buffs.shinySeed = false
        target.achievements.spookDust ?= 0
        target.achievements.spookDust++
        user.items.special.spookDust--

    opaquePotion:
      text: t('spellSpecialOpaquePotionText')
      mana: 0
      value: 5
      immediateUse: true
      target: 'self'
      notes: t('spellSpecialOpaquePotionNotes')
      cast: (user, target) ->
        user.stats.buffs.spookDust = false
        user.stats.gp -= 5

    shinySeed:
      text: t('spellSpecialShinySeedText')
      mana: 0
      value: 15
      target: 'user'
      notes: t('spellSpecialShinySeedNotes')
      cast: (user, target) ->
        target.stats.buffs.snowball = false
        target.stats.buffs.spookDust = false
        target.stats.buffs.shinySeed = true
        target.achievements.shinySeed ?= 0
        target.achievements.shinySeed++
        user.items.special.shinySeed--

    petalFreePotion:
      text: t('spellSpecialPetalFreePotionText')
      mana: 0
      value: 5
      immediateUse: true
      target: 'self'
      notes: t('spellSpecialPetalFreePotionNotes')
      cast: (user, target) ->
        user.stats.buffs.shinySeed = false
        user.stats.gp -= 5

    nye:
      text: t('nyeCard')
      mana: 0
      value: 10
      immediateUse: true
      silent: true
      target: 'user'
      notes: t('nyeCardNotes')
      cast: (user, target) ->
        if user == target
          user.achievements.nye ?= 0
          user.achievements.nye++
        else
          _.each [user,target], (t)->
            t.achievements.nye ?= 0
            t.achievements.nye++
        if !target.items.special.nyeReceived
          target.items.special.nyeReceived = []
        target.items.special.nyeReceived.push user.profile.name

        target.markModified? 'items.special.nyeReceived'
        user.stats.gp -= 10

    valentine:
      text: t('valentineCard')
      mana: 0
      value: 10
      immediateUse: true
      silent: true
      target: 'user'
      notes: t('valentineCardNotes')
      cast: (user, target) ->
        if user == target
          user.achievements.valentine ?= 0
          user.achievements.valentine++
        else
          _.each [user,target], (t)->
            t.achievements.valentine ?= 0
            t.achievements.valentine++
        if !target.items.special.valentineReceived
          target.items.special.valentineReceived = []
        target.items.special.valentineReceived.push user.profile.name

        target.markModified? 'items.special.valentineReceived'
        user.stats.gp -= 10

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
  Wolf:             text: t('dropEggWolfText'), adjective: t('dropEggWolfAdjective')
  TigerCub:         text: t('dropEggTigerCubText'), mountText: t('dropEggTigerCubMountText'), adjective: t('dropEggTigerCubAdjective')
  PandaCub:         text: t('dropEggPandaCubText'), mountText: t('dropEggPandaCubMountText'), adjective: t('dropEggPandaCubAdjective')
  LionCub:          text: t('dropEggLionCubText'),  mountText: t('dropEggLionCubMountText'), adjective: t('dropEggLionCubAdjective')
  Fox:              text: t('dropEggFoxText'), adjective: t('dropEggFoxAdjective')
  FlyingPig:        text: t('dropEggFlyingPigText'), adjective: t('dropEggFlyingPigAdjective')
  Dragon:           text: t('dropEggDragonText'), adjective: t('dropEggDragonAdjective')
  Cactus:           text: t('dropEggCactusText'), adjective: t('dropEggCactusAdjective')
  BearCub:          text: t('dropEggBearCubText'),  mountText: t('dropEggBearCubMountText'), adjective: t('dropEggBearCubAdjective')
_.each api.dropEggs, (egg,key) ->
  _.defaults egg,
    canBuy:true
    value: 3
    key: key
    notes: t('eggNotes', {eggText: egg.text, eggAdjective: egg.adjective})
    mountText: egg.text

api.questEggs =
  # value & other defaults set below
  Gryphon:          text: t('questEggGryphonText'),  adjective: t('questEggGryphonAdjective'), canBuy: false
  Hedgehog:         text: t('questEggHedgehogText'), adjective: t('questEggHedgehogAdjective'), canBuy: false
  Deer:             text: t('questEggDeerText'), adjective: t('questEggDeerAdjective'), canBuy: false
  Egg:              text: t('questEggEggText'), adjective: t('questEggEggAdjective'), canBuy: false, mountText: t('questEggEggMountText')
  Rat:              text: t('questEggRatText'), adjective: t('questEggRatAdjective'), canBuy: false
  Octopus:          text: t('questEggOctopusText'), adjective: t('questEggOctopusAdjective'), canBuy: false
  Seahorse:         text: t('questEggSeahorseText'), adjective: t('questEggSeahorseAdjective'), canBuy: false
  Parrot:           text: t('questEggParrotText'), adjective: t('questEggParrotAdjective'), canBuy: false
  Rooster:          text: t('questEggRoosterText'), adjective: t('questEggRoosterAdjective'), canBuy: false
  Spider:           text: t('questEggSpiderText'), adjective: t('questEggSpiderAdjective'), canBuy: false
  Owl:              text: t('questEggOwlText'), adjective: t('questEggOwlAdjective'), canBuy: false
  Penguin:          text: t('questEggPenguinText'), adjective: t('questEggPenguinAdjective'), canBuy: false
  TRex:             text: t('questEggTRexText'), adjective: t('questEggTRexAdjective'), canBuy: false
  Rock:             text: t('questEggRockText'), adjective: t('questEggRockAdjective'), canBuy: false
  Bunny:            text: t('questEggBunnyText'), adjective: t('questEggBunnyAdjective'), canBuy: false
  Slime:            text: t('questEggSlimeText'), adjective: t('questEggSlimeAdjective'), canBuy: false

_.each api.questEggs, (egg,key) ->
  _.defaults egg,
    canBuy:false
    value: 3
    key: key
    notes: t('eggNotes', {eggText: egg.text, eggAdjective: egg.adjective})
    mountText: egg.text

api.eggs = _.assign(_.cloneDeep(api.dropEggs), api.questEggs)

# special pets & mounts are {key:i18n}
api.specialPets =
  'Wolf-Veteran':       'veteranWolf'
  'Wolf-Cerberus':      'cerberusPup'
  'Dragon-Hydra':       'hydra'
  'Turkey-Base':        'turkey'
  'BearCub-Polar':      'polarBearPup'
  'MantisShrimp-Base':  'mantisShrimp'
  'JackOLantern-Base':  'jackolantern'
  'Mammoth-Base':       'mammoth'

api.specialMounts =
  'BearCub-Polar':	'polarBear'
  'LionCub-Ethereal':	'etherealLion'
  'MantisShrimp-Base':	'mantisShrimp'
  'Turkey-Base': 'turkey'
  'Mammoth-Base': 'mammoth'

api.hatchingPotions =
  Base:             value: 2, text: t('hatchingPotionBase')
  White:            value: 2, text: t('hatchingPotionWhite')
  Desert:           value: 2, text: t('hatchingPotionDesert')
  Red:              value: 3, text: t('hatchingPotionRed')
  Shade:            value: 3, text: t('hatchingPotionShade')
  Skeleton:         value: 3, text: t('hatchingPotionSkeleton')
  Zombie:           value: 4, text: t('hatchingPotionZombie')
  CottonCandyPink:  value: 4, text: t('hatchingPotionCottonCandyPink')
  CottonCandyBlue:  value: 4, text: t('hatchingPotionCottonCandyBlue')
  Golden:           value: 5, text: t('hatchingPotionGolden')
_.each api.hatchingPotions, (pot,key) ->
  _.defaults pot, {key, value: 2, notes: t('hatchingPotionNotes', {potText: pot.text})}

api.pets = _.transform api.dropEggs, (m, egg) ->
  _.defaults m, _.transform api.hatchingPotions, (m2, pot) ->
    m2[egg.key + "-" + pot.key] = true

api.questPets = _.transform api.questEggs, (m, egg) ->
  _.defaults m, _.transform api.hatchingPotions, (m2, pot) ->
    m2[egg.key + "-" + pot.key] = true

## added for mountmaster -- yes, the transforms are correct, since the same strings are used for both pets and mounts
api.mounts = _.transform api.dropEggs, (m, egg) ->
  _.defaults m, _.transform api.hatchingPotions, (m2, pot) ->
    m2[egg.key + "-" + pot.key] = true

api.questMounts = _.transform api.questEggs, (m, egg) ->
  _.defaults m, _.transform api.hatchingPotions, (m2, pot) ->
    m2[egg.key + "-" + pot.key] = true

api.food =
  # Base
  Meat:                 canBuy:true, canDrop:true, text: t('foodMeat'), target: 'Base', article: ''
  Milk:                 canBuy:true, canDrop:true, text: t('foodMilk'), target: 'White', article: ''
  Potatoe:              canBuy:true, canDrop:true, text: t('foodPotatoe'), target: 'Desert', article: 'a '
  Strawberry:           canBuy:true, canDrop:true, text: t('foodStrawberry'), target: 'Red', article: 'a '
  Chocolate:            canBuy:true, canDrop:true, text: t('foodChocolate'), target: 'Shade', article: ''
  Fish:                 canBuy:true, canDrop:true, text: t('foodFish'), target: 'Skeleton', article: 'a '
  RottenMeat:           canBuy:true, canDrop:true, text: t('foodRottenMeat'), target: 'Zombie', article: ''
  CottonCandyPink:      canBuy:true, canDrop:true, text: t('foodCottonCandyPink'), target: 'CottonCandyPink', article: ''
  CottonCandyBlue:      canBuy:true, canDrop:true, text: t('foodCottonCandyBlue'), target: 'CottonCandyBlue', article: ''
  Honey:                canBuy:true, canDrop:true, text: t('foodHoney'), target: 'Golden', article: ''

  Saddle:               canBuy:true, canDrop:false, text: t('foodSaddleText'), value: 5, notes: t('foodSaddleNotes')

  # Cake
  Cake_Skeleton:        canBuy:false, canDrop:false, text: t('foodCakeSkeleton'), target: 'Skeleton', article: ''
  Cake_Base:            canBuy:false, canDrop:false, text: t('foodCakeBase'), target: 'Base', article: ''
  Cake_CottonCandyBlue: canBuy:false, canDrop:false, text: t('foodCakeCottonCandyBlue'), target: 'CottonCandyBlue', article: ''
  Cake_CottonCandyPink: canBuy:false, canDrop:false, text: t('foodCakeCottonCandyPink'), target: 'CottonCandyPink', article: ''
  Cake_Shade:           canBuy:false, canDrop:false, text: t('foodCakeShade'), target: 'Shade', article: ''
  Cake_White:           canBuy:false, canDrop:false, text: t('foodCakeWhite'), target: 'White', article: ''
  Cake_Golden:          canBuy:false, canDrop:false, text: t('foodCakeGolden'), target: 'Golden', article: ''
  Cake_Zombie:          canBuy:false, canDrop:false, text: t('foodCakeZombie'), target: 'Zombie', article: ''
  Cake_Desert:          canBuy:false, canDrop:false, text: t('foodCakeDesert'), target: 'Desert', article: ''
  Cake_Red:             canBuy:false, canDrop:false, text: t('foodCakeRed'), target: 'Red', article: ''

  # Fall
  Candy_Skeleton:        canBuy:false, canDrop:false, text: t('foodCandySkeleton'), target: 'Skeleton', article: ''
  Candy_Base:            canBuy:false, canDrop:false, text: t('foodCandyBase'), target: 'Base', article: ''
  Candy_CottonCandyBlue: canBuy:false, canDrop:false, text: t('foodCandyCottonCandyBlue'), target: 'CottonCandyBlue', article: ''
  Candy_CottonCandyPink: canBuy:false, canDrop:false, text: t('foodCandyCottonCandyPink'), target: 'CottonCandyPink', article: ''
  Candy_Shade:           canBuy:false, canDrop:false, text: t('foodCandyShade'), target: 'Shade', article: ''
  Candy_White:           canBuy:false, canDrop:false, text: t('foodCandyWhite'), target: 'White', article: ''
  Candy_Golden:          canBuy:false, canDrop:false, text: t('foodCandyGolden'), target: 'Golden', article: ''
  Candy_Zombie:          canBuy:false, canDrop:false, text: t('foodCandyZombie'), target: 'Zombie', article: ''
  Candy_Desert:          canBuy:false, canDrop:false, text: t('foodCandyDesert'), target: 'Desert', article: ''
  Candy_Red:             canBuy:false, canDrop:false, text: t('foodCandyRed'), target: 'Red', article: ''

_.each api.food, (food,key) ->
  _.defaults food, {value: 1, key, notes: t('foodNotes')}

api.quests =

  dilatory:
    text: t("questDilatoryText")
    notes: t("questDilatoryNotes")
    completion: t("questDilatoryCompletion")
    value: 0
    canBuy: false
    boss:
      name: t("questDilatoryBoss")
      # We ran an average of progress{up,down} on users over 5 days: {up:805025,down:1324423}. /5*30 (we want the
      # event to last 30 days) = {hp:5mil,8mil}. Because Dilatory should cast Rage 3x during that time, 8mil/3=2.6mil (round up to 4)
      hp: 5000000
      str: 1
      def: 1
      rage:
        title: t("questDilatoryBossRageTitle")
        description: t("questDilatoryBossRageDescription")
        value: 4000000

        # special, they won't always look like this
        tavern:t('questDilatoryBossRageTavern')
        stables:t('questDilatoryBossRageStables')
        market:t('questDilatoryBossRageMarket')
    drop:
      items: [
        {type: 'pets', key: 'MantisShrimp-Base', text: t('questDilatoryDropMantisShrimpPet')}
        {type: 'mounts', key: 'MantisShrimp-Base', text: t('questDilatoryDropMantisShrimpMount')}

        {type: 'food', key: 'Meat', text: t('foodMeat')}
        {type: 'food', key: 'Milk', text: t('foodMilk')}
        {type: 'food', key: 'Potatoe', text: t('foodPotatoe')}
        {type: 'food', key: 'Strawberry', text: t('foodStrawberry')}
        {type: 'food', key: 'Chocolate', text: t('foodChocolate')}
        {type: 'food', key: 'Fish', text: t('foodFish')}
        {type: 'food', key: 'RottenMeat', text: t('foodRottenMeat')}
        {type: 'food', key: 'CottonCandyPink', text: t('foodCottonCandyPink')}
        {type: 'food', key: 'CottonCandyBlue', text: t('foodCottonCandyBlue')}
        {type: 'food', key: 'Honey', text: t('foodHoney')}
      ]
      gp: 0
      exp: 0

  stressbeast:
    text: t("questStressbeastText")
    notes: t("questStressbeastNotes")
    completion: t("questStressbeastCompletion")
    completionChat: t("questStressbeastCompletionChat")
    value: 0
    canBuy: false
    boss:
      name: t("questStressbeastBoss")
      hp: 2750000
      str: 1
      def: 1
      rage:
        title: t("questStressbeastBossRageTitle")
        description: t("questStressbeastBossRageDescription")
        value: 1450000
        healing: .3
        stables:t('questStressbeastBossRageStables')
        bailey:t('questStressbeastBossRageBailey')
        guide:t('questStressbeastBossRageGuide')
      desperation:
        threshold: 500000
        str: 3.5
        def: 2
        text:t('questStressbeastDesperation')
    drop:
      items: [
        {type: 'pets', key: 'Mammoth-Base', text: t('questStressbeastDropMammothPet')}
        {type: 'mounts', key: 'Mammoth-Base', text: t('questStressbeastDropMammothMount')}

        {type: 'food', key: 'Meat', text: t('foodMeat')}
        {type: 'food', key: 'Milk', text: t('foodMilk')}
        {type: 'food', key: 'Potatoe', text: t('foodPotatoe')}
        {type: 'food', key: 'Strawberry', text: t('foodStrawberry')}
        {type: 'food', key: 'Chocolate', text: t('foodChocolate')}
        {type: 'food', key: 'Fish', text: t('foodFish')}
        {type: 'food', key: 'RottenMeat', text: t('foodRottenMeat')}
        {type: 'food', key: 'CottonCandyPink', text: t('foodCottonCandyPink')}
        {type: 'food', key: 'CottonCandyBlue', text: t('foodCottonCandyBlue')}
        {type: 'food', key: 'Honey', text: t('foodHoney')}
      ]
      gp: 0
      exp: 0

  evilsanta:
    canBuy:false
    text: t('questEvilSantaText') # title of the quest (eg, Deep into Vice's Layer)
    notes: t('questEvilSantaNotes')
    completion: t('questEvilSantaCompletion')
    value: 4 # Gem cost to buy, GP sell-back
    #mechanic: enum['perfectDailies', ...]
    boss:
      name: t('questEvilSantaBoss') # name of the boss himself (eg, Vice)
      hp: 300
      str: 1 # Multiplier of users' missed dailies
    drop:
      items: [
        {type: 'mounts', key: 'BearCub-Polar', text: t('questEvilSantaDropBearCubPolarMount')}
      ]
      gp: 20
      exp: 100 # Exp bonus from defeating the boss

  evilsanta2:
    canBuy:false
    text: t('questEvilSanta2Text')
    notes: t('questEvilSanta2Notes')
    completion: t('questEvilSanta2Completion')
    value: 4
    previous: 'evilsanta'
    collect:
      tracks: text: t('questEvilSanta2CollectTracks'), count: 20
      branches: text: t('questEvilSanta2CollectBranches'), count: 10
    drop:
      items: [
        {type: 'pets', key: 'BearCub-Polar', text: t('questEvilSanta2DropBearCubPolarPet')}
      ]
      gp: 20
      exp: 100

  gryphon:
    text: t('questGryphonText')
    notes: t('questGryphonNotes')
    completion: t('questGryphonCompletion')
    value: 4 # Gem cost to buy, GP sell-back
    boss:
      name: t('questGryphonBoss') # name of the boss himself (eg, Vice)
      hp: 300
      str: 1.5 # Multiplier of users' missed dailies
    drop:
      items: [
        {type: 'eggs', key: 'Gryphon', text: t('questGryphonDropGryphonEgg')}
        {type: 'eggs', key: 'Gryphon', text: t('questGryphonDropGryphonEgg')}
        {type: 'eggs', key: 'Gryphon', text: t('questGryphonDropGryphonEgg')}
      ]
      gp: 25
      exp: 125
      unlock: t('questGryphonUnlockText')

  hedgehog:
    text: t('questHedgehogText')
    notes: t('questHedgehogNotes')
    completion: t('questHedgehogCompletion')
    value: 4 # Gem cost to buy, GP sell-back
    boss:
      name: t('questHedgehogBoss') # name of the boss himself (eg, Vice)
      hp: 400
      str: 1.25 # Multiplier of users' missed dailies
    drop:
      items: [
        {type: 'eggs', key: 'Hedgehog', text: t('questHedgehogDropHedgehogEgg')}
        {type: 'eggs', key: 'Hedgehog', text: t('questHedgehogDropHedgehogEgg')}
        {type: 'eggs', key: 'Hedgehog', text: t('questHedgehogDropHedgehogEgg')}
      ]
      gp: 30
      exp: 125
      unlock: t('questHedgehogUnlockText')

  ghost_stag:
    text: t('questGhostStagText')
    notes: t('questGhostStagNotes')
    completion: t('questGhostStagCompletion')
    value: 4
    boss:
      name: t('questGhostStagBoss')
      hp: 1200
      str: 2.5
    drop:
      items: [
        {type: 'eggs', key: 'Deer', text: t('questGhostStagDropDeerEgg')}
        {type: 'eggs', key: 'Deer', text: t('questGhostStagDropDeerEgg')}
        {type: 'eggs', key: 'Deer', text: t('questGhostStagDropDeerEgg')}
      ]
      gp: 80
      exp: 800
      unlock: t('questGhostStagUnlockText')

  vice1:
    text: t('questVice1Text')
    notes: t('questVice1Notes')
    value: 4
    lvl: 30
    boss:
      name: t('questVice1Boss')
      hp: 750
      str: 1.5
    drop:
      items: [
        {type: 'quests', key: "vice2", text: t('questVice1DropVice2Quest')}
      ]
      gp: 20
      exp: 100

  vice2:
    text: t('questVice2Text')
    notes: t('questVice2Notes')
    value: 4
    lvl: 35
    previous: 'vice1'
    collect:
      lightCrystal: text: t('questVice2CollectLightCrystal'), count: 45
    drop:
      items: [
        {type: 'quests', key: 'vice3', text: t('questVice2DropVice3Quest')}
      ]
      gp: 20
      exp: 75

  vice3:
    text: t('questVice3Text')
    notes: t('questVice3Notes')
    completion: t('questVice3Completion')
    previous: 'vice2'
    value: 4
    lvl: 40
    boss:
      name: t('questVice3Boss')
      hp: 1500
      str: 3
    drop:
      items: [
        {type: 'gear', key: "weapon_special_2", text: t('questVice3DropWeaponSpecial2')}
        {type: 'eggs', key: 'Dragon', text: t('questVice3DropDragonEgg')}
        {type: 'eggs', key: 'Dragon', text: t('questVice3DropDragonEgg')}
        {type: 'hatchingPotions', key: 'Shade', text: t('questVice3DropShadeHatchingPotion')}
        {type: 'hatchingPotions', key: 'Shade', text: t('questVice3DropShadeHatchingPotion')}
      ]
      gp: 100
      exp: 1000

  egg:
    text: t('questEggHuntText')
    notes: t('questEggHuntNotes')
    completion: t('questEggHuntCompletion')
    value: 1
    canBuy: false
    collect:
      plainEgg: text: t('questEggHuntCollectPlainEgg'), count: 100
    drop:
      items: [
        {type: 'eggs', key: 'Egg', text: t('questEggHuntDropPlainEgg')}
        {type: 'eggs', key: 'Egg', text: t('questEggHuntDropPlainEgg')}
        {type: 'eggs', key: 'Egg', text: t('questEggHuntDropPlainEgg')}
        {type: 'eggs', key: 'Egg', text: t('questEggHuntDropPlainEgg')}
        {type: 'eggs', key: 'Egg', text: t('questEggHuntDropPlainEgg')}
        {type: 'eggs', key: 'Egg', text: t('questEggHuntDropPlainEgg')}
        {type: 'eggs', key: 'Egg', text: t('questEggHuntDropPlainEgg')}
        {type: 'eggs', key: 'Egg', text: t('questEggHuntDropPlainEgg')}
        {type: 'eggs', key: 'Egg', text: t('questEggHuntDropPlainEgg')}
        {type: 'eggs', key: 'Egg', text: t('questEggHuntDropPlainEgg')}
      ]
      gp: 0
      exp: 0

  rat:
    text: t('questRatText')
    notes: t('questRatNotes')
    completion: t('questRatCompletion')
    value: 4
    boss:
      name: t('questRatBoss')
      hp: 1200
      str: 2.5
    drop:
      items: [
        {type: 'eggs', key: 'Rat', text: t('questRatDropRatEgg')}
        {type: 'eggs', key: 'Rat', text: t('questRatDropRatEgg')}
        {type: 'eggs', key: 'Rat', text: t('questRatDropRatEgg')}
      ]
      gp: 80
      exp: 800
      unlock: t('questRatUnlockText')

  octopus:
    text: t('questOctopusText')
    notes: t('questOctopusNotes')
    completion: t('questOctopusCompletion')
    value: 4
    boss:
      name: t('questOctopusBoss')
      hp: 1200
      str: 2.5
    drop:
      items: [
        {type: 'eggs', key: 'Octopus', text: t('questOctopusDropOctopusEgg')}
        {type: 'eggs', key: 'Octopus', text: t('questOctopusDropOctopusEgg')}
        {type: 'eggs', key: 'Octopus', text: t('questOctopusDropOctopusEgg')}
      ]
      gp: 80
      exp: 800
      unlock: t('questOctopusUnlockText')

  dilatory_derby:
    text:  t('questSeahorseText')
    notes: t('questSeahorseNotes')
    completion: t('questSeahorseCompletion')
    value: 4
    boss:
      name: t('questSeahorseBoss')
      hp: 300
      str: 1.5
    drop:
      items: [
        {type: 'eggs', key: 'Seahorse', text: t('questSeahorseDropSeahorseEgg')}
        {type: 'eggs', key: 'Seahorse', text: t('questSeahorseDropSeahorseEgg')}
        {type: 'eggs', key: 'Seahorse', text: t('questSeahorseDropSeahorseEgg')}
      ]
      gp: 25
      exp: 125
      unlock: t('questSeahorseUnlockText')

  atom1:
    text:  t('questAtom1Text')
    notes: t('questAtom1Notes')
    value: 4
    lvl: 15
    collect:
      soapBars: text: t('questAtom1CollectSoapBars'), count: 20
    drop:
      items: [
        {type: 'quests', key: "atom2", text: t('questAtom1Drop')}
      ]
      gp: 7
      exp: 50
  atom2:
    text:  t('questAtom2Text')
    notes: t('questAtom2Notes')
    previous: 'atom1'
    value: 4
    lvl: 15
    boss:
      name: t('questAtom2Boss')
      hp: 300
      str: 1
    drop:
      items: [
        {type: 'quests', key: "atom3", text: t('questAtom2Drop')}
      ]
      gp: 20
      exp: 100
  atom3:
    text:  t('questAtom3Text')
    notes: t('questAtom3Notes')
    previous: 'atom2'
    completion: t('questAtom3Completion')
    value: 4
    lvl: 15
    boss:
      name: t('questAtom3Boss')
      hp: 800
      str: 1.5
    drop:
      items: [
        {type: 'gear', key: "head_special_2", text: t('headSpecial2Text')}
        {type: 'hatchingPotions', key: "Base", text: t('questAtom3DropPotion')}
        {type: 'hatchingPotions', key: "Base", text: t('questAtom3DropPotion')}
      ]
      gp: 25
      exp: 125

  harpy:
    text:       t('questHarpyText')
    notes:      t('questHarpyNotes')
    completion: t('questHarpyCompletion')
    value: 4
    boss:
      name: t('questHarpyBoss')
      hp: 600
      str: 1.5
    drop:
      items: [
        {type: 'eggs', key: 'Parrot', text: t('questHarpyDropParrotEgg')}
        {type: 'eggs', key: 'Parrot', text: t('questHarpyDropParrotEgg')}
        {type: 'eggs', key: 'Parrot', text: t('questHarpyDropParrotEgg')}
      ]
      gp: 43
      exp: 350
      unlock: t('questHarpyUnlockText')

  rooster:
    text:       t('questRoosterText')
    notes:      t('questRoosterNotes')
    completion: t('questRoosterCompletion')
    value: 4
    boss:
      name: t('questRoosterBoss')
      hp: 300
      str: 1.5
    drop:
      items: [
        {type: 'eggs', key: 'Rooster', text: t('questRoosterDropRoosterEgg')}
        {type: 'eggs', key: 'Rooster', text: t('questRoosterDropRoosterEgg')}
        {type: 'eggs', key: 'Rooster', text: t('questRoosterDropRoosterEgg')}
      ]
      gp: 25
      exp: 125
      unlock: t('questRoosterUnlockText')

  spider:
    text:       t('questSpiderText')
    notes:      t('questSpiderNotes')
    completion: t('questSpiderCompletion')
    value: 4
    boss:
      name: t('questSpiderBoss')
      hp: 400
      str: 1.5
    drop:
      items: [
        {type: 'eggs', key: 'Spider', text: t('questSpiderDropSpiderEgg')}
        {type: 'eggs', key: 'Spider', text: t('questSpiderDropSpiderEgg')}
        {type: 'eggs', key: 'Spider', text: t('questSpiderDropSpiderEgg')}
      ]
      gp: 31
      exp: 200
      unlock: t('questSpiderUnlockText')

  moonstone1:
    text: t('questMoonstone1Text')
    notes: t('questMoonstone1Notes')
    value: 4
    lvl: 60
    collect:
      moonstone: text: t('questMoonstone1CollectMoonstone'), count: 500
    drop:
      items: [
        {type: 'quests', key: "moonstone2", text: t('questMoonstone1DropMoonstone2Quest')}
      ]
      gp: 50
      exp: 100
  moonstone2:
    text: t('questMoonstone2Text')
    notes: t('questMoonstone2Notes')
    value: 4
    lvl: 65
    previous: 'moonstone1'
    boss:
      name: t('questMoonstone2Boss')
      hp: 1500
      str: 3
    drop:
      items: [
        {type: 'quests', key: 'moonstone3', text: t('questMoonstone2DropMoonstone3Quest')}
      ]
      gp: 500
      exp: 1000
  moonstone3:
    text: t('questMoonstone3Text')
    notes: t('questMoonstone3Notes')
    completion: t('questMoonstone3Completion')
    previous: 'moonstone2'
    value: 4
    lvl: 70
    boss:
      name: t('questMoonstone3Boss')
      hp: 2000
      str: 3.5
    drop:
      items: [
        {type: 'gear', key: "armor_special_2", text: t('armorSpecial2Text')}
        {type: 'food', key: 'RottenMeat', text: t('questMoonstone3DropRottenMeat')}
        {type: 'food', key: 'RottenMeat', text: t('questMoonstone3DropRottenMeat')}
        {type: 'food', key: 'RottenMeat', text: t('questMoonstone3DropRottenMeat')}
        {type: 'food', key: 'RottenMeat', text: t('questMoonstone3DropRottenMeat')}
        {type: 'food', key: 'RottenMeat', text: t('questMoonstone3DropRottenMeat')}
        {type: 'hatchingPotions', key: 'Zombie', text: t('questMoonstone3DropZombiePotion')}
        {type: 'hatchingPotions', key: 'Zombie', text: t('questMoonstone3DropZombiePotion')}
        {type: 'hatchingPotions', key: 'Zombie', text: t('questMoonstone3DropZombiePotion')}
      ]
      gp: 900
      exp: 1500

  goldenknight1:
    text: t('questGoldenknight1Text')
    notes: t('questGoldenknight1Notes')
    value: 4
    lvl: 40
    collect:
      testimony: text: t('questGoldenknight1CollectTestimony'), count: 300
    drop:
      items: [
        {type: 'quests', key: "goldenknight2", text: t('questGoldenknight1DropGoldenknight2Quest')}
      ]
      gp: 15
      exp: 120
  goldenknight2:
    text: t('questGoldenknight2Text')
    notes: t('questGoldenknight2Notes')
    value: 4
    previous: 'goldenknight1'
    lvl: 45
    boss:
      name: t('questGoldenknight2Boss')
      hp: 1000
      str: 3
    drop:
      items: [
        {type: 'quests', key: 'goldenknight3', text: t('questGoldenknight2DropGoldenknight3Quest')}
      ]
      gp: 75
      exp: 750
  goldenknight3:
    text: t('questGoldenknight3Text')
    notes: t('questGoldenknight3Notes')
    completion: t('questGoldenknight3Completion')
    previous: 'goldenknight2'
    value: 4
    lvl: 50
    boss:
      name: t('questGoldenknight3Boss')
      hp: 1700
      str: 3.5
    drop:
      items: [
        {type: 'food', key: 'Honey', text: t('questGoldenknight3DropHoney')}
        {type: 'food', key: 'Honey', text: t('questGoldenknight3DropHoney')}
        {type: 'food', key: 'Honey', text: t('questGoldenknight3DropHoney')}
        {type: 'hatchingPotions', key: 'Golden', text: t('questGoldenknight3DropGoldenPotion')}
        {type: 'hatchingPotions', key: 'Golden', text: t('questGoldenknight3DropGoldenPotion')}
        {type: 'gear', key: 'shield_special_goldenknight', text: t('questGoldenknight3DropWeapon')}
      ]
      gp: 900
      exp: 1500

  basilist:
    text: t('questBasilistText')
    notes: t('questBasilistNotes')
    completion: t('questBasilistCompletion')
    canBuy: false
    value: 4
    boss:
      name: t('questBasilistBoss')
      hp: 100
      str: 0.5
    drop:
      gp: 8
      exp: 42

  owl:
    text: t('questOwlText')
    notes: t('questOwlNotes')
    completion: t('questOwlCompletion')
    value: 4
    boss:
      name: t('questOwlBoss')
      hp: 500
      str: 1.5
    drop:
      items: [
        {type: 'eggs', key: 'Owl', text: t('questOwlDropOwlEgg')}
        {type: 'eggs', key: 'Owl', text: t('questOwlDropOwlEgg')}
        {type: 'eggs', key: 'Owl', text: t('questOwlDropOwlEgg')}
      ]
      gp: 37
      exp: 275
      unlock: t('questOwlUnlockText')

  penguin:
    text: t('questPenguinText')
    notes: t('questPenguinNotes')
    completion: t('questPenguinCompletion')
    value: 4
    boss:
      name: t('questPenguinBoss')
      hp: 400
      str: 1.5
    drop:
      items: [
        {type: 'eggs', key: 'Penguin', text: t('questPenguinDropPenguinEgg')}
        {type: 'eggs', key: 'Penguin', text: t('questPenguinDropPenguinEgg')}
        {type: 'eggs', key: 'Penguin', text: t('questPenguinDropPenguinEgg')}
      ]
      gp: 31
      exp: 200
      unlock: t('questPenguinUnlockText')

  trex:
    text: t('questTRexText')
    notes: t('questTRexNotes')
    completion: t('questTRexCompletion')
    value: 4
    boss:
      name: t('questTRexBoss')
      hp: 800
      str: 2
    drop:
      items: [
        {type: 'eggs', key: 'TRex', text: t('questTRexDropTRexEgg')}
        {type: 'eggs', key: 'TRex', text: t('questTRexDropTRexEgg')}
        {type: 'eggs', key: 'TRex', text: t('questTRexDropTRexEgg')}
      ]
      gp: 55
      exp: 500
      unlock: t('questTRexUnlockText')

  trex_undead:
    text: t('questTRexUndeadText')
    notes: t('questTRexUndeadNotes')
    completion: t('questTRexUndeadCompletion')
    value: 4
    boss:
      name: t('questTRexUndeadBoss')
      hp: 500
      str: 2
      rage:
        title: t("questTRexUndeadRageTitle")
        description: t("questTRexUndeadRageDescription")
        value: 50
        healing: .3
        effect:t('questTRexUndeadRageEffect')
    drop:
      items: [
        {type: 'eggs', key: 'TRex', text: t('questTRexDropTRexEgg')}
        {type: 'eggs', key: 'TRex', text: t('questTRexDropTRexEgg')}
        {type: 'eggs', key: 'TRex', text: t('questTRexDropTRexEgg')}
      ]
      gp: 55
      exp: 500
      unlock: t('questTRexUnlockText')

  rock:
    text: t('questRockText')
    notes: t('questRockNotes')
    completion: t('questRockCompletion')
    value: 4
    boss:
      name: t('questRockBoss')
      hp: 400
      str: 1.5
    drop:
      items: [
        {type: 'eggs', key: 'Rock', text: t('questRockDropRockEgg')}
        {type: 'eggs', key: 'Rock', text: t('questRockDropRockEgg')}
        {type: 'eggs', key: 'Rock', text: t('questRockDropRockEgg')}
      ]
      gp: 31
      exp: 200
      unlock: t('questRockUnlockText')

  bunny:
    text: t('questBunnyText')
    notes: t('questBunnyNotes')
    completion: t('questBunnyCompletion')
    value: 4
    boss:
      name: t('questBunnyBoss')
      hp: 300
      str: 1.5
    drop:
      items: [
        {type: 'eggs', key: 'Bunny', text: t('questBunnyDropBunnyEgg')}
        {type: 'eggs', key: 'Bunny', text: t('questBunnyDropBunnyEgg')}
        {type: 'eggs', key: 'Bunny', text: t('questBunnyDropBunnyEgg')}
      ]
      gp: 25
      exp: 125
      unlock: t('questBunnyUnlockText')

  slime:
    text: t('questSlimeText')
    notes: t('questSlimeNotes')
    completion: t('questSlimeCompletion')
    value: 4
    boss:
      name: t('questSlimeBoss')
      hp: 400
      str: 1.5
    drop:
      items: [
        {type: 'eggs', key: 'Slime', text: t('questSlimeDropSlimeEgg')}
        {type: 'eggs', key: 'Slime', text: t('questSlimeDropSlimeEgg')}
        {type: 'eggs', key: 'Slime', text: t('questSlimeDropSlimeEgg')}
      ]
      gp: 31
      exp: 200
      unlock: t('questSlimeUnlockText')

_.each api.quests, (v,key) ->
  _.defaults v, {key,canBuy:true}
  b = v.boss
  if b
    _.defaults b, {str:1,def:1}
    if b.rage
      _.defaults b.rage, {title:t('bossRageTitle'),description:t('bossRageDescription')}

api.backgrounds =
  backgrounds062014:
    beach:
      text:  t('backgroundBeachText')
      notes: t('backgroundBeachNotes')
    fairy_ring:
      text:  t('backgroundFairyRingText')
      notes: t('backgroundFairyRingNotes')
    forest:
      text:  t('backgroundForestText')
      notes: t('backgroundForestNotes')
  backgrounds072014:
    open_waters:
      text:  t('backgroundOpenWatersText')
      notes: t('backgroundOpenWatersNotes')
    coral_reef:
      text:  t('backgroundCoralReefText')
      notes: t('backgroundCoralReefNotes')
    seafarer_ship:
      text:  t('backgroundSeafarerShipText')
      notes: t('backgroundSeafarerShipNotes')
  backgrounds082014:
    volcano:
      text:  t('backgroundVolcanoText')
      notes: t('backgroundVolcanoNotes')
    clouds:
      text:  t('backgroundCloudsText')
      notes: t('backgroundCloudsNotes')
    dusty_canyons:
      text:  t('backgroundDustyCanyonsText')
      notes: t('backgroundDustyCanyonsNotes')
  backgrounds092014:
    thunderstorm:
      text:  t('backgroundThunderstormText')
      notes: t('backgroundThunderstormNotes')
    autumn_forest:
      text:  t('backgroundAutumnForestText')
      notes: t('backgroundAutumnForestNotes')
    harvest_fields:
      text:  t('backgroundHarvestFieldsText')
      notes: t('backgroundHarvestFieldsNotes')
  backgrounds102014:
    graveyard:
      text:  t('backgroundGraveyardText')
      notes: t('backgroundGraveyardNotes')
    haunted_house:
      text:  t('backgroundHauntedHouseText')
      notes: t('backgroundHauntedHouseNotes')
    pumpkin_patch:
      text:  t('backgroundPumpkinPatchText')
      notes: t('backgroundPumpkinPatchNotes')
  backgrounds112014:
    harvest_feast:
      text:  t('backgroundHarvestFeastText')
      notes: t('backgroundHarvestFeastNotes')
    sunset_meadow:
      text:  t('backgroundSunsetMeadowText')
      notes: t('backgroundSunsetMeadowNotes')
    starry_skies:
      text:  t('backgroundStarrySkiesText')
      notes: t('backgroundStarrySkiesNotes')
  backgrounds122014:
    iceberg:
      text:  t('backgroundIcebergText')
      notes: t('backgroundIcebergNotes')
    twinkly_lights:
      text:  t('backgroundTwinklyLightsText')
      notes: t('backgroundTwinklyLightsNotes')
    south_pole:
      text:  t('backgroundSouthPoleText')
      notes: t('backgroundSouthPoleNotes')
  backgrounds012015:
    ice_cave:
      text: t('backgroundIceCaveText')
      notes: t('backgroundIceCaveNotes')
    frigid_peak:
      text: t('backgroundFrigidPeakText')
      notes: t('backgroundFrigidPeakNotes')
    snowy_pines:
      text: t('backgroundSnowyPinesText')
      notes: t('backgroundSnowyPinesNotes')
  backgrounds022015:
    blacksmithy:
      text: t('backgroundBlacksmithyText')
      notes: t('backgroundBlacksmithyNotes')
    crystal_cave:
      text: t('backgroundCrystalCaveText')
      notes: t('backgroundCrystalCaveNotes')
    distant_castle:
      text: t('backgroundDistantCastleText')
      notes: t('backgroundDistantCastleNotes')
  backgrounds032015:
    spring_rain:
      text: t('backgroundSpringRainText')
      notes: t('backgroundSpringRainNotes')
    stained_glass:
      text: t('backgroundStainedGlassText')
      notes: t('backgroundStainedGlassNotes')
    rolling_hills:
      text: t('backgroundRollingHillsText')
      notes: t('backgroundRollingHillsNotes')
  backgrounds042015:
    cherry_trees:
      text: t('backgroundCherryTreesText')
      notes: t('backgroundCherryTreesNotes')
    floral_meadow:
      text: t('backgroundFloralMeadowText')
      notes: t('backgroundFloralMeadowNotes')
    gumdrop_land:
      text: t('backgroundGumdropLandText')
      notes: t('backgroundGumdropLandNotes')

api.subscriptionBlocks =
  basic_earned: months:1, price:5
  basic_3mo: months:3, price:15
  basic_6mo: months:6, price:30
  google_6mo: months:6, price:24, discount:true, original:30
  basic_12mo: months:12, price:48
_.each api.subscriptionBlocks, (b,k)->b.key = k

repeat = {m:true,t:true,w:true,th:true,f:true,s:true,su:true}
api.userDefaults =
  habits: [
    {type: 'habit', text: t('defaultHabit1Text'), notes: t('defaultHabit1Notes'), value: 0, up: true, down: false, attribute: 'str' }
    {type: 'habit', text: t('defaultHabit2Text'), notes: t('defaultHabit2Notes'), value: 0, up: false, down: true, attribute: 'str'}
    {type: 'habit', text: t('defaultHabit3Text'), notes: t('defaultHabit3Notes'), value: 0, up: true, down: true, attribute: 'str'}
  ]

  dailys: [
#    {type: 'daily', text: t('defaultDaily1Text'), notes: t('defaultDaily1Notes'), value: 0, completed: false, repeat: repeat, attribute: 'per' }
#    {type: 'daily', text: t('defaultDaily2Text'), notes: t('defaultDaily2Notes'), value: 3, completed: false, repeat: repeat, attribute: 'con' }
#    {type: 'daily', text: t('defaultDaily3Text'), notes: t('defaultDaily3Notes'), value: -10, completed: false, repeat: repeat, attribute: 'int' }
#    {type: 'daily', text: t('defaultDaily4Text'), notes: t('defaultDaily4Notes'), checklist: [{completed: true, text: t('defaultDaily4Checklist1') }, {completed: false, text: t('defaultDaily4Checklist2')}, {completed: false, text: t('defaultDaily4Checklist3')}], completed: false, repeat: repeat, attribute: 'str' }
  ]

  todos: [
    {type: 'todo', text: t('defaultTodo1Text'), notes: t('defaultTodoNotes'), completed: false, attribute: 'int' }
#    {type: 'todo', text: t('defaultTodo2Text'), notes: t('defaultTodoNotes'), checklist: [{completed: false, text: t('defaultTodo2Checklist1') }, {completed: false, text: t('defaultTodo2Checklist2')}, {completed: false, text: t('defaultTodo2Checklist3')}], completed: false, attribute: 'per' }
#    {type: 'todo', text: t('defaultTodo3Text'), notes: t('defaultTodoNotes'), checklist: [{completed: false, text: t('defaultTodo3Checklist1') }, {completed: false, text: t('defaultTodo3Checklist2')}, {completed: false, text: t('defaultTodo3Checklist3')}], completed: false, attribute: 'per' }
#    {type: 'todo', text: t('defaultTodo4Text'), notes: t('defaultTodoNotes'), checklist: [{completed: false, text: t('defaultTodo4Checklist1') }, {completed: false, text: t('defaultTodo4Checklist2')}, {completed: false, text: t('defaultTodo4Checklist3')}], completed: false, attribute: 'per' }
#    {type: 'todo', text: t('defaultTodo5Text'), notes: t('defaultTodoNotes'), completed: false, attribute: 'per' }
  ]

  rewards: [
#    {type: 'reward', text: t('defaultReward1Text'), notes: t('defaultReward1Notes'), value: 20 }
#    {type: 'reward', text: t('defaultReward2Text'), notes: t('defaultReward2Notes'), value: 10 }
  ]

  tags: [
    {name: t('defaultTag1')}
    {name: t('defaultTag2')}
    {name: t('defaultTag3')}
  ]
