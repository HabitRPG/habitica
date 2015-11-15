var _, api, calculateBonus, diminishingReturns, gear, moment, t;

api = module.exports;

_ = require('lodash');

moment = require('moment');

t = require('./translation.js');

import {
  CLASSES,
  EVENTS,
  GEAR_TYPES,
} from './constants';


/*
  ---------------------------------------------------------------
  Gear (Weapons, Armor, Head, Shield)
  Item definitions: {index, text, notes, value, str, def, int, per, classes, type}
  ---------------------------------------------------------------
 */

api.mystery = {
  201402: {
    start: '2014-02-22',
    end: '2014-02-28',
    text: 'Winged Messenger Set'
  },
  201403: {
    start: '2014-03-24',
    end: '2014-04-02',
    text: 'Forest Walker Set'
  },
  201404: {
    start: '2014-04-24',
    end: '2014-05-02',
    text: 'Twilight Butterfly Set'
  },
  201405: {
    start: '2014-05-21',
    end: '2014-06-02',
    text: 'Flame Wielder Set'
  },
  201406: {
    start: '2014-06-23',
    end: '2014-07-02',
    text: 'Octomage Set'
  },
  201407: {
    start: '2014-07-23',
    end: '2014-08-02',
    text: 'Undersea Explorer Set'
  },
  201408: {
    start: '2014-08-23',
    end: '2014-09-02',
    text: 'Sun Sorcerer Set'
  },
  201409: {
    start: '2014-09-24',
    end: '2014-10-02',
    text: 'Autumn Strider Set'
  },
  201410: {
    start: '2014-10-24',
    end: '2014-11-02',
    text: 'Winged Goblin Set'
  },
  201411: {
    start: '2014-11-24',
    end: '2014-12-02',
    text: 'Feast and Fun Set'
  },
  201412: {
    start: '2014-12-25',
    end: '2015-01-02',
    text: 'Penguin Set'
  },
  201501: {
    start: '2015-01-26',
    end: '2015-02-02',
    text: 'Starry Knight Set'
  },
  201502: {
    start: '2015-02-24',
    end: '2015-03-02',
    text: 'Winged Enchanter Set'
  },
  201503: {
    start: '2015-03-25',
    end: '2015-04-02',
    text: 'Aquamarine Set'
  },
  201504: {
    start: '2015-04-24',
    end: '2015-05-02',
    text: 'Busy Bee Set'
  },
  201505: {
    start: '2015-05-25',
    end: '2015-06-02',
    text: 'Green Knight Set'
  },
  201506: {
    start: '2015-06-25',
    end: '2015-07-02',
    text: 'Neon Snorkeler Set'
  },
  201507: {
    start: '2015-07-24',
    end: '2015-08-02',
    text: 'Rad Surfer Set'
  },
  201508: {
    start: '2015-08-23',
    end: '2015-09-02',
    text: 'Cheetah Costume Set'
  },
  201509: {
    start: '2015-09-24',
    end: '2015-10-02',
    text: 'Werewolf Set'
  },
  201510: {
    start: '2015-10-26',
    end: '2015-11-02',
    text: 'Horned Goblin Set'
  },
  301404: {
    start: '3014-03-24',
    end: '3014-04-02',
    text: 'Steampunk Standard Set'
  },
  301405: {
    start: '3014-04-24',
    end: '3014-05-02',
    text: 'Steampunk Accessories Set'
  },
  wondercon: {
    start: '2014-03-24',
    end: '2014-04-01'
  }
};

_.each(api.mystery, function(v, k) {
  return v.key = k;
});

api.itemList = {
  'weapon': {
    localeKey: 'weapon',
    isEquipment: true
  },
  'armor': {
    localeKey: 'armor',
    isEquipment: true
  },
  'head': {
    localeKey: 'headgear',
    isEquipment: true
  },
  'shield': {
    localeKey: 'offhand',
    isEquipment: true
  },
  'back': {
    localeKey: 'back',
    isEquipment: true
  },
  'body': {
    localeKey: 'body',
    isEquipment: true
  },
  'headAccessory': {
    localeKey: 'headAccessory',
    isEquipment: true
  },
  'eyewear': {
    localeKey: 'eyewear',
    isEquipment: true
  },
  'hatchingPotions': {
    localeKey: 'hatchingPotion',
    isEquipment: false
  },
  'eggs': {
    localeKey: 'eggSingular',
    isEquipment: false
  },
  'quests': {
    localeKey: 'quest',
    isEquipment: false
  },
  'food': {
    localeKey: 'foodText',
    isEquipment: false
  },
  'Saddle': {
    localeKey: 'foodSaddleText',
    isEquipment: false
  }
};

gear = {
  weapon: {
    base: {
      0: {
        text: t('weaponBase0Text'),
        notes: t('weaponBase0Notes'),
        value: 0
      }
    },
    warrior: {
      0: {
        text: t('weaponWarrior0Text'),
        notes: t('weaponWarrior0Notes'),
        value: 1
      },
      1: {
        text: t('weaponWarrior1Text'),
        notes: t('weaponWarrior1Notes', {
          str: 3
        }),
        str: 3,
        value: 20
      },
      2: {
        text: t('weaponWarrior2Text'),
        notes: t('weaponWarrior2Notes', {
          str: 6
        }),
        str: 6,
        value: 30
      },
      3: {
        text: t('weaponWarrior3Text'),
        notes: t('weaponWarrior3Notes', {
          str: 9
        }),
        str: 9,
        value: 45
      },
      4: {
        text: t('weaponWarrior4Text'),
        notes: t('weaponWarrior4Notes', {
          str: 12
        }),
        str: 12,
        value: 65
      },
      5: {
        text: t('weaponWarrior5Text'),
        notes: t('weaponWarrior5Notes', {
          str: 15
        }),
        str: 15,
        value: 90
      },
      6: {
        text: t('weaponWarrior6Text'),
        notes: t('weaponWarrior6Notes', {
          str: 18
        }),
        str: 18,
        value: 120,
        last: true
      }
    },
    rogue: {
      0: {
        text: t('weaponRogue0Text'),
        notes: t('weaponRogue0Notes'),
        str: 0,
        value: 0
      },
      1: {
        text: t('weaponRogue1Text'),
        notes: t('weaponRogue1Notes', {
          str: 2
        }),
        str: 2,
        value: 20
      },
      2: {
        text: t('weaponRogue2Text'),
        notes: t('weaponRogue2Notes', {
          str: 3
        }),
        str: 3,
        value: 35
      },
      3: {
        text: t('weaponRogue3Text'),
        notes: t('weaponRogue3Notes', {
          str: 4
        }),
        str: 4,
        value: 50
      },
      4: {
        text: t('weaponRogue4Text'),
        notes: t('weaponRogue4Notes', {
          str: 6
        }),
        str: 6,
        value: 70
      },
      5: {
        text: t('weaponRogue5Text'),
        notes: t('weaponRogue5Notes', {
          str: 8
        }),
        str: 8,
        value: 90
      },
      6: {
        text: t('weaponRogue6Text'),
        notes: t('weaponRogue6Notes', {
          str: 10
        }),
        str: 10,
        value: 120,
        last: true
      }
    },
    wizard: {
      0: {
        twoHanded: true,
        text: t('weaponWizard0Text'),
        notes: t('weaponWizard0Notes'),
        value: 0
      },
      1: {
        twoHanded: true,
        text: t('weaponWizard1Text'),
        notes: t('weaponWizard1Notes', {
          int: 3,
          per: 1
        }),
        int: 3,
        per: 1,
        value: 30
      },
      2: {
        twoHanded: true,
        text: t('weaponWizard2Text'),
        notes: t('weaponWizard2Notes', {
          int: 6,
          per: 2
        }),
        int: 6,
        per: 2,
        value: 50
      },
      3: {
        twoHanded: true,
        text: t('weaponWizard3Text'),
        notes: t('weaponWizard3Notes', {
          int: 9,
          per: 3
        }),
        int: 9,
        per: 3,
        value: 80
      },
      4: {
        twoHanded: true,
        text: t('weaponWizard4Text'),
        notes: t('weaponWizard4Notes', {
          int: 12,
          per: 5
        }),
        int: 12,
        per: 5,
        value: 120
      },
      5: {
        twoHanded: true,
        text: t('weaponWizard5Text'),
        notes: t('weaponWizard5Notes', {
          int: 15,
          per: 7
        }),
        int: 15,
        per: 7,
        value: 160
      },
      6: {
        twoHanded: true,
        text: t('weaponWizard6Text'),
        notes: t('weaponWizard6Notes', {
          int: 18,
          per: 10
        }),
        int: 18,
        per: 10,
        value: 200,
        last: true
      }
    },
    healer: {
      0: {
        text: t('weaponHealer0Text'),
        notes: t('weaponHealer0Notes'),
        value: 0
      },
      1: {
        text: t('weaponHealer1Text'),
        notes: t('weaponHealer1Notes', {
          int: 2
        }),
        int: 2,
        value: 20
      },
      2: {
        text: t('weaponHealer2Text'),
        notes: t('weaponHealer2Notes', {
          int: 3
        }),
        int: 3,
        value: 30
      },
      3: {
        text: t('weaponHealer3Text'),
        notes: t('weaponHealer3Notes', {
          int: 5
        }),
        int: 5,
        value: 45
      },
      4: {
        text: t('weaponHealer4Text'),
        notes: t('weaponHealer4Notes', {
          int: 7
        }),
        int: 7,
        value: 65
      },
      5: {
        text: t('weaponHealer5Text'),
        notes: t('weaponHealer5Notes', {
          int: 9
        }),
        int: 9,
        value: 90
      },
      6: {
        text: t('weaponHealer6Text'),
        notes: t('weaponHealer6Notes', {
          int: 11
        }),
        int: 11,
        value: 120,
        last: true
      }
    },
    special: {
      0: {
        text: t('weaponSpecial0Text'),
        notes: t('weaponSpecial0Notes', {
          str: 20
        }),
        str: 20,
        value: 150,
        canOwn: (function(u) {
          var ref;
          return +((ref = u.backer) != null ? ref.tier : void 0) >= 70;
        })
      },
      1: {
        text: t('weaponSpecial1Text'),
        notes: t('weaponSpecial1Notes', {
          attrs: 6
        }),
        str: 6,
        per: 6,
        con: 6,
        int: 6,
        value: 170,
        canOwn: (function(u) {
          var ref;
          return +((ref = u.contributor) != null ? ref.level : void 0) >= 4;
        })
      },
      2: {
        text: t('weaponSpecial2Text'),
        notes: t('weaponSpecial2Notes', {
          attrs: 25
        }),
        str: 25,
        per: 25,
        value: 200,
        canOwn: (function(u) {
          var ref;
          return (+((ref = u.backer) != null ? ref.tier : void 0) >= 300) || (u.items.gear.owned.weapon_special_2 != null);
        })
      },
      3: {
        text: t('weaponSpecial3Text'),
        notes: t('weaponSpecial3Notes', {
          attrs: 17
        }),
        str: 17,
        int: 17,
        con: 17,
        value: 200,
        canOwn: (function(u) {
          var ref;
          return (+((ref = u.backer) != null ? ref.tier : void 0) >= 300) || (u.items.gear.owned.weapon_special_3 != null);
        })
      },
      critical: {
        text: t('weaponSpecialCriticalText'),
        notes: t('weaponSpecialCriticalNotes', {
          attrs: 40
        }),
        str: 40,
        per: 40,
        value: 200,
        canOwn: (function(u) {
          var ref;
          return !!((ref = u.contributor) != null ? ref.critical : void 0);
        })
      },
      tridentOfCrashingTides: {
        text: t('weaponSpecialTridentOfCrashingTidesText'),
        notes: t('weaponSpecialTridentOfCrashingTidesNotes', {
          int: 15
        }),
        int: 15,
        value: 130,
        canOwn: (function(u) {
          return u.items.gear.owned.weapon_special_tridentOfCrashingTides != null;
        })
      },
      yeti: {
        event: EVENTS.winter,
        specialClass: 'warrior',
        text: t('weaponSpecialYetiText'),
        notes: t('weaponSpecialYetiNotes', {
          str: 15
        }),
        str: 15,
        value: 90
      },
      ski: {
        event: EVENTS.winter,
        specialClass: 'rogue',
        text: t('weaponSpecialSkiText'),
        notes: t('weaponSpecialSkiNotes', {
          str: 8
        }),
        str: 8,
        value: 90
      },
      candycane: {
        event: EVENTS.winter,
        specialClass: 'wizard',
        twoHanded: true,
        text: t('weaponSpecialCandycaneText'),
        notes: t('weaponSpecialCandycaneNotes', {
          int: 15,
          per: 7
        }),
        int: 15,
        per: 7,
        value: 160
      },
      snowflake: {
        event: EVENTS.winter,
        specialClass: 'healer',
        text: t('weaponSpecialSnowflakeText'),
        notes: t('weaponSpecialSnowflakeNotes', {
          int: 9
        }),
        int: 9,
        value: 90
      },
      springRogue: {
        event: EVENTS.spring,
        specialClass: 'rogue',
        text: t('weaponSpecialSpringRogueText'),
        notes: t('weaponSpecialSpringRogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      springWarrior: {
        event: EVENTS.spring,
        specialClass: 'warrior',
        text: t('weaponSpecialSpringWarriorText'),
        notes: t('weaponSpecialSpringWarriorNotes', {
          str: 15
        }),
        value: 90,
        str: 15
      },
      springMage: {
        event: EVENTS.spring,
        specialClass: 'wizard',
        twoHanded: true,
        text: t('weaponSpecialSpringMageText'),
        notes: t('weaponSpecialSpringMageNotes', {
          int: 15,
          per: 7
        }),
        value: 160,
        int: 15,
        per: 7
      },
      springHealer: {
        event: EVENTS.spring,
        specialClass: 'healer',
        text: t('weaponSpecialSpringHealerText'),
        notes: t('weaponSpecialSpringHealerNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      summerRogue: {
        event: EVENTS.summer,
        specialClass: 'rogue',
        text: t('weaponSpecialSummerRogueText'),
        notes: t('weaponSpecialSummerRogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      summerWarrior: {
        event: EVENTS.summer,
        specialClass: 'warrior',
        text: t('weaponSpecialSummerWarriorText'),
        notes: t('weaponSpecialSummerWarriorNotes', {
          str: 15
        }),
        value: 90,
        str: 15
      },
      summerMage: {
        event: EVENTS.summer,
        specialClass: 'wizard',
        twoHanded: true,
        text: t('weaponSpecialSummerMageText'),
        notes: t('weaponSpecialSummerMageNotes', {
          int: 15,
          per: 7
        }),
        value: 160,
        int: 15,
        per: 7
      },
      summerHealer: {
        event: EVENTS.summer,
        specialClass: 'healer',
        text: t('weaponSpecialSummerHealerText'),
        notes: t('weaponSpecialSummerHealerNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      fallRogue: {
        event: EVENTS.fall,
        specialClass: 'rogue',
        text: t('weaponSpecialFallRogueText'),
        notes: t('weaponSpecialFallRogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8,
        canBuy: (function() {
          return true;
        })
      },
      fallWarrior: {
        event: EVENTS.fall,
        specialClass: 'warrior',
        text: t('weaponSpecialFallWarriorText'),
        notes: t('weaponSpecialFallWarriorNotes', {
          str: 15
        }),
        value: 90,
        str: 15,
        canBuy: (function() {
          return true;
        })
      },
      fallMage: {
        event: EVENTS.fall,
        specialClass: 'wizard',
        twoHanded: true,
        text: t('weaponSpecialFallMageText'),
        notes: t('weaponSpecialFallMageNotes', {
          int: 15,
          per: 7
        }),
        value: 160,
        int: 15,
        per: 7,
        canBuy: (function() {
          return true;
        })
      },
      fallHealer: {
        event: EVENTS.fall,
        specialClass: 'healer',
        text: t('weaponSpecialFallHealerText'),
        notes: t('weaponSpecialFallHealerNotes', {
          int: 9
        }),
        value: 90,
        int: 9,
        canBuy: (function() {
          return true;
        })
      },
      winter2015Rogue: {
        event: EVENTS.winter2015,
        specialClass: 'rogue',
        text: t('weaponSpecialWinter2015RogueText'),
        notes: t('weaponSpecialWinter2015RogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      winter2015Warrior: {
        event: EVENTS.winter2015,
        specialClass: 'warrior',
        text: t('weaponSpecialWinter2015WarriorText'),
        notes: t('weaponSpecialWinter2015WarriorNotes', {
          str: 15
        }),
        value: 90,
        str: 15
      },
      winter2015Mage: {
        event: EVENTS.winter2015,
        specialClass: 'wizard',
        twoHanded: true,
        text: t('weaponSpecialWinter2015MageText'),
        notes: t('weaponSpecialWinter2015MageNotes', {
          int: 15,
          per: 7
        }),
        value: 160,
        int: 15,
        per: 7
      },
      winter2015Healer: {
        event: EVENTS.winter2015,
        specialClass: 'healer',
        text: t('weaponSpecialWinter2015HealerText'),
        notes: t('weaponSpecialWinter2015HealerNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      spring2015Rogue: {
        event: EVENTS.spring2015,
        specialClass: 'rogue',
        text: t('weaponSpecialSpring2015RogueText'),
        notes: t('weaponSpecialSpring2015RogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      spring2015Warrior: {
        event: EVENTS.spring2015,
        specialClass: 'warrior',
        text: t('weaponSpecialSpring2015WarriorText'),
        notes: t('weaponSpecialSpring2015WarriorNotes', {
          str: 15
        }),
        value: 90,
        str: 15
      },
      spring2015Mage: {
        event: EVENTS.spring2015,
        specialClass: 'wizard',
        twoHanded: true,
        text: t('weaponSpecialSpring2015MageText'),
        notes: t('weaponSpecialSpring2015MageNotes', {
          int: 15,
          per: 7
        }),
        value: 160,
        int: 15,
        per: 7
      },
      spring2015Healer: {
        event: EVENTS.spring2015,
        specialClass: 'healer',
        text: t('weaponSpecialSpring2015HealerText'),
        notes: t('weaponSpecialSpring2015HealerNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      summer2015Rogue: {
        event: EVENTS.summer2015,
        specialClass: 'rogue',
        text: t('weaponSpecialSummer2015RogueText'),
        notes: t('weaponSpecialSummer2015RogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      summer2015Warrior: {
        event: EVENTS.summer2015,
        specialClass: 'warrior',
        text: t('weaponSpecialSummer2015WarriorText'),
        notes: t('weaponSpecialSummer2015WarriorNotes', {
          str: 15
        }),
        value: 90,
        str: 15
      },
      summer2015Mage: {
        event: EVENTS.summer2015,
        specialClass: 'wizard',
        twoHanded: true,
        text: t('weaponSpecialSummer2015MageText'),
        notes: t('weaponSpecialSummer2015MageNotes', {
          int: 15,
          per: 7
        }),
        value: 160,
        int: 15,
        per: 7
      },
      summer2015Healer: {
        event: EVENTS.summer2015,
        specialClass: 'healer',
        text: t('weaponSpecialSummer2015HealerText'),
        notes: t('weaponSpecialSummer2015HealerNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      fall2015Rogue: {
        event: EVENTS.fall2015,
        specialClass: 'rogue',
        text: t('weaponSpecialFall2015RogueText'),
        notes: t('weaponSpecialFall2015RogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      fall2015Warrior: {
        event: EVENTS.fall2015,
        specialClass: 'warrior',
        text: t('weaponSpecialFall2015WarriorText'),
        notes: t('weaponSpecialFall2015WarriorNotes', {
          str: 15
        }),
        value: 90,
        str: 15
      },
      fall2015Mage: {
        event: EVENTS.fall2015,
        specialClass: 'wizard',
        twoHanded: true,
        text: t('weaponSpecialFall2015MageText'),
        notes: t('weaponSpecialFall2015MageNotes', {
          int: 15,
          per: 7
        }),
        value: 160,
        int: 15,
        per: 7
      },
      fall2015Healer: {
        event: EVENTS.fall2015,
        specialClass: 'healer',
        text: t('weaponSpecialFall2015HealerText'),
        notes: t('weaponSpecialFall2015HealerNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      }
    },
    mystery: {
      201411: {
        text: t('weaponMystery201411Text'),
        notes: t('weaponMystery201411Notes'),
        mystery: '201411',
        value: 0
      },
      201502: {
        text: t('weaponMystery201502Text'),
        notes: t('weaponMystery201502Notes'),
        mystery: '201502',
        value: 0
      },
      201505: {
        text: t('weaponMystery201505Text'),
        notes: t('weaponMystery201505Notes'),
        mystery: '201505',
        value: 0
      },
      301404: {
        text: t('weaponMystery301404Text'),
        notes: t('weaponMystery301404Notes'),
        mystery: '301404',
        value: 0
      }
    },
    armoire: {
      basicCrossbow: {
        text: t('weaponArmoireBasicCrossbowText'),
        notes: t('weaponArmoireBasicCrossbowNotes', {
          str: 5,
          per: 5,
          con: 5
        }),
        value: 100,
        str: 5,
        per: 5,
        con: 5,
        canOwn: (function(u) {
          return u.items.gear.owned.weapon_armoire_basicCrossbow != null;
        })
      },
      lunarSceptre: {
        text: t('weaponArmoireLunarSceptreText'),
        notes: t('weaponArmoireLunarSceptreNotes', {
          con: 7,
          int: 7
        }),
        value: 100,
        con: 7,
        int: 7,
        set: 'soothing',
        canOwn: (function(u) {
          return u.items.gear.owned.weapon_armoire_lunarSceptre != null;
        })
      },
      rancherLasso: {
        twoHanded: true,
        text: t('weaponArmoireRancherLassoText'),
        notes: t('weaponArmoireRancherLassoNotes', {
          str: 5,
          per: 5,
          int: 5
        }),
        value: 100,
        str: 5,
        per: 5,
        int: 5,
        set: 'rancher',
        canOwn: (function(u) {
          return u.items.gear.owned.weapon_armoire_rancherLasso != null;
        })
      },
      mythmakerSword: {
        text: t('weaponArmoireMythmakerSwordText'),
        notes: t('weaponArmoireMythmakerSwordNotes', {
          attrs: 6
        }),
        value: 100,
        str: 6,
        per: 6,
        set: 'goldenToga',
        canOwn: (function(u) {
          return u.items.gear.owned.weapon_armoire_mythmakerSword != null;
        })
      },
      ironCrook: {
        text: t('weaponArmoireIronCrookText'),
        notes: t('weaponArmoireIronCrookNotes', {
          attrs: 7
        }),
        value: 100,
        str: 7,
        per: 7,
        set: 'hornedIron',
        canOwn: (function(u) {
          return u.items.gear.owned.weapon_armoire_ironCrook != null;
        })
      },
      goldWingStaff: {
        text: t('weaponArmoireGoldWingStaffText'),
        notes: t('weaponArmoireGoldWingStaffNotes', {
          attrs: 4
        }),
        value: 100,
        con: 4,
        int: 4,
        per: 4,
        str: 4,
        canOwn: (function(u) {
          return u.items.gear.owned.weapon_armoire_goldWingStaff != null;
        })
      },
      batWand: {
        text: t('weaponArmoireBatWandText'),
        notes: t('weaponArmoireBatWandNotes', {
          int: 10,
          per: 2
        }),
        value: 100,
        int: 10,
        per: 2,
        canOwn: (function(u) {
          return u.items.gear.owned.weapon_armoire_batWand != null;
        })
      },
      shepherdsCrook: {
        text: t('weaponArmoireShepherdsCrookText'),
        notes: t('weaponArmoireShepherdsCrookNotes', {
          con: 9
        }),
        value: 100,
        con: 9,
        set: 'shepherd',
        canOwn: (function(u) {
          return u.items.gear.owned.weapon_armoire_shepherdsCrook != null;
        })
      }
    }
  },
  armor: {
    base: {
      0: {
        text: t('armorBase0Text'),
        notes: t('armorBase0Notes'),
        value: 0
      }
    },
    warrior: {
      1: {
        text: t('armorWarrior1Text'),
        notes: t('armorWarrior1Notes', {
          con: 3
        }),
        con: 3,
        value: 30
      },
      2: {
        text: t('armorWarrior2Text'),
        notes: t('armorWarrior2Notes', {
          con: 5
        }),
        con: 5,
        value: 45
      },
      3: {
        text: t('armorWarrior3Text'),
        notes: t('armorWarrior3Notes', {
          con: 7
        }),
        con: 7,
        value: 65
      },
      4: {
        text: t('armorWarrior4Text'),
        notes: t('armorWarrior4Notes', {
          con: 9
        }),
        con: 9,
        value: 90
      },
      5: {
        text: t('armorWarrior5Text'),
        notes: t('armorWarrior5Notes', {
          con: 11
        }),
        con: 11,
        value: 120,
        last: true
      }
    },
    rogue: {
      1: {
        text: t('armorRogue1Text'),
        notes: t('armorRogue1Notes', {
          per: 6
        }),
        per: 6,
        value: 30
      },
      2: {
        text: t('armorRogue2Text'),
        notes: t('armorRogue2Notes', {
          per: 9
        }),
        per: 9,
        value: 45
      },
      3: {
        text: t('armorRogue3Text'),
        notes: t('armorRogue3Notes', {
          per: 12
        }),
        per: 12,
        value: 65
      },
      4: {
        text: t('armorRogue4Text'),
        notes: t('armorRogue4Notes', {
          per: 15
        }),
        per: 15,
        value: 90
      },
      5: {
        text: t('armorRogue5Text'),
        notes: t('armorRogue5Notes', {
          per: 18
        }),
        per: 18,
        value: 120,
        last: true
      }
    },
    wizard: {
      1: {
        text: t('armorWizard1Text'),
        notes: t('armorWizard1Notes', {
          int: 2
        }),
        int: 2,
        value: 30
      },
      2: {
        text: t('armorWizard2Text'),
        notes: t('armorWizard2Notes', {
          int: 4
        }),
        int: 4,
        value: 45
      },
      3: {
        text: t('armorWizard3Text'),
        notes: t('armorWizard3Notes', {
          int: 6
        }),
        int: 6,
        value: 65
      },
      4: {
        text: t('armorWizard4Text'),
        notes: t('armorWizard4Notes', {
          int: 9
        }),
        int: 9,
        value: 90
      },
      5: {
        text: t('armorWizard5Text'),
        notes: t('armorWizard5Notes', {
          int: 12
        }),
        int: 12,
        value: 120,
        last: true
      }
    },
    healer: {
      1: {
        text: t('armorHealer1Text'),
        notes: t('armorHealer1Notes', {
          con: 6
        }),
        con: 6,
        value: 30
      },
      2: {
        text: t('armorHealer2Text'),
        notes: t('armorHealer2Notes', {
          con: 9
        }),
        con: 9,
        value: 45
      },
      3: {
        text: t('armorHealer3Text'),
        notes: t('armorHealer3Notes', {
          con: 12
        }),
        con: 12,
        value: 65
      },
      4: {
        text: t('armorHealer4Text'),
        notes: t('armorHealer4Notes', {
          con: 15
        }),
        con: 15,
        value: 90
      },
      5: {
        text: t('armorHealer5Text'),
        notes: t('armorHealer5Notes', {
          con: 18
        }),
        con: 18,
        value: 120,
        last: true
      }
    },
    special: {
      0: {
        text: t('armorSpecial0Text'),
        notes: t('armorSpecial0Notes', {
          con: 20
        }),
        con: 20,
        value: 150,
        canOwn: (function(u) {
          var ref;
          return +((ref = u.backer) != null ? ref.tier : void 0) >= 45;
        })
      },
      1: {
        text: t('armorSpecial1Text'),
        notes: t('armorSpecial1Notes', {
          attrs: 6
        }),
        con: 6,
        str: 6,
        per: 6,
        int: 6,
        value: 170,
        canOwn: (function(u) {
          var ref;
          return +((ref = u.contributor) != null ? ref.level : void 0) >= 2;
        })
      },
      2: {
        text: t('armorSpecial2Text'),
        notes: t('armorSpecial2Notes', {
          attrs: 25
        }),
        int: 25,
        con: 25,
        value: 200,
        canOwn: (function(u) {
          var ref;
          return +((ref = u.backer) != null ? ref.tier : void 0) >= 300 || (u.items.gear.owned.armor_special_2 != null);
        })
      },
      finnedOceanicArmor: {
        text: t('armorSpecialFinnedOceanicArmorText'),
        notes: t('armorSpecialFinnedOceanicArmorNotes', {
          str: 15
        }),
        str: 15,
        value: 130,
        canOwn: (function(u) {
          return u.items.gear.owned.armor_special_finnedOceanicArmor != null;
        })
      },
      yeti: {
        event: EVENTS.winter,
        specialClass: 'warrior',
        text: t('armorSpecialYetiText'),
        notes: t('armorSpecialYetiNotes', {
          con: 9
        }),
        con: 9,
        value: 90
      },
      ski: {
        event: EVENTS.winter,
        specialClass: 'rogue',
        text: t('armorSpecialSkiText'),
        notes: t('armorSpecialSkiNotes', {
          per: 15
        }),
        per: 15,
        value: 90
      },
      candycane: {
        event: EVENTS.winter,
        specialClass: 'wizard',
        text: t('armorSpecialCandycaneText'),
        notes: t('armorSpecialCandycaneNotes', {
          int: 9
        }),
        int: 9,
        value: 90
      },
      snowflake: {
        event: EVENTS.winter,
        specialClass: 'healer',
        text: t('armorSpecialSnowflakeText'),
        notes: t('armorSpecialSnowflakeNotes', {
          con: 15
        }),
        con: 15,
        value: 90
      },
      birthday: {
        event: EVENTS.birthday,
        text: t('armorSpecialBirthdayText'),
        notes: t('armorSpecialBirthdayNotes'),
        value: 0
      },
      springRogue: {
        event: EVENTS.spring,
        specialClass: 'rogue',
        text: t('armorSpecialSpringRogueText'),
        notes: t('armorSpecialSpringRogueNotes', {
          per: 15
        }),
        value: 90,
        per: 15
      },
      springWarrior: {
        event: EVENTS.spring,
        specialClass: 'warrior',
        text: t('armorSpecialSpringWarriorText'),
        notes: t('armorSpecialSpringWarriorNotes', {
          con: 9
        }),
        value: 90,
        con: 9
      },
      springMage: {
        event: EVENTS.spring,
        specialClass: 'wizard',
        text: t('armorSpecialSpringMageText'),
        notes: t('armorSpecialSpringMageNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      springHealer: {
        event: EVENTS.spring,
        specialClass: 'healer',
        text: t('armorSpecialSpringHealerText'),
        notes: t('armorSpecialSpringHealerNotes', {
          con: 15
        }),
        value: 90,
        con: 15
      },
      summerRogue: {
        event: EVENTS.summer,
        specialClass: 'rogue',
        text: t('armorSpecialSummerRogueText'),
        notes: t('armorSpecialSummerRogueNotes', {
          per: 15
        }),
        value: 90,
        per: 15
      },
      summerWarrior: {
        event: EVENTS.summer,
        specialClass: 'warrior',
        text: t('armorSpecialSummerWarriorText'),
        notes: t('armorSpecialSummerWarriorNotes', {
          con: 9
        }),
        value: 90,
        con: 9
      },
      summerMage: {
        event: EVENTS.summer,
        specialClass: 'wizard',
        text: t('armorSpecialSummerMageText'),
        notes: t('armorSpecialSummerMageNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      summerHealer: {
        event: EVENTS.summer,
        specialClass: 'healer',
        text: t('armorSpecialSummerHealerText'),
        notes: t('armorSpecialSummerHealerNotes', {
          con: 15
        }),
        value: 90,
        con: 15
      },
      fallRogue: {
        event: EVENTS.fall,
        specialClass: 'rogue',
        text: t('armorSpecialFallRogueText'),
        notes: t('armorSpecialFallRogueNotes', {
          per: 15
        }),
        value: 90,
        per: 15,
        canBuy: (function() {
          return true;
        })
      },
      fallWarrior: {
        event: EVENTS.fall,
        specialClass: 'warrior',
        text: t('armorSpecialFallWarriorText'),
        notes: t('armorSpecialFallWarriorNotes', {
          con: 9
        }),
        value: 90,
        con: 9,
        canBuy: (function() {
          return true;
        })
      },
      fallMage: {
        event: EVENTS.fall,
        specialClass: 'wizard',
        text: t('armorSpecialFallMageText'),
        notes: t('armorSpecialFallMageNotes', {
          int: 9
        }),
        value: 90,
        int: 9,
        canBuy: (function() {
          return true;
        })
      },
      fallHealer: {
        event: EVENTS.fall,
        specialClass: 'healer',
        text: t('armorSpecialFallHealerText'),
        notes: t('armorSpecialFallHealerNotes', {
          con: 15
        }),
        value: 90,
        con: 15,
        canBuy: (function() {
          return true;
        })
      },
      winter2015Rogue: {
        event: EVENTS.winter2015,
        specialClass: 'rogue',
        text: t('armorSpecialWinter2015RogueText'),
        notes: t('armorSpecialWinter2015RogueNotes', {
          per: 15
        }),
        value: 90,
        per: 15
      },
      winter2015Warrior: {
        event: EVENTS.winter2015,
        specialClass: 'warrior',
        text: t('armorSpecialWinter2015WarriorText'),
        notes: t('armorSpecialWinter2015WarriorNotes', {
          con: 9
        }),
        value: 90,
        con: 9
      },
      winter2015Mage: {
        event: EVENTS.winter2015,
        specialClass: 'wizard',
        text: t('armorSpecialWinter2015MageText'),
        notes: t('armorSpecialWinter2015MageNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      winter2015Healer: {
        event: EVENTS.winter2015,
        specialClass: 'healer',
        text: t('armorSpecialWinter2015HealerText'),
        notes: t('armorSpecialWinter2015HealerNotes', {
          con: 15
        }),
        value: 90,
        con: 15
      },
      birthday2015: {
        text: t('armorSpecialBirthday2015Text'),
        notes: t('armorSpecialBirthday2015Notes'),
        value: 0,
        canOwn: (function(u) {
          return u.items.gear.owned.armor_special_birthday2015 != null;
        })
      },
      spring2015Rogue: {
        event: EVENTS.spring2015,
        specialClass: 'rogue',
        text: t('armorSpecialSpring2015RogueText'),
        notes: t('armorSpecialSpring2015RogueNotes', {
          per: 15
        }),
        value: 90,
        per: 15
      },
      spring2015Warrior: {
        event: EVENTS.spring2015,
        specialClass: 'warrior',
        text: t('armorSpecialSpring2015WarriorText'),
        notes: t('armorSpecialSpring2015WarriorNotes', {
          con: 9
        }),
        value: 90,
        con: 9
      },
      spring2015Mage: {
        event: EVENTS.spring2015,
        specialClass: 'wizard',
        text: t('armorSpecialSpring2015MageText'),
        notes: t('armorSpecialSpring2015MageNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      spring2015Healer: {
        event: EVENTS.spring2015,
        specialClass: 'healer',
        text: t('armorSpecialSpring2015HealerText'),
        notes: t('armorSpecialSpring2015HealerNotes', {
          con: 15
        }),
        value: 90,
        con: 15
      },
      summer2015Rogue: {
        event: EVENTS.summer2015,
        specialClass: 'rogue',
        text: t('armorSpecialSummer2015RogueText'),
        notes: t('armorSpecialSummer2015RogueNotes', {
          per: 15
        }),
        value: 90,
        per: 15
      },
      summer2015Warrior: {
        event: EVENTS.summer2015,
        specialClass: 'warrior',
        text: t('armorSpecialSummer2015WarriorText'),
        notes: t('armorSpecialSummer2015WarriorNotes', {
          con: 9
        }),
        value: 90,
        con: 9
      },
      summer2015Mage: {
        event: EVENTS.summer2015,
        specialClass: 'wizard',
        text: t('armorSpecialSummer2015MageText'),
        notes: t('armorSpecialSummer2015MageNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      summer2015Healer: {
        event: EVENTS.summer2015,
        specialClass: 'healer',
        text: t('armorSpecialSummer2015HealerText'),
        notes: t('armorSpecialSummer2015HealerNotes', {
          con: 15
        }),
        value: 90,
        con: 15
      },
      fall2015Rogue: {
        event: EVENTS.fall2015,
        specialClass: 'rogue',
        text: t('armorSpecialFall2015RogueText'),
        notes: t('armorSpecialFall2015RogueNotes', {
          per: 15
        }),
        value: 90,
        per: 15
      },
      fall2015Warrior: {
        event: EVENTS.fall2015,
        specialClass: 'warrior',
        text: t('armorSpecialFall2015WarriorText'),
        notes: t('armorSpecialFall2015WarriorNotes', {
          con: 9
        }),
        value: 90,
        con: 9
      },
      fall2015Mage: {
        event: EVENTS.fall2015,
        specialClass: 'wizard',
        text: t('armorSpecialFall2015MageText'),
        notes: t('armorSpecialFall2015MageNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      fall2015Healer: {
        event: EVENTS.fall2015,
        specialClass: 'healer',
        text: t('armorSpecialFall2015HealerText'),
        notes: t('armorSpecialFall2015HealerNotes', {
          con: 15
        }),
        value: 90,
        con: 15
      },
      gaymerx: {
        event: EVENTS.gaymerx,
        text: t('armorSpecialGaymerxText'),
        notes: t('armorSpecialGaymerxNotes'),
        value: 0
      }
    },
    mystery: {
      201402: {
        text: t('armorMystery201402Text'),
        notes: t('armorMystery201402Notes'),
        mystery: '201402',
        value: 0
      },
      201403: {
        text: t('armorMystery201403Text'),
        notes: t('armorMystery201403Notes'),
        mystery: '201403',
        value: 0
      },
      201405: {
        text: t('armorMystery201405Text'),
        notes: t('armorMystery201405Notes'),
        mystery: '201405',
        value: 0
      },
      201406: {
        text: t('armorMystery201406Text'),
        notes: t('armorMystery201406Notes'),
        mystery: '201406',
        value: 0
      },
      201407: {
        text: t('armorMystery201407Text'),
        notes: t('armorMystery201407Notes'),
        mystery: '201407',
        value: 0
      },
      201408: {
        text: t('armorMystery201408Text'),
        notes: t('armorMystery201408Notes'),
        mystery: '201408',
        value: 0
      },
      201409: {
        text: t('armorMystery201409Text'),
        notes: t('armorMystery201409Notes'),
        mystery: '201409',
        value: 0
      },
      201410: {
        text: t('armorMystery201410Text'),
        notes: t('armorMystery201410Notes'),
        mystery: '201410',
        value: 0
      },
      201412: {
        text: t('armorMystery201412Text'),
        notes: t('armorMystery201412Notes'),
        mystery: '201412',
        value: 0
      },
      201501: {
        text: t('armorMystery201501Text'),
        notes: t('armorMystery201501Notes'),
        mystery: '201501',
        value: 0
      },
      201503: {
        text: t('armorMystery201503Text'),
        notes: t('armorMystery201503Notes'),
        mystery: '201503',
        value: 0
      },
      201504: {
        text: t('armorMystery201504Text'),
        notes: t('armorMystery201504Notes'),
        mystery: '201504',
        value: 0
      },
      201506: {
        text: t('armorMystery201506Text'),
        notes: t('armorMystery201506Notes'),
        mystery: '201506',
        value: 0
      },
      201508: {
        text: t('armorMystery201508Text'),
        notes: t('armorMystery201508Notes'),
        mystery: '201508',
        value: 0
      },
      201509: {
        text: t('armorMystery201509Text'),
        notes: t('armorMystery201509Notes'),
        mystery: '201509',
        value: 0
      },
      301404: {
        text: t('armorMystery301404Text'),
        notes: t('armorMystery301404Notes'),
        mystery: '301404',
        value: 0
      }
    },
    armoire: {
      lunarArmor: {
        text: t('armorArmoireLunarArmorText'),
        notes: t('armorArmoireLunarArmorNotes', {
          str: 7,
          int: 7
        }),
        value: 100,
        str: 7,
        int: 7,
        set: 'soothing',
        canOwn: (function(u) {
          return u.items.gear.owned.armor_armoire_lunarArmor != null;
        })
      },
      gladiatorArmor: {
        text: t('armorArmoireGladiatorArmorText'),
        notes: t('armorArmoireGladiatorArmorNotes', {
          str: 7,
          per: 7
        }),
        value: 100,
        str: 7,
        per: 7,
        set: 'gladiator',
        canOwn: (function(u) {
          return u.items.gear.owned.armor_armoire_gladiatorArmor != null;
        })
      },
      rancherRobes: {
        text: t('armorArmoireRancherRobesText'),
        notes: t('armorArmoireRancherRobesNotes', {
          str: 5,
          per: 5,
          int: 5
        }),
        value: 100,
        str: 5,
        per: 5,
        int: 5,
        set: 'rancher',
        canOwn: (function(u) {
          return u.items.gear.owned.armor_armoire_rancherRobes != null;
        })
      },
      goldenToga: {
        text: t('armorArmoireGoldenTogaText'),
        notes: t('armorArmoireGoldenTogaNotes', {
          attrs: 8
        }),
        value: 100,
        str: 8,
        con: 8,
        set: 'goldenToga',
        canOwn: (function(u) {
          return u.items.gear.owned.armor_armoire_goldenToga != null;
        })
      },
      hornedIronArmor: {
        text: t('armorArmoireHornedIronArmorText'),
        notes: t('armorArmoireHornedIronArmorNotes', {
          con: 9,
          per: 7
        }),
        value: 100,
        con: 9,
        per: 7,
        set: 'hornedIron',
        canOwn: (function(u) {
          return u.items.gear.owned.armor_armoire_hornedIronArmor != null;
        })
      },
      plagueDoctorOvercoat: {
        text: t('armorArmoirePlagueDoctorOvercoatText'),
        notes: t('armorArmoirePlagueDoctorOvercoatNotes', {
          int: 6,
          str: 5,
          con: 6
        }),
        value: 100,
        int: 6,
        str: 5,
        con: 6,
        set: 'plagueDoctor',
        canOwn: (function(u) {
          return u.items.gear.owned.armor_armoire_plagueDoctorOvercoat != null;
        })
      },
      shepherdRobes: {
        text: t('armorArmoireShepherdRobesText'),
        notes: t('armorArmoireShepherdRobesNotes', {
          attrs: 9
        }),
        value: 100,
        str: 9,
        per: 9,
        set: 'shepherd',
        canOwn: (function(u) {
          return u.items.gear.owned.armor_armoire_shepherdRobes != null;
        })
      },
      royalRobes: {
        text: t('armorArmoireRoyalRobesText'),
        notes: t('armorArmoireRoyalRobesNotes', {
          attrs: 5
        }),
        value: 100,
        con: 5,
        per: 5,
        int: 5,
        set: 'royal',
        canOwn: (function(u) {
          return u.items.gear.owned.armor_armoire_royalRobes != null;
        })
      }
    }
  },
  head: {
    base: {
      0: {
        text: t('headBase0Text'),
        notes: t('headBase0Notes'),
        value: 0
      }
    },
    warrior: {
      1: {
        text: t('headWarrior1Text'),
        notes: t('headWarrior1Notes', {
          str: 2
        }),
        str: 2,
        value: 15
      },
      2: {
        text: t('headWarrior2Text'),
        notes: t('headWarrior2Notes', {
          str: 4
        }),
        str: 4,
        value: 25
      },
      3: {
        text: t('headWarrior3Text'),
        notes: t('headWarrior3Notes', {
          str: 6
        }),
        str: 6,
        value: 40
      },
      4: {
        text: t('headWarrior4Text'),
        notes: t('headWarrior4Notes', {
          str: 9
        }),
        str: 9,
        value: 60
      },
      5: {
        text: t('headWarrior5Text'),
        notes: t('headWarrior5Notes', {
          str: 12
        }),
        str: 12,
        value: 80,
        last: true
      }
    },
    rogue: {
      1: {
        text: t('headRogue1Text'),
        notes: t('headRogue1Notes', {
          per: 2
        }),
        per: 2,
        value: 15
      },
      2: {
        text: t('headRogue2Text'),
        notes: t('headRogue2Notes', {
          per: 4
        }),
        per: 4,
        value: 25
      },
      3: {
        text: t('headRogue3Text'),
        notes: t('headRogue3Notes', {
          per: 6
        }),
        per: 6,
        value: 40
      },
      4: {
        text: t('headRogue4Text'),
        notes: t('headRogue4Notes', {
          per: 9
        }),
        per: 9,
        value: 60
      },
      5: {
        text: t('headRogue5Text'),
        notes: t('headRogue5Notes', {
          per: 12
        }),
        per: 12,
        value: 80,
        last: true
      }
    },
    wizard: {
      1: {
        text: t('headWizard1Text'),
        notes: t('headWizard1Notes', {
          per: 2
        }),
        per: 2,
        value: 15
      },
      2: {
        text: t('headWizard2Text'),
        notes: t('headWizard2Notes', {
          per: 3
        }),
        per: 3,
        value: 25
      },
      3: {
        text: t('headWizard3Text'),
        notes: t('headWizard3Notes', {
          per: 5
        }),
        per: 5,
        value: 40
      },
      4: {
        text: t('headWizard4Text'),
        notes: t('headWizard4Notes', {
          per: 7
        }),
        per: 7,
        value: 60
      },
      5: {
        text: t('headWizard5Text'),
        notes: t('headWizard5Notes', {
          per: 10
        }),
        per: 10,
        value: 80,
        last: true
      }
    },
    healer: {
      1: {
        text: t('headHealer1Text'),
        notes: t('headHealer1Notes', {
          int: 2
        }),
        int: 2,
        value: 15
      },
      2: {
        text: t('headHealer2Text'),
        notes: t('headHealer2Notes', {
          int: 3
        }),
        int: 3,
        value: 25
      },
      3: {
        text: t('headHealer3Text'),
        notes: t('headHealer3Notes', {
          int: 5
        }),
        int: 5,
        value: 40
      },
      4: {
        text: t('headHealer4Text'),
        notes: t('headHealer4Notes', {
          int: 7
        }),
        int: 7,
        value: 60
      },
      5: {
        text: t('headHealer5Text'),
        notes: t('headHealer5Notes', {
          int: 9
        }),
        int: 9,
        value: 80,
        last: true
      }
    },
    special: {
      0: {
        text: t('headSpecial0Text'),
        notes: t('headSpecial0Notes', {
          int: 20
        }),
        int: 20,
        value: 150,
        canOwn: (function(u) {
          var ref;
          return +((ref = u.backer) != null ? ref.tier : void 0) >= 45;
        })
      },
      1: {
        text: t('headSpecial1Text'),
        notes: t('headSpecial1Notes', {
          attrs: 6
        }),
        con: 6,
        str: 6,
        per: 6,
        int: 6,
        value: 170,
        canOwn: (function(u) {
          var ref;
          return +((ref = u.contributor) != null ? ref.level : void 0) >= 3;
        })
      },
      2: {
        text: t('headSpecial2Text'),
        notes: t('headSpecial2Notes', {
          attrs: 25
        }),
        int: 25,
        str: 25,
        value: 200,
        canOwn: (function(u) {
          var ref;
          return (+((ref = u.backer) != null ? ref.tier : void 0) >= 300) || (u.items.gear.owned.head_special_2 != null);
        })
      },
      fireCoralCirclet: {
        text: t('headSpecialFireCoralCircletText'),
        notes: t('headSpecialFireCoralCircletNotes', {
          per: 15
        }),
        per: 15,
        value: 130,
        canOwn: (function(u) {
          return u.items.gear.owned.head_special_fireCoralCirclet != null;
        })
      },
      nye: {
        event: EVENTS.winter,
        text: t('headSpecialNyeText'),
        notes: t('headSpecialNyeNotes'),
        value: 0
      },
      yeti: {
        event: EVENTS.winter,
        specialClass: 'warrior',
        text: t('headSpecialYetiText'),
        notes: t('headSpecialYetiNotes', {
          str: 9
        }),
        str: 9,
        value: 60
      },
      ski: {
        event: EVENTS.winter,
        specialClass: 'rogue',
        text: t('headSpecialSkiText'),
        notes: t('headSpecialSkiNotes', {
          per: 9
        }),
        per: 9,
        value: 60
      },
      candycane: {
        event: EVENTS.winter,
        specialClass: 'wizard',
        text: t('headSpecialCandycaneText'),
        notes: t('headSpecialCandycaneNotes', {
          per: 7
        }),
        per: 7,
        value: 60
      },
      snowflake: {
        event: EVENTS.winter,
        specialClass: 'healer',
        text: t('headSpecialSnowflakeText'),
        notes: t('headSpecialSnowflakeNotes', {
          int: 7
        }),
        int: 7,
        value: 60
      },
      springRogue: {
        event: EVENTS.spring,
        specialClass: 'rogue',
        text: t('headSpecialSpringRogueText'),
        notes: t('headSpecialSpringRogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      springWarrior: {
        event: EVENTS.spring,
        specialClass: 'warrior',
        text: t('headSpecialSpringWarriorText'),
        notes: t('headSpecialSpringWarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      springMage: {
        event: EVENTS.spring,
        specialClass: 'wizard',
        text: t('headSpecialSpringMageText'),
        notes: t('headSpecialSpringMageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      springHealer: {
        event: EVENTS.spring,
        specialClass: 'healer',
        text: t('headSpecialSpringHealerText'),
        notes: t('headSpecialSpringHealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7
      },
      summerRogue: {
        event: EVENTS.summer,
        specialClass: 'rogue',
        text: t('headSpecialSummerRogueText'),
        notes: t('headSpecialSummerRogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      summerWarrior: {
        event: EVENTS.summer,
        specialClass: 'warrior',
        text: t('headSpecialSummerWarriorText'),
        notes: t('headSpecialSummerWarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      summerMage: {
        event: EVENTS.summer,
        specialClass: 'wizard',
        text: t('headSpecialSummerMageText'),
        notes: t('headSpecialSummerMageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      summerHealer: {
        event: EVENTS.summer,
        specialClass: 'healer',
        text: t('headSpecialSummerHealerText'),
        notes: t('headSpecialSummerHealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7
      },
      fallRogue: {
        event: EVENTS.fall,
        specialClass: 'rogue',
        text: t('headSpecialFallRogueText'),
        notes: t('headSpecialFallRogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9,
        canBuy: (function() {
          return true;
        })
      },
      fallWarrior: {
        event: EVENTS.fall,
        specialClass: 'warrior',
        text: t('headSpecialFallWarriorText'),
        notes: t('headSpecialFallWarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9,
        canBuy: (function() {
          return true;
        })
      },
      fallMage: {
        event: EVENTS.fall,
        specialClass: 'wizard',
        text: t('headSpecialFallMageText'),
        notes: t('headSpecialFallMageNotes', {
          per: 7
        }),
        value: 60,
        per: 7,
        canBuy: (function() {
          return true;
        })
      },
      fallHealer: {
        event: EVENTS.fall,
        specialClass: 'healer',
        text: t('headSpecialFallHealerText'),
        notes: t('headSpecialFallHealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7,
        canBuy: (function() {
          return true;
        })
      },
      winter2015Rogue: {
        event: EVENTS.winter2015,
        specialClass: 'rogue',
        text: t('headSpecialWinter2015RogueText'),
        notes: t('headSpecialWinter2015RogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      winter2015Warrior: {
        event: EVENTS.winter2015,
        specialClass: 'warrior',
        text: t('headSpecialWinter2015WarriorText'),
        notes: t('headSpecialWinter2015WarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      winter2015Mage: {
        event: EVENTS.winter2015,
        specialClass: 'wizard',
        text: t('headSpecialWinter2015MageText'),
        notes: t('headSpecialWinter2015MageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      winter2015Healer: {
        event: EVENTS.winter2015,
        specialClass: 'healer',
        text: t('headSpecialWinter2015HealerText'),
        notes: t('headSpecialWinter2015HealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7
      },
      nye2014: {
        text: t('headSpecialNye2014Text'),
        notes: t('headSpecialNye2014Notes'),
        value: 0,
        canOwn: (function(u) {
          return u.items.gear.owned.head_special_nye2014 != null;
        })
      },
      spring2015Rogue: {
        event: EVENTS.spring2015,
        specialClass: 'rogue',
        text: t('headSpecialSpring2015RogueText'),
        notes: t('headSpecialSpring2015RogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      spring2015Warrior: {
        event: EVENTS.spring2015,
        specialClass: 'warrior',
        text: t('headSpecialSpring2015WarriorText'),
        notes: t('headSpecialSpring2015WarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      spring2015Mage: {
        event: EVENTS.spring2015,
        specialClass: 'wizard',
        text: t('headSpecialSpring2015MageText'),
        notes: t('headSpecialSpring2015MageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      spring2015Healer: {
        event: EVENTS.spring2015,
        specialClass: 'healer',
        text: t('headSpecialSpring2015HealerText'),
        notes: t('headSpecialSpring2015HealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7
      },
      summer2015Rogue: {
        event: EVENTS.summer2015,
        specialClass: 'rogue',
        text: t('headSpecialSummer2015RogueText'),
        notes: t('headSpecialSummer2015RogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      summer2015Warrior: {
        event: EVENTS.summer2015,
        specialClass: 'warrior',
        text: t('headSpecialSummer2015WarriorText'),
        notes: t('headSpecialSummer2015WarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      summer2015Mage: {
        event: EVENTS.summer2015,
        specialClass: 'wizard',
        text: t('headSpecialSummer2015MageText'),
        notes: t('headSpecialSummer2015MageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      summer2015Healer: {
        event: EVENTS.summer2015,
        specialClass: 'healer',
        text: t('headSpecialSummer2015HealerText'),
        notes: t('headSpecialSummer2015HealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7
      },
      fall2015Rogue: {
        event: EVENTS.fall2015,
        specialClass: 'rogue',
        text: t('headSpecialFall2015RogueText'),
        notes: t('headSpecialFall2015RogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      fall2015Warrior: {
        event: EVENTS.fall2015,
        specialClass: 'warrior',
        text: t('headSpecialFall2015WarriorText'),
        notes: t('headSpecialFall2015WarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      fall2015Mage: {
        event: EVENTS.fall2015,
        specialClass: 'wizard',
        text: t('headSpecialFall2015MageText'),
        notes: t('headSpecialFall2015MageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      fall2015Healer: {
        event: EVENTS.fall2015,
        specialClass: 'healer',
        text: t('headSpecialFall2015HealerText'),
        notes: t('headSpecialFall2015HealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7
      },
      gaymerx: {
        event: EVENTS.gaymerx,
        text: t('headSpecialGaymerxText'),
        notes: t('headSpecialGaymerxNotes'),
        value: 0
      }
    },
    mystery: {
      201402: {
        text: t('headMystery201402Text'),
        notes: t('headMystery201402Notes'),
        mystery: '201402',
        value: 0
      },
      201405: {
        text: t('headMystery201405Text'),
        notes: t('headMystery201405Notes'),
        mystery: '201405',
        value: 0
      },
      201406: {
        text: t('headMystery201406Text'),
        notes: t('headMystery201406Notes'),
        mystery: '201406',
        value: 0
      },
      201407: {
        text: t('headMystery201407Text'),
        notes: t('headMystery201407Notes'),
        mystery: '201407',
        value: 0
      },
      201408: {
        text: t('headMystery201408Text'),
        notes: t('headMystery201408Notes'),
        mystery: '201408',
        value: 0
      },
      201411: {
        text: t('headMystery201411Text'),
        notes: t('headMystery201411Notes'),
        mystery: '201411',
        value: 0
      },
      201412: {
        text: t('headMystery201412Text'),
        notes: t('headMystery201412Notes'),
        mystery: '201412',
        value: 0
      },
      201501: {
        text: t('headMystery201501Text'),
        notes: t('headMystery201501Notes'),
        mystery: '201501',
        value: 0
      },
      201505: {
        text: t('headMystery201505Text'),
        notes: t('headMystery201505Notes'),
        mystery: '201505',
        value: 0
      },
      201508: {
        text: t('headMystery201508Text'),
        notes: t('headMystery201508Notes'),
        mystery: '201508',
        value: 0
      },
      201509: {
        text: t('headMystery201509Text'),
        notes: t('headMystery201509Notes'),
        mystery: '201509',
        value: 0
      },
      301404: {
        text: t('headMystery301404Text'),
        notes: t('headMystery301404Notes'),
        mystery: '301404',
        value: 0
      },
      301405: {
        text: t('headMystery301405Text'),
        notes: t('headMystery301405Notes'),
        mystery: '301405',
        value: 0
      }
    },
    armoire: {
      lunarCrown: {
        text: t('headArmoireLunarCrownText'),
        notes: t('headArmoireLunarCrownNotes', {
          con: 7,
          per: 7
        }),
        value: 100,
        con: 7,
        per: 7,
        set: 'soothing',
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_lunarCrown != null;
        })
      },
      redHairbow: {
        text: t('headArmoireRedHairbowText'),
        notes: t('headArmoireRedHairbowNotes', {
          str: 5,
          int: 5,
          con: 5
        }),
        value: 100,
        str: 5,
        int: 5,
        con: 5,
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_redHairbow != null;
        })
      },
      violetFloppyHat: {
        text: t('headArmoireVioletFloppyHatText'),
        notes: t('headArmoireVioletFloppyHatNotes', {
          per: 5,
          int: 5,
          con: 5
        }),
        value: 100,
        per: 5,
        int: 5,
        con: 5,
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_violetFloppyHat != null;
        })
      },
      gladiatorHelm: {
        text: t('headArmoireGladiatorHelmText'),
        notes: t('headArmoireGladiatorHelmNotes', {
          per: 7,
          int: 7
        }),
        value: 100,
        per: 7,
        int: 7,
        set: 'gladiator',
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_gladiatorHelm != null;
        })
      },
      rancherHat: {
        text: t('headArmoireRancherHatText'),
        notes: t('headArmoireRancherHatNotes', {
          str: 5,
          per: 5,
          int: 5
        }),
        value: 100,
        str: 5,
        per: 5,
        int: 5,
        set: 'rancher',
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_rancherHat != null;
        })
      },
      royalCrown: {
        text: t('headArmoireRoyalCrownText'),
        notes: t('headArmoireRoyalCrownNotes', {
          str: 10
        }),
        value: 100,
        str: 10,
        set: 'royal',
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_royalCrown != null;
        })
      },
      blueHairbow: {
        text: t('headArmoireBlueHairbowText'),
        notes: t('headArmoireBlueHairbowNotes', {
          per: 5,
          int: 5,
          con: 5
        }),
        value: 100,
        per: 5,
        int: 5,
        con: 5,
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_blueHairbow != null;
        })
      },
      goldenLaurels: {
        text: t('headArmoireGoldenLaurelsText'),
        notes: t('headArmoireGoldenLaurelsNotes', {
          attrs: 8
        }),
        value: 100,
        per: 8,
        con: 8,
        set: 'goldenToga',
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_goldenLaurels != null;
        })
      },
      hornedIronHelm: {
        text: t('headArmoireHornedIronHelmText'),
        notes: t('headArmoireHornedIronHelmNotes', {
          con: 9,
          str: 7
        }),
        value: 100,
        con: 9,
        str: 7,
        set: 'hornedIron',
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_hornedIronHelm != null;
        })
      },
      yellowHairbow: {
        text: t('headArmoireYellowHairbowText'),
        notes: t('headArmoireYellowHairbowNotes', {
          attrs: 5
        }),
        value: 100,
        int: 5,
        per: 5,
        str: 5,
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_yellowHairbow != null;
        })
      },
      redFloppyHat: {
        text: t('headArmoireRedFloppyHatText'),
        notes: t('headArmoireRedFloppyHatNotes', {
          attrs: 6
        }),
        value: 100,
        con: 6,
        int: 6,
        per: 6,
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_redFloppyHat != null;
        })
      },
      plagueDoctorHat: {
        text: t('headArmoirePlagueDoctorHatText'),
        notes: t('headArmoirePlagueDoctorHatNotes', {
          int: 5,
          str: 6,
          con: 5
        }),
        value: 100,
        int: 5,
        str: 6,
        con: 5,
        set: 'plagueDoctor',
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_plagueDoctorHat != null;
        })
      },
      blackCat: {
        text: t('headArmoireBlackCatText'),
        notes: t('headArmoireBlackCatNotes', {
          attrs: 9
        }),
        value: 100,
        int: 9,
        per: 9,
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_blackCat != null;
        })
      },
      orangeCat: {
        text: t('headArmoireOrangeCatText'),
        notes: t('headArmoireOrangeCatNotes', {
          attrs: 9
        }),
        value: 100,
        con: 9,
        str: 9,
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_orangeCat != null;
        })
      },
      blueFloppyHat: {
        text: t('headArmoireBlueFloppyHatText'),
        notes: t('headArmoireBlueFloppyHatNotes', {
          attrs: 7
        }),
        value: 100,
        per: 7,
        int: 7,
        con: 7,
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_blueFloppyHat != null;
        })
      },
      shepherdHeaddress: {
        text: t('headArmoireShepherdHeaddressText'),
        notes: t('headArmoireShepherdHeaddressNotes', {
          int: 9
        }),
        value: 100,
        int: 9,
        set: 'shepherd',
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_shepherdHeaddress != null;
        })
      }
    }
  },
  shield: {
    base: {
      0: {
        text: t('shieldBase0Text'),
        notes: t('shieldBase0Notes'),
        value: 0
      }
    },
    warrior: {
      1: {
        text: t('shieldWarrior1Text'),
        notes: t('shieldWarrior1Notes', {
          con: 2
        }),
        con: 2,
        value: 20
      },
      2: {
        text: t('shieldWarrior2Text'),
        notes: t('shieldWarrior2Notes', {
          con: 3
        }),
        con: 3,
        value: 35
      },
      3: {
        text: t('shieldWarrior3Text'),
        notes: t('shieldWarrior3Notes', {
          con: 5
        }),
        con: 5,
        value: 50
      },
      4: {
        text: t('shieldWarrior4Text'),
        notes: t('shieldWarrior4Notes', {
          con: 7
        }),
        con: 7,
        value: 70
      },
      5: {
        text: t('shieldWarrior5Text'),
        notes: t('shieldWarrior5Notes', {
          con: 9
        }),
        con: 9,
        value: 90,
        last: true
      }
    },
    rogue: {
      0: {
        text: t('weaponRogue0Text'),
        notes: t('weaponRogue0Notes'),
        str: 0,
        value: 0
      },
      1: {
        text: t('weaponRogue1Text'),
        notes: t('weaponRogue1Notes', {
          str: 2
        }),
        str: 2,
        value: 20
      },
      2: {
        text: t('weaponRogue2Text'),
        notes: t('weaponRogue2Notes', {
          str: 3
        }),
        str: 3,
        value: 35
      },
      3: {
        text: t('weaponRogue3Text'),
        notes: t('weaponRogue3Notes', {
          str: 4
        }),
        str: 4,
        value: 50
      },
      4: {
        text: t('weaponRogue4Text'),
        notes: t('weaponRogue4Notes', {
          str: 6
        }),
        str: 6,
        value: 70
      },
      5: {
        text: t('weaponRogue5Text'),
        notes: t('weaponRogue5Notes', {
          str: 8
        }),
        str: 8,
        value: 90
      },
      6: {
        text: t('weaponRogue6Text'),
        notes: t('weaponRogue6Notes', {
          str: 10
        }),
        str: 10,
        value: 120,
        last: true
      }
    },
    wizard: {},
    healer: {
      1: {
        text: t('shieldHealer1Text'),
        notes: t('shieldHealer1Notes', {
          con: 2
        }),
        con: 2,
        value: 20
      },
      2: {
        text: t('shieldHealer2Text'),
        notes: t('shieldHealer2Notes', {
          con: 4
        }),
        con: 4,
        value: 35
      },
      3: {
        text: t('shieldHealer3Text'),
        notes: t('shieldHealer3Notes', {
          con: 6
        }),
        con: 6,
        value: 50
      },
      4: {
        text: t('shieldHealer4Text'),
        notes: t('shieldHealer4Notes', {
          con: 9
        }),
        con: 9,
        value: 70
      },
      5: {
        text: t('shieldHealer5Text'),
        notes: t('shieldHealer5Notes', {
          con: 12
        }),
        con: 12,
        value: 90,
        last: true
      }
    },
    special: {
      0: {
        text: t('shieldSpecial0Text'),
        notes: t('shieldSpecial0Notes', {
          per: 20
        }),
        per: 20,
        value: 150,
        canOwn: (function(u) {
          var ref;
          return +((ref = u.backer) != null ? ref.tier : void 0) >= 45;
        })
      },
      1: {
        text: t('shieldSpecial1Text'),
        notes: t('shieldSpecial1Notes', {
          attrs: 6
        }),
        con: 6,
        str: 6,
        per: 6,
        int: 6,
        value: 170,
        canOwn: (function(u) {
          var ref;
          return +((ref = u.contributor) != null ? ref.level : void 0) >= 5;
        })
      },
      goldenknight: {
        text: t('shieldSpecialGoldenknightText'),
        notes: t('shieldSpecialGoldenknightNotes', {
          attrs: 25
        }),
        con: 25,
        per: 25,
        value: 200,
        canOwn: (function(u) {
          return u.items.gear.owned.shield_special_goldenknight != null;
        })
      },
      moonpearlShield: {
        text: t('shieldSpecialMoonpearlShieldText'),
        notes: t('shieldSpecialMoonpearlShieldNotes', {
          con: 15
        }),
        con: 15,
        value: 130,
        canOwn: (function(u) {
          return u.items.gear.owned.shield_special_moonpearlShield != null;
        })
      },
      yeti: {
        event: EVENTS.winter,
        specialClass: 'warrior',
        text: t('shieldSpecialYetiText'),
        notes: t('shieldSpecialYetiNotes', {
          con: 7
        }),
        con: 7,
        value: 70
      },
      ski: {
        event: EVENTS.winter,
        specialClass: 'rogue',
        text: t('weaponSpecialSkiText'),
        notes: t('weaponSpecialSkiNotes', {
          str: 8
        }),
        str: 8,
        value: 90
      },
      snowflake: {
        event: EVENTS.winter,
        specialClass: 'healer',
        text: t('shieldSpecialSnowflakeText'),
        notes: t('shieldSpecialSnowflakeNotes', {
          con: 9
        }),
        con: 9,
        value: 70
      },
      springRogue: {
        event: EVENTS.spring,
        specialClass: 'rogue',
        text: t('shieldSpecialSpringRogueText'),
        notes: t('shieldSpecialSpringRogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      springWarrior: {
        event: EVENTS.spring,
        specialClass: 'warrior',
        text: t('shieldSpecialSpringWarriorText'),
        notes: t('shieldSpecialSpringWarriorNotes', {
          con: 7
        }),
        value: 70,
        con: 7
      },
      springHealer: {
        event: EVENTS.spring,
        specialClass: 'healer',
        text: t('shieldSpecialSpringHealerText'),
        notes: t('shieldSpecialSpringHealerNotes', {
          con: 9
        }),
        value: 70,
        con: 9
      },
      summerRogue: {
        event: EVENTS.summer,
        specialClass: 'rogue',
        text: t('shieldSpecialSummerRogueText'),
        notes: t('shieldSpecialSummerRogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      summerWarrior: {
        event: EVENTS.summer,
        specialClass: 'warrior',
        text: t('shieldSpecialSummerWarriorText'),
        notes: t('shieldSpecialSummerWarriorNotes', {
          con: 7
        }),
        value: 70,
        con: 7
      },
      summerHealer: {
        event: EVENTS.summer,
        specialClass: 'healer',
        text: t('shieldSpecialSummerHealerText'),
        notes: t('shieldSpecialSummerHealerNotes', {
          con: 9
        }),
        value: 70,
        con: 9
      },
      fallRogue: {
        event: EVENTS.fall,
        specialClass: 'rogue',
        text: t('shieldSpecialFallRogueText'),
        notes: t('shieldSpecialFallRogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8,
        canBuy: (function() {
          return true;
        })
      },
      fallWarrior: {
        event: EVENTS.fall,
        specialClass: 'warrior',
        text: t('shieldSpecialFallWarriorText'),
        notes: t('shieldSpecialFallWarriorNotes', {
          con: 7
        }),
        value: 70,
        con: 7,
        canBuy: (function() {
          return true;
        })
      },
      fallHealer: {
        event: EVENTS.fall,
        specialClass: 'healer',
        text: t('shieldSpecialFallHealerText'),
        notes: t('shieldSpecialFallHealerNotes', {
          con: 9
        }),
        value: 70,
        con: 9,
        canBuy: (function() {
          return true;
        })
      },
      winter2015Rogue: {
        event: EVENTS.winter2015,
        specialClass: 'rogue',
        text: t('shieldSpecialWinter2015RogueText'),
        notes: t('shieldSpecialWinter2015RogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      winter2015Warrior: {
        event: EVENTS.winter2015,
        specialClass: 'warrior',
        text: t('shieldSpecialWinter2015WarriorText'),
        notes: t('shieldSpecialWinter2015WarriorNotes', {
          con: 7
        }),
        value: 70,
        con: 7
      },
      winter2015Healer: {
        event: EVENTS.winter2015,
        specialClass: 'healer',
        text: t('shieldSpecialWinter2015HealerText'),
        notes: t('shieldSpecialWinter2015HealerNotes', {
          con: 9
        }),
        value: 70,
        con: 9
      },
      spring2015Rogue: {
        event: EVENTS.spring2015,
        specialClass: 'rogue',
        text: t('shieldSpecialSpring2015RogueText'),
        notes: t('shieldSpecialSpring2015RogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      spring2015Warrior: {
        event: EVENTS.spring2015,
        specialClass: 'warrior',
        text: t('shieldSpecialSpring2015WarriorText'),
        notes: t('shieldSpecialSpring2015WarriorNotes', {
          con: 7
        }),
        value: 70,
        con: 7
      },
      spring2015Healer: {
        event: EVENTS.spring2015,
        specialClass: 'healer',
        text: t('shieldSpecialSpring2015HealerText'),
        notes: t('shieldSpecialSpring2015HealerNotes', {
          con: 9
        }),
        value: 70,
        con: 9
      },
      summer2015Rogue: {
        event: EVENTS.summer2015,
        specialClass: 'rogue',
        text: t('shieldSpecialSummer2015RogueText'),
        notes: t('shieldSpecialSummer2015RogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      summer2015Warrior: {
        event: EVENTS.summer2015,
        specialClass: 'warrior',
        text: t('shieldSpecialSummer2015WarriorText'),
        notes: t('shieldSpecialSummer2015WarriorNotes', {
          con: 7
        }),
        value: 70,
        con: 7
      },
      summer2015Healer: {
        event: EVENTS.summer2015,
        specialClass: 'healer',
        text: t('shieldSpecialSummer2015HealerText'),
        notes: t('shieldSpecialSummer2015HealerNotes', {
          con: 9
        }),
        value: 70,
        con: 9
      },
      fall2015Rogue: {
        event: EVENTS.fall2015,
        specialClass: 'rogue',
        text: t('shieldSpecialFall2015RogueText'),
        notes: t('shieldSpecialFall2015RogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      fall2015Warrior: {
        event: EVENTS.fall2015,
        specialClass: 'warrior',
        text: t('shieldSpecialFall2015WarriorText'),
        notes: t('shieldSpecialFall2015WarriorNotes', {
          con: 7
        }),
        value: 70,
        con: 7
      },
      fall2015Healer: {
        event: EVENTS.fall2015,
        specialClass: 'healer',
        text: t('shieldSpecialFall2015HealerText'),
        notes: t('shieldSpecialFall2015HealerNotes', {
          con: 9
        }),
        value: 70,
        con: 9
      }
    },
    mystery: {
      301405: {
        text: t('shieldMystery301405Text'),
        notes: t('shieldMystery301405Notes'),
        mystery: '301405',
        value: 0
      }
    },
    armoire: {
      gladiatorShield: {
        text: t('shieldArmoireGladiatorShieldText'),
        notes: t('shieldArmoireGladiatorShieldNotes', {
          con: 5,
          str: 5
        }),
        value: 100,
        con: 5,
        str: 5,
        set: 'gladiator',
        canOwn: (function(u) {
          return u.items.gear.owned.shield_armoire_gladiatorShield != null;
        })
      },
      midnightShield: {
        text: t('shieldArmoireMidnightShieldText'),
        notes: t('shieldArmoireMidnightShieldNotes', {
          con: 10,
          str: 2
        }),
        value: 100,
        con: 10,
        str: 2,
        canOwn: (function(u) {
          return u.items.gear.owned.shield_armoire_midnightShield != null;
        })
      },
      royalCane: {
        text: t('shieldArmoireRoyalCaneText'),
        notes: t('shieldArmoireRoyalCaneNotes', {
          attrs: 5
        }),
        value: 100,
        con: 5,
        int: 5,
        per: 5,
        set: 'royal',
        canOwn: (function(u) {
          return u.items.gear.owned.shield_armoire_royalCane != null;
        })
      }
    }
  },
  back: {
    base: {
      0: {
        text: t('backBase0Text'),
        notes: t('backBase0Notes'),
        value: 0
      }
    },
    mystery: {
      201402: {
        text: t('backMystery201402Text'),
        notes: t('backMystery201402Notes'),
        mystery: '201402',
        value: 0
      },
      201404: {
        text: t('backMystery201404Text'),
        notes: t('backMystery201404Notes'),
        mystery: '201404',
        value: 0
      },
      201410: {
        text: t('backMystery201410Text'),
        notes: t('backMystery201410Notes'),
        mystery: '201410',
        value: 0
      },
      201504: {
        text: t('backMystery201504Text'),
        notes: t('backMystery201504Notes'),
        mystery: '201504',
        value: 0
      },
      201507: {
        text: t('backMystery201507Text'),
        notes: t('backMystery201507Notes'),
        mystery: '201507',
        value: 0
      },
      201510: {
        text: t('backMystery201510Text'),
        notes: t('backMystery201510Notes'),
        mystery: '201510',
        value: 0
      }
    },
    special: {
      wondercon_red: {
        text: t('backSpecialWonderconRedText'),
        notes: t('backSpecialWonderconRedNotes'),
        value: 0,
        mystery: 'wondercon'
      },
      wondercon_black: {
        text: t('backSpecialWonderconBlackText'),
        notes: t('backSpecialWonderconBlackNotes'),
        value: 0,
        mystery: 'wondercon'
      }
    }
  },
  body: {
    base: {
      0: {
        text: t('bodyBase0Text'),
        notes: t('bodyBase0Notes'),
        value: 0
      }
    },
    special: {
      wondercon_red: {
        text: t('bodySpecialWonderconRedText'),
        notes: t('bodySpecialWonderconRedNotes'),
        value: 0,
        mystery: 'wondercon'
      },
      wondercon_gold: {
        text: t('bodySpecialWonderconGoldText'),
        notes: t('bodySpecialWonderconGoldNotes'),
        value: 0,
        mystery: 'wondercon'
      },
      wondercon_black: {
        text: t('bodySpecialWonderconBlackText'),
        notes: t('bodySpecialWonderconBlackNotes'),
        value: 0,
        mystery: 'wondercon'
      },
      summerHealer: {
        event: EVENTS.summer,
        specialClass: 'healer',
        text: t('bodySpecialSummerHealerText'),
        notes: t('bodySpecialSummerHealerNotes'),
        value: 20
      },
      summerMage: {
        event: EVENTS.summer,
        specialClass: 'wizard',
        text: t('bodySpecialSummerMageText'),
        notes: t('bodySpecialSummerMageNotes'),
        value: 20
      },
      summer2015Healer: {
        event: EVENTS.summer2015,
        specialClass: 'healer',
        text: t('bodySpecialSummer2015HealerText'),
        notes: t('bodySpecialSummer2015HealerNotes'),
        value: 20
      },
      summer2015Mage: {
        event: EVENTS.summer2015,
        specialClass: 'wizard',
        text: t('bodySpecialSummer2015MageText'),
        notes: t('bodySpecialSummer2015MageNotes'),
        value: 20
      },
      summer2015Rogue: {
        event: EVENTS.summer2015,
        specialClass: 'rogue',
        text: t('bodySpecialSummer2015RogueText'),
        notes: t('bodySpecialSummer2015RogueNotes'),
        value: 20
      },
      summer2015Warrior: {
        event: EVENTS.summer2015,
        specialClass: 'warrior',
        text: t('bodySpecialSummer2015WarriorText'),
        notes: t('bodySpecialSummer2015WarriorNotes'),
        value: 20
      }
    }
  },
  headAccessory: {
    base: {
      0: {
        text: t('headAccessoryBase0Text'),
        notes: t('headAccessoryBase0Notes'),
        value: 0,
        last: true
      }
    },
    special: {
      springRogue: {
        event: EVENTS.spring,
        specialClass: 'rogue',
        text: t('headAccessorySpecialSpringRogueText'),
        notes: t('headAccessorySpecialSpringRogueNotes'),
        value: 20
      },
      springWarrior: {
        event: EVENTS.spring,
        specialClass: 'warrior',
        text: t('headAccessorySpecialSpringWarriorText'),
        notes: t('headAccessorySpecialSpringWarriorNotes'),
        value: 20
      },
      springMage: {
        event: EVENTS.spring,
        specialClass: 'wizard',
        text: t('headAccessorySpecialSpringMageText'),
        notes: t('headAccessorySpecialSpringMageNotes'),
        value: 20
      },
      springHealer: {
        event: EVENTS.spring,
        specialClass: 'healer',
        text: t('headAccessorySpecialSpringHealerText'),
        notes: t('headAccessorySpecialSpringHealerNotes'),
        value: 20
      },
      spring2015Rogue: {
        event: EVENTS.spring2015,
        specialClass: 'rogue',
        text: t('headAccessorySpecialSpring2015RogueText'),
        notes: t('headAccessorySpecialSpring2015RogueNotes'),
        value: 20
      },
      spring2015Warrior: {
        event: EVENTS.spring2015,
        specialClass: 'warrior',
        text: t('headAccessorySpecialSpring2015WarriorText'),
        notes: t('headAccessorySpecialSpring2015WarriorNotes'),
        value: 20
      },
      spring2015Mage: {
        event: EVENTS.spring2015,
        specialClass: 'wizard',
        text: t('headAccessorySpecialSpring2015MageText'),
        notes: t('headAccessorySpecialSpring2015MageNotes'),
        value: 20
      },
      spring2015Healer: {
        event: EVENTS.spring2015,
        specialClass: 'healer',
        text: t('headAccessorySpecialSpring2015HealerText'),
        notes: t('headAccessorySpecialSpring2015HealerNotes'),
        value: 20
      },
      bearEars: {
        gearSet: 'animal',
        text: t('headAccessoryBearEarsText'),
        notes: t('headAccessoryBearEarsNotes'),
        value: 20,
        canOwn: (function(u) {
          return u.items.gear.owned.headAccessory_special_bearEars != null;
        }),
        canBuy: (function() {
          return true;
        })
      },
      cactusEars: {
        gearSet: 'animal',
        text: t('headAccessoryCactusEarsText'),
        notes: t('headAccessoryCactusEarsNotes'),
        value: 20,
        canOwn: (function(u) {
          return u.items.gear.owned.headAccessory_special_cactusEars != null;
        }),
        canBuy: (function() {
          return true;
        })
      },
      foxEars: {
        gearSet: 'animal',
        text: t('headAccessoryFoxEarsText'),
        notes: t('headAccessoryFoxEarsNotes'),
        value: 20,
        canOwn: (function(u) {
          return u.items.gear.owned.headAccessory_special_foxEars != null;
        }),
        canBuy: (function() {
          return true;
        })
      },
      lionEars: {
        gearSet: 'animal',
        text: t('headAccessoryLionEarsText'),
        notes: t('headAccessoryLionEarsNotes'),
        value: 20,
        canOwn: (function(u) {
          return u.items.gear.owned.headAccessory_special_lionEars != null;
        }),
        canBuy: (function() {
          return true;
        })
      },
      pandaEars: {
        gearSet: 'animal',
        text: t('headAccessoryPandaEarsText'),
        notes: t('headAccessoryPandaEarsNotes'),
        value: 20,
        canOwn: (function(u) {
          return u.items.gear.owned.headAccessory_special_pandaEars != null;
        }),
        canBuy: (function() {
          return true;
        })
      },
      pigEars: {
        gearSet: 'animal',
        text: t('headAccessoryPigEarsText'),
        notes: t('headAccessoryPigEarsNotes'),
        value: 20,
        canOwn: (function(u) {
          return u.items.gear.owned.headAccessory_special_pigEars != null;
        }),
        canBuy: (function() {
          return true;
        })
      },
      tigerEars: {
        gearSet: 'animal',
        text: t('headAccessoryTigerEarsText'),
        notes: t('headAccessoryTigerEarsNotes'),
        value: 20,
        canOwn: (function(u) {
          return u.items.gear.owned.headAccessory_special_tigerEars != null;
        }),
        canBuy: (function() {
          return true;
        })
      },
      wolfEars: {
        gearSet: 'animal',
        text: t('headAccessoryWolfEarsText'),
        notes: t('headAccessoryWolfEarsNotes'),
        value: 20,
        canOwn: (function(u) {
          return u.items.gear.owned.headAccessory_special_wolfEars != null;
        }),
        canBuy: (function() {
          return true;
        })
      }
    },
    mystery: {
      201403: {
        text: t('headAccessoryMystery201403Text'),
        notes: t('headAccessoryMystery201403Notes'),
        mystery: '201403',
        value: 0
      },
      201404: {
        text: t('headAccessoryMystery201404Text'),
        notes: t('headAccessoryMystery201404Notes'),
        mystery: '201404',
        value: 0
      },
      201409: {
        text: t('headAccessoryMystery201409Text'),
        notes: t('headAccessoryMystery201409Notes'),
        mystery: '201409',
        value: 0
      },
      201502: {
        text: t('headAccessoryMystery201502Text'),
        notes: t('headAccessoryMystery201502Notes'),
        mystery: '201502',
        value: 0
      },
      201510: {
        text: t('headAccessoryMystery201510Text'),
        notes: t('headAccessoryMystery201510Notes'),
        mystery: '201510',
        value: 0
      },
      301405: {
        text: t('headAccessoryMystery301405Text'),
        notes: t('headAccessoryMystery301405Notes'),
        mystery: '301405',
        value: 0
      }
    }
  },
  eyewear: {
    base: {
      0: {
        text: t('eyewearBase0Text'),
        notes: t('eyewearBase0Notes'),
        value: 0,
        last: true
      }
    },
    special: {
      wondercon_red: {
        text: t('eyewearSpecialWonderconRedText'),
        notes: t('eyewearSpecialWonderconRedNotes'),
        value: 0,
        mystery: 'wondercon'
      },
      wondercon_black: {
        text: t('eyewearSpecialWonderconBlackText'),
        notes: t('eyewearSpecialWonderconBlackNotes'),
        value: 0,
        mystery: 'wondercon'
      },
      summerRogue: {
        event: EVENTS.summer,
        specialClass: 'rogue',
        text: t('eyewearSpecialSummerRogueText'),
        notes: t('eyewearSpecialSummerRogueNotes'),
        value: 20
      },
      summerWarrior: {
        event: EVENTS.summer,
        specialClass: 'warrior',
        text: t('eyewearSpecialSummerWarriorText'),
        notes: t('eyewearSpecialSummerWarriorNotes'),
        value: 20
      }
    },
    mystery: {
      201503: {
        text: t('eyewearMystery201503Text'),
        notes: t('eyewearMystery201503Notes'),
        mystery: '201503',
        value: 0
      },
      201506: {
        text: t('eyewearMystery201506Text'),
        notes: t('eyewearMystery201506Notes'),
        mystery: '201506',
        value: 0
      },
      201507: {
        text: t('eyewearMystery201507Text'),
        notes: t('eyewearMystery201507Notes'),
        mystery: '201507',
        value: 0
      },
      301404: {
        text: t('eyewearMystery301404Text'),
        notes: t('eyewearMystery301404Notes'),
        mystery: '301404',
        value: 0
      },
      301405: {
        text: t('eyewearMystery301405Text'),
        notes: t('eyewearMystery301405Notes'),
        mystery: '301405',
        value: 0
      }
    },
    armoire: {
      plagueDoctorMask: {
        text: t('eyewearArmoirePlagueDoctorMaskText'),
        notes: t('eyewearArmoirePlagueDoctorMaskNotes'),
        value: 100,
        set: 'plagueDoctor',
        canOwn: (function(u) {
          return u.items.gear.owned.eyewear_armoire_plagueDoctorMask != null;
        })
      }
    }
  }
};


/*
  The gear is exported as a tree (defined above), and a flat list (eg, {weapon_healer_1: .., shield_special_0: ...}) since
  they are needed in different forms at different points in the app
 */

api.gear = {
  tree: gear,
  flat: {}
};

_.each(GEAR_TYPES, function(type) {
  return _.each(CLASSES.concat(['base', 'special', 'mystery', 'armoire']), function(klass) {
    return _.each(gear[type][klass], function(item, i) {
      var _canOwn, key;
      key = type + "_" + klass + "_" + i;
      _.defaults(item, {
        type: type,
        key: key,
        klass: klass,
        index: i,
        str: 0,
        int: 0,
        per: 0,
        con: 0,
        canBuy: (function() {
          return false;
        })
      });
      if (item.event) {
        _canOwn = item.canOwn || (function() {
          return true;
        });
        item.canOwn = function(u) {
          return _canOwn(u) && ((u.items.gear.owned[key] != null) || (moment().isAfter(item.event.start) && moment().isBefore(item.event.end))) && (item.specialClass ? u.stats["class"] === item.specialClass : true);
        };
      }
      if (item.mystery) {
        item.canOwn = function(u) {
          return u.items.gear.owned[key] != null;
        };
      }
      return api.gear.flat[key] = item;
    });
  });
});


/*
  Time Traveler Store, mystery sets need their items mapped in
 */

_.each(api.mystery, function(v, k) {
  return v.items = _.where(api.gear.flat, {
    mystery: k
  });
});

api.timeTravelerStore = function(owned) {
  var ownedKeys;
  ownedKeys = _.keys((typeof owned.toObject === "function" ? owned.toObject() : void 0) || owned);
  return _.reduce(api.mystery, function(m, v, k) {
    if (k === 'wondercon' || ~ownedKeys.indexOf(v.items[0].key)) {
      return m;
    }
    m[k] = v;
    return m;
  }, {});
};


/*
  ---------------------------------------------------------------
  Unique Rewards: Potion and Armoire
  ---------------------------------------------------------------
 */

api.potion = {
  type: 'potion',
  text: t('potionText'),
  notes: t('potionNotes'),
  value: 25,
  key: 'potion'
};

api.armoire = {
  type: 'armoire',
  text: t('armoireText'),
  notes: (function(user, count) {
    if (user.flags.armoireEmpty) {
      return t('armoireNotesEmpty')();
    }
    return t('armoireNotesFull')() + count;
  }),
  value: 100,
  key: 'armoire',
  canOwn: (function(u) {
    return _.contains(u.achievements.ultimateGearSets, true);
  })
};


/*
   ---------------------------------------------------------------
   Classes
   ---------------------------------------------------------------
 */

api.classes = CLASSES;


/*
   ---------------------------------------------------------------
   Gear Types
   ---------------------------------------------------------------
 */

api.gearTypes = GEAR_TYPES;


/*
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
 */

diminishingReturns = function(bonus, max, halfway) {
  if (halfway == null) {
    halfway = max / 2;
  }
  return max * (bonus / (bonus + halfway));
};

calculateBonus = function(value, stat, crit, stat_scale) {
  if (crit == null) {
    crit = 1;
  }
  if (stat_scale == null) {
    stat_scale = 0.5;
  }
  return (value < 0 ? 1 : value + 1) + (stat * stat_scale * crit);
};

api.spells = {
  wizard: {
    fireball: {
      text: t('spellWizardFireballText'),
      mana: 10,
      lvl: 11,
      target: 'task',
      notes: t('spellWizardFireballNotes'),
      cast: function(user, target) {
        var base, bonus, req;
        bonus = user._statsComputed.int * user.fns.crit('per');
        bonus *= Math.ceil((target.value < 0 ? 1 : target.value + 1) * .075);
        user.stats.exp += diminishingReturns(bonus, 75);
        if ((base = user.party.quest.progress).up == null) {
          base.up = 0;
        }
        user.party.quest.progress.up += Math.ceil(user._statsComputed.int * .1);
        req = {
          language: user.preferences.language
        };
        return user.fns.updateStats(user.stats, req);
      }
    },
    mpheal: {
      text: t('spellWizardMPHealText'),
      mana: 30,
      lvl: 12,
      target: 'party',
      notes: t('spellWizardMPHealNotes'),
      cast: function(user, target) {
        return _.each(target, function(member) {
          var bonus;
          bonus = user._statsComputed.int;
          if (user._id !== member._id) {
            return member.stats.mp += Math.ceil(diminishingReturns(bonus, 25, 125));
          }
        });
      }
    },
    earth: {
      text: t('spellWizardEarthText'),
      mana: 35,
      lvl: 13,
      target: 'party',
      notes: t('spellWizardEarthNotes'),
      cast: function(user, target) {
        return _.each(target, function(member) {
          var base, bonus;
          bonus = user._statsComputed.int - user.stats.buffs.int;
          if ((base = member.stats.buffs).int == null) {
            base.int = 0;
          }
          return member.stats.buffs.int += Math.ceil(diminishingReturns(bonus, 30, 200));
        });
      }
    },
    frost: {
      text: t('spellWizardFrostText'),
      mana: 40,
      lvl: 14,
      target: 'self',
      notes: t('spellWizardFrostNotes'),
      cast: function(user, target) {
        return user.stats.buffs.streaks = true;
      }
    }
  },
  warrior: {
    smash: {
      text: t('spellWarriorSmashText'),
      mana: 10,
      lvl: 11,
      target: 'task',
      notes: t('spellWarriorSmashNotes'),
      cast: function(user, target) {
        var base, bonus;
        bonus = user._statsComputed.str * user.fns.crit('con');
        target.value += diminishingReturns(bonus, 2.5, 35);
        if ((base = user.party.quest.progress).up == null) {
          base.up = 0;
        }
        return user.party.quest.progress.up += diminishingReturns(bonus, 55, 70);
      }
    },
    defensiveStance: {
      text: t('spellWarriorDefensiveStanceText'),
      mana: 25,
      lvl: 12,
      target: 'self',
      notes: t('spellWarriorDefensiveStanceNotes'),
      cast: function(user, target) {
        var base, bonus;
        bonus = user._statsComputed.con - user.stats.buffs.con;
        if ((base = user.stats.buffs).con == null) {
          base.con = 0;
        }
        return user.stats.buffs.con += Math.ceil(diminishingReturns(bonus, 40, 200));
      }
    },
    valorousPresence: {
      text: t('spellWarriorValorousPresenceText'),
      mana: 20,
      lvl: 13,
      target: 'party',
      notes: t('spellWarriorValorousPresenceNotes'),
      cast: function(user, target) {
        return _.each(target, function(member) {
          var base, bonus;
          bonus = user._statsComputed.str - user.stats.buffs.str;
          if ((base = member.stats.buffs).str == null) {
            base.str = 0;
          }
          return member.stats.buffs.str += Math.ceil(diminishingReturns(bonus, 20, 200));
        });
      }
    },
    intimidate: {
      text: t('spellWarriorIntimidateText'),
      mana: 15,
      lvl: 14,
      target: 'party',
      notes: t('spellWarriorIntimidateNotes'),
      cast: function(user, target) {
        return _.each(target, function(member) {
          var base, bonus;
          bonus = user._statsComputed.con - user.stats.buffs.con;
          if ((base = member.stats.buffs).con == null) {
            base.con = 0;
          }
          return member.stats.buffs.con += Math.ceil(diminishingReturns(bonus, 24, 200));
        });
      }
    }
  },
  rogue: {
    pickPocket: {
      text: t('spellRoguePickPocketText'),
      mana: 10,
      lvl: 11,
      target: 'task',
      notes: t('spellRoguePickPocketNotes'),
      cast: function(user, target) {
        var bonus;
        bonus = calculateBonus(target.value, user._statsComputed.per);
        return user.stats.gp += diminishingReturns(bonus, 25, 75);
      }
    },
    backStab: {
      text: t('spellRogueBackStabText'),
      mana: 15,
      lvl: 12,
      target: 'task',
      notes: t('spellRogueBackStabNotes'),
      cast: function(user, target) {
        var _crit, bonus, req;
        _crit = user.fns.crit('str', .3);
        bonus = calculateBonus(target.value, user._statsComputed.str, _crit);
        user.stats.exp += diminishingReturns(bonus, 75, 50);
        user.stats.gp += diminishingReturns(bonus, 18, 75);
        req = {
          language: user.preferences.language
        };
        return user.fns.updateStats(user.stats, req);
      }
    },
    toolsOfTrade: {
      text: t('spellRogueToolsOfTradeText'),
      mana: 25,
      lvl: 13,
      target: 'party',
      notes: t('spellRogueToolsOfTradeNotes'),
      cast: function(user, target) {
        return _.each(target, function(member) {
          var base, bonus;
          bonus = user._statsComputed.per - user.stats.buffs.per;
          if ((base = member.stats.buffs).per == null) {
            base.per = 0;
          }
          return member.stats.buffs.per += Math.ceil(diminishingReturns(bonus, 100, 50));
        });
      }
    },
    stealth: {
      text: t('spellRogueStealthText'),
      mana: 45,
      lvl: 14,
      target: 'self',
      notes: t('spellRogueStealthNotes'),
      cast: function(user, target) {
        var base;
        if ((base = user.stats.buffs).stealth == null) {
          base.stealth = 0;
        }
        return user.stats.buffs.stealth += Math.ceil(diminishingReturns(user._statsComputed.per, user.dailys.length * 0.64, 55));
      }
    }
  },
  healer: {
    heal: {
      text: t('spellHealerHealText'),
      mana: 15,
      lvl: 11,
      target: 'self',
      notes: t('spellHealerHealNotes'),
      cast: function(user, target) {
        user.stats.hp += (user._statsComputed.con + user._statsComputed.int + 5) * .075;
        if (user.stats.hp > 50) {
          return user.stats.hp = 50;
        }
      }
    },
    brightness: {
      text: t('spellHealerBrightnessText'),
      mana: 15,
      lvl: 12,
      target: 'self',
      notes: t('spellHealerBrightnessNotes'),
      cast: function(user, target) {
        return _.each(user.tasks, function(target) {
          if (target.type === 'reward') {
            return;
          }
          return target.value += 4 * (user._statsComputed.int / (user._statsComputed.int + 40));
        });
      }
    },
    protectAura: {
      text: t('spellHealerProtectAuraText'),
      mana: 30,
      lvl: 13,
      target: 'party',
      notes: t('spellHealerProtectAuraNotes'),
      cast: function(user, target) {
        return _.each(target, function(member) {
          var base, bonus;
          bonus = user._statsComputed.con - user.stats.buffs.con;
          if ((base = member.stats.buffs).con == null) {
            base.con = 0;
          }
          return member.stats.buffs.con += Math.ceil(diminishingReturns(bonus, 200, 200));
        });
      }
    },
    heallAll: {
      text: t('spellHealerHealAllText'),
      mana: 25,
      lvl: 14,
      target: 'party',
      notes: t('spellHealerHealAllNotes'),
      cast: function(user, target) {
        return _.each(target, function(member) {
          member.stats.hp += (user._statsComputed.con + user._statsComputed.int + 5) * .04;
          if (member.stats.hp > 50) {
            return member.stats.hp = 50;
          }
        });
      }
    }
  },
  special: {
    snowball: {
      text: t('spellSpecialSnowballAuraText'),
      mana: 0,
      value: 15,
      target: 'user',
      notes: t('spellSpecialSnowballAuraNotes'),
      cast: function(user, target) {
        var base;
        target.stats.buffs.snowball = true;
        target.stats.buffs.spookDust = false;
        target.stats.buffs.shinySeed = false;
        target.stats.buffs.seafoam = false;
        if ((base = target.achievements).snowball == null) {
          base.snowball = 0;
        }
        target.achievements.snowball++;
        return user.items.special.snowball--;
      }
    },
    salt: {
      text: t('spellSpecialSaltText'),
      mana: 0,
      value: 5,
      immediateUse: true,
      target: 'self',
      notes: t('spellSpecialSaltNotes'),
      cast: function(user, target) {
        user.stats.buffs.snowball = false;
        return user.stats.gp -= 5;
      }
    },
    spookDust: {
      text: t('spellSpecialSpookDustText'),
      mana: 0,
      value: 15,
      target: 'user',
      notes: t('spellSpecialSpookDustNotes'),
      cast: function(user, target) {
        var base;
        target.stats.buffs.snowball = false;
        target.stats.buffs.spookDust = true;
        target.stats.buffs.shinySeed = false;
        target.stats.buffs.seafoam = false;
        if ((base = target.achievements).spookDust == null) {
          base.spookDust = 0;
        }
        target.achievements.spookDust++;
        return user.items.special.spookDust--;
      }
    },
    opaquePotion: {
      text: t('spellSpecialOpaquePotionText'),
      mana: 0,
      value: 5,
      immediateUse: true,
      target: 'self',
      notes: t('spellSpecialOpaquePotionNotes'),
      cast: function(user, target) {
        user.stats.buffs.spookDust = false;
        return user.stats.gp -= 5;
      }
    },
    shinySeed: {
      text: t('spellSpecialShinySeedText'),
      mana: 0,
      value: 15,
      target: 'user',
      notes: t('spellSpecialShinySeedNotes'),
      cast: function(user, target) {
        var base;
        target.stats.buffs.snowball = false;
        target.stats.buffs.spookDust = false;
        target.stats.buffs.shinySeed = true;
        target.stats.buffs.seafoam = false;
        if ((base = target.achievements).shinySeed == null) {
          base.shinySeed = 0;
        }
        target.achievements.shinySeed++;
        return user.items.special.shinySeed--;
      }
    },
    petalFreePotion: {
      text: t('spellSpecialPetalFreePotionText'),
      mana: 0,
      value: 5,
      immediateUse: true,
      target: 'self',
      notes: t('spellSpecialPetalFreePotionNotes'),
      cast: function(user, target) {
        user.stats.buffs.shinySeed = false;
        return user.stats.gp -= 5;
      }
    },
    seafoam: {
      text: t('spellSpecialSeafoamText'),
      mana: 0,
      value: 15,
      target: 'user',
      notes: t('spellSpecialSeafoamNotes'),
      cast: function(user, target) {
        var base;
        target.stats.buffs.snowball = false;
        target.stats.buffs.spookDust = false;
        target.stats.buffs.shinySeed = false;
        target.stats.buffs.seafoam = true;
        if ((base = target.achievements).seafoam == null) {
          base.seafoam = 0;
        }
        target.achievements.seafoam++;
        return user.items.special.seafoam--;
      }
    },
    sand: {
      text: t('spellSpecialSandText'),
      mana: 0,
      value: 5,
      immediateUse: true,
      target: 'self',
      notes: t('spellSpecialSandNotes'),
      cast: function(user, target) {
        user.stats.buffs.seafoam = false;
        return user.stats.gp -= 5;
      }
    },
    nye: {
      text: t('nyeCard'),
      mana: 0,
      value: 10,
      immediateUse: true,
      silent: true,
      target: 'user',
      notes: t('nyeCardNotes'),
      cast: function(user, target) {
        var base;
        if (user === target) {
          if ((base = user.achievements).nye == null) {
            base.nye = 0;
          }
          user.achievements.nye++;
        } else {
          _.each([user, target], function(t) {
            var base1;
            if ((base1 = t.achievements).nye == null) {
              base1.nye = 0;
            }
            return t.achievements.nye++;
          });
        }
        if (!target.items.special.nyeReceived) {
          target.items.special.nyeReceived = [];
        }
        target.items.special.nyeReceived.push(user.profile.name);
        target.flags.cardReceived = true;
        if (typeof target.markModified === "function") {
          target.markModified('items.special.nyeReceived');
        }
        return user.stats.gp -= 10;
      }
    },
    valentine: {
      text: t('valentineCard'),
      mana: 0,
      value: 10,
      immediateUse: true,
      silent: true,
      target: 'user',
      notes: t('valentineCardNotes'),
      cast: function(user, target) {
        var base;
        if (user === target) {
          if ((base = user.achievements).valentine == null) {
            base.valentine = 0;
          }
          user.achievements.valentine++;
        } else {
          _.each([user, target], function(t) {
            var base1;
            if ((base1 = t.achievements).valentine == null) {
              base1.valentine = 0;
            }
            return t.achievements.valentine++;
          });
        }
        if (!target.items.special.valentineReceived) {
          target.items.special.valentineReceived = [];
        }
        target.items.special.valentineReceived.push(user.profile.name);
        target.flags.cardReceived = true;
        if (typeof target.markModified === "function") {
          target.markModified('items.special.valentineReceived');
        }
        return user.stats.gp -= 10;
      }
    },
    greeting: {
      text: t('greetingCard'),
      mana: 0,
      value: 10,
      immediateUse: true,
      silent: true,
      target: 'user',
      notes: t('greetingCardNotes'),
      cast: function(user, target) {
        var base;
        if (user === target) {
          if ((base = user.achievements).greeting == null) {
            base.greeting = 0;
          }
          user.achievements.greeting++;
        } else {
          _.each([user, target], function(t) {
            var base1;
            if ((base1 = t.achievements).greeting == null) {
              base1.greeting = 0;
            }
            return t.achievements.greeting++;
          });
        }
        if (!target.items.special.greetingReceived) {
          target.items.special.greetingReceived = [];
        }
        target.items.special.greetingReceived.push(user.profile.name);
        target.flags.cardReceived = true;
        if (typeof target.markModified === "function") {
          target.markModified('items.special.greetingReceived');
        }
        return user.stats.gp -= 10;
      }
    },
    thankyou: {
      text: t('thankyouCard'),
      mana: 0,
      value: 10,
      immediateUse: true,
      silent: true,
      target: 'user',
      notes: t('thankyouCardNotes'),
      cast: function(user, target) {
        var base;
        if (user === target) {
          if ((base = user.achievements).thankyou == null) {
            base.thankyou = 0;
          }
          user.achievements.thankyou++;
        } else {
          _.each([user, target], function(t) {
            var base1;
            if ((base1 = t.achievements).thankyou == null) {
              base1.thankyou = 0;
            }
            return t.achievements.thankyou++;
          });
        }
        if (!target.items.special.thankyouReceived) {
          target.items.special.thankyouReceived = [];
        }
        target.items.special.thankyouReceived.push(user.profile.name);
        target.flags.cardReceived = true;
        if (typeof target.markModified === "function") {
          target.markModified('items.special.thankyouReceived');
        }
        return user.stats.gp -= 10;
      }
    }
  }
};

api.cardTypes = {
  greeting: {
    key: 'greeting',
    messageOptions: 4,
    yearRound: true
  },
  nye: {
    key: 'nye',
    messageOptions: 5
  },
  thankyou: {
    key: 'thankyou',
    messageOptions: 4,
    yearRound: true
  },
  valentine: {
    key: 'valentine',
    messageOptions: 4
  }
};

_.each(api.spells, function(spellClass) {
  return _.each(spellClass, function(spell, key) {
    var _cast;
    spell.key = key;
    _cast = spell.cast;
    return spell.cast = function(user, target) {
      _cast(user, target);
      return user.stats.mp -= spell.mana;
    };
  });
});

api.special = api.spells.special;


/*
  ---------------------------------------------------------------
  Drops
  ---------------------------------------------------------------
 */

api.dropEggs = {
  Wolf: {
    text: t('dropEggWolfText'),
    adjective: t('dropEggWolfAdjective')
  },
  TigerCub: {
    text: t('dropEggTigerCubText'),
    mountText: t('dropEggTigerCubMountText'),
    adjective: t('dropEggTigerCubAdjective')
  },
  PandaCub: {
    text: t('dropEggPandaCubText'),
    mountText: t('dropEggPandaCubMountText'),
    adjective: t('dropEggPandaCubAdjective')
  },
  LionCub: {
    text: t('dropEggLionCubText'),
    mountText: t('dropEggLionCubMountText'),
    adjective: t('dropEggLionCubAdjective')
  },
  Fox: {
    text: t('dropEggFoxText'),
    adjective: t('dropEggFoxAdjective')
  },
  FlyingPig: {
    text: t('dropEggFlyingPigText'),
    adjective: t('dropEggFlyingPigAdjective')
  },
  Dragon: {
    text: t('dropEggDragonText'),
    adjective: t('dropEggDragonAdjective')
  },
  Cactus: {
    text: t('dropEggCactusText'),
    adjective: t('dropEggCactusAdjective')
  },
  BearCub: {
    text: t('dropEggBearCubText'),
    mountText: t('dropEggBearCubMountText'),
    adjective: t('dropEggBearCubAdjective')
  }
};

_.each(api.dropEggs, function(egg, key) {
  return _.defaults(egg, {
    canBuy: (function() {
      return true;
    }),
    value: 3,
    key: key,
    notes: t('eggNotes', {
      eggText: egg.text,
      eggAdjective: egg.adjective
    }),
    mountText: egg.text
  });
});

api.questEggs = {
  Gryphon: {
    text: t('questEggGryphonText'),
    adjective: t('questEggGryphonAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.gryphon != null) > 0;
    })
  },
  Hedgehog: {
    text: t('questEggHedgehogText'),
    adjective: t('questEggHedgehogAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.hedgehog != null) > 0;
    })
  },
  Deer: {
    text: t('questEggDeerText'),
    adjective: t('questEggDeerAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.ghost_stag != null) > 0;
    })
  },
  Egg: {
    text: t('questEggEggText'),
    adjective: t('questEggEggAdjective'),
    mountText: t('questEggEggMountText')
  },
  Rat: {
    text: t('questEggRatText'),
    adjective: t('questEggRatAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.rat != null) > 0;
    })
  },
  Octopus: {
    text: t('questEggOctopusText'),
    adjective: t('questEggOctopusAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.octopus != null) > 0;
    })
  },
  Seahorse: {
    text: t('questEggSeahorseText'),
    adjective: t('questEggSeahorseAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.dilatory_derby != null) > 0;
    })
  },
  Parrot: {
    text: t('questEggParrotText'),
    adjective: t('questEggParrotAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.harpy != null) > 0;
    })
  },
  Rooster: {
    text: t('questEggRoosterText'),
    adjective: t('questEggRoosterAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.rooster != null) > 0;
    })
  },
  Spider: {
    text: t('questEggSpiderText'),
    adjective: t('questEggSpiderAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.spider != null) > 0;
    })
  },
  Owl: {
    text: t('questEggOwlText'),
    adjective: t('questEggOwlAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.owl != null) > 0;
    })
  },
  Penguin: {
    text: t('questEggPenguinText'),
    adjective: t('questEggPenguinAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.penguin != null) > 0;
    })
  },
  TRex: {
    text: t('questEggTRexText'),
    adjective: t('questEggTRexAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && ((u.achievements.quests.trex != null) > 0 || (u.achievements.quests.trex_undead != null) > 0);
    })
  },
  Rock: {
    text: t('questEggRockText'),
    adjective: t('questEggRockAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.rock != null) > 0;
    })
  },
  Bunny: {
    text: t('questEggBunnyText'),
    adjective: t('questEggBunnyAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.bunny != null) > 0;
    })
  },
  Slime: {
    text: t('questEggSlimeText'),
    adjective: t('questEggSlimeAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.slime != null) > 0;
    })
  },
  Sheep: {
    text: t('questEggSheepText'),
    adjective: t('questEggSheepAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.sheep != null) > 0;
    })
  },
  Cuttlefish: {
    text: t('questEggCuttlefishText'),
    adjective: t('questEggCuttlefishAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.kraken != null) > 0;
    })
  },
  Whale: {
    text: t('questEggWhaleText'),
    adjective: t('questEggWhaleAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.whale != null) > 0;
    })
  },
  Cheetah: {
    text: t('questEggCheetahText'),
    adjective: t('questEggCheetahAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.cheetah != null) > 0;
    })
  },
  Horse: {
    text: t('questEggHorseText'),
    adjective: t('questEggHorseAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.horse != null) > 0;
    })
  },
  Frog: {
    text: t('questEggFrogText'),
    adjective: t('questEggFrogAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.frog != null) > 0;
    })
  },
  Snake: {
    text: t('questEggSnakeText'),
    adjective: t('questEggSnakeAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.snake != null) > 0;
    })
  }
};

_.each(api.questEggs, function(egg, key) {
  return _.defaults(egg, {
    canBuy: (function() {
      return false;
    }),
    value: 3,
    key: key,
    notes: t('eggNotes', {
      eggText: egg.text,
      eggAdjective: egg.adjective
    }),
    mountText: egg.text
  });
});

api.eggs = _.assign(_.cloneDeep(api.dropEggs), api.questEggs);

api.specialPets = {
  'Wolf-Veteran': 'veteranWolf',
  'Wolf-Cerberus': 'cerberusPup',
  'Dragon-Hydra': 'hydra',
  'Turkey-Base': 'turkey',
  'BearCub-Polar': 'polarBearPup',
  'MantisShrimp-Base': 'mantisShrimp',
  'JackOLantern-Base': 'jackolantern',
  'Mammoth-Base': 'mammoth',
  'Tiger-Veteran': 'veteranTiger',
  'Phoenix-Base': 'phoenix'
};

api.specialMounts = {
  'BearCub-Polar': 'polarBear',
  'LionCub-Ethereal': 'etherealLion',
  'MantisShrimp-Base': 'mantisShrimp',
  'Turkey-Base': 'turkey',
  'Mammoth-Base': 'mammoth',
  'Orca-Base': 'orca',
  'Gryphon-RoyalPurple': 'royalPurpleGryphon',
  'Phoenix-Base': 'phoenix',
  'JackOLantern-Base': 'jackolantern'
};

api.timeTravelStable = {
  pets: {
    'Mammoth-Base': t('mammoth'),
    'MantisShrimp-Base': t('mantisShrimp')
  },
  mounts: {
    'Mammoth-Base': t('mammoth'),
    'MantisShrimp-Base': t('mantisShrimp')
  }
};

api.dropHatchingPotions = {
  Base: {
    value: 2,
    text: t('hatchingPotionBase')
  },
  White: {
    value: 2,
    text: t('hatchingPotionWhite')
  },
  Desert: {
    value: 2,
    text: t('hatchingPotionDesert')
  },
  Red: {
    value: 3,
    text: t('hatchingPotionRed')
  },
  Shade: {
    value: 3,
    text: t('hatchingPotionShade')
  },
  Skeleton: {
    value: 3,
    text: t('hatchingPotionSkeleton')
  },
  Zombie: {
    value: 4,
    text: t('hatchingPotionZombie')
  },
  CottonCandyPink: {
    value: 4,
    text: t('hatchingPotionCottonCandyPink')
  },
  CottonCandyBlue: {
    value: 4,
    text: t('hatchingPotionCottonCandyBlue')
  },
  Golden: {
    value: 5,
    text: t('hatchingPotionGolden')
  }
};

api.premiumHatchingPotions = {
  Spooky: {
    value: 2,
    text: t('hatchingPotionSpooky'),
    limited: true,
    canBuy: (function() {
      return false;
    })
  }
};

_.each(api.dropHatchingPotions, function(pot, key) {
  return _.defaults(pot, {
    key: key,
    value: 2,
    notes: t('hatchingPotionNotes', {
      potText: pot.text
    }),
    premium: false,
    limited: false,
    canBuy: (function() {
      return true;
    })
  });
});

_.each(api.premiumHatchingPotions, function(pot, key) {
  return _.defaults(pot, {
    key: key,
    value: 2,
    notes: t('hatchingPotionNotes', {
      potText: pot.text
    }),
    addlNotes: t('premiumPotionAddlNotes'),
    premium: true,
    limited: false,
    canBuy: (function() {
      return true;
    })
  });
});

api.hatchingPotions = {};

_.merge(api.hatchingPotions, api.dropHatchingPotions);

_.merge(api.hatchingPotions, api.premiumHatchingPotions);

api.pets = _.transform(api.dropEggs, function(m, egg) {
  return _.defaults(m, _.transform(api.hatchingPotions, function(m2, pot) {
    if (!pot.premium) {
      return m2[egg.key + "-" + pot.key] = true;
    }
  }));
});

api.premiumPets = _.transform(api.dropEggs, function(m, egg) {
  return _.defaults(m, _.transform(api.hatchingPotions, function(m2, pot) {
    if (pot.premium) {
      return m2[egg.key + "-" + pot.key] = true;
    }
  }));
});

api.questPets = _.transform(api.questEggs, function(m, egg) {
  return _.defaults(m, _.transform(api.hatchingPotions, function(m2, pot) {
    if (!pot.premium) {
      return m2[egg.key + "-" + pot.key] = true;
    }
  }));
});

api.mounts = _.transform(api.dropEggs, function(m, egg) {
  return _.defaults(m, _.transform(api.hatchingPotions, function(m2, pot) {
    if (!pot.premium) {
      return m2[egg.key + "-" + pot.key] = true;
    }
  }));
});

api.questMounts = _.transform(api.questEggs, function(m, egg) {
  return _.defaults(m, _.transform(api.hatchingPotions, function(m2, pot) {
    if (!pot.premium) {
      return m2[egg.key + "-" + pot.key] = true;
    }
  }));
});

api.food = {
  Meat: {
    text: t('foodMeat'),
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
    target: 'Base',
    article: ''
  },
  Milk: {
    text: t('foodMilk'),
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
    target: 'White',
    article: ''
  },
  Potatoe: {
    text: t('foodPotatoe'),
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
    target: 'Desert',
    article: 'a '
  },
  Strawberry: {
    text: t('foodStrawberry'),
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
    target: 'Red',
    article: 'a '
  },
  Chocolate: {
    text: t('foodChocolate'),
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
    target: 'Shade',
    article: ''
  },
  Fish: {
    text: t('foodFish'),
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
    target: 'Skeleton',
    article: 'a '
  },
  RottenMeat: {
    text: t('foodRottenMeat'),
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
    target: 'Zombie',
    article: ''
  },
  CottonCandyPink: {
    text: t('foodCottonCandyPink'),
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
    target: 'CottonCandyPink',
    article: ''
  },
  CottonCandyBlue: {
    text: t('foodCottonCandyBlue'),
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
    target: 'CottonCandyBlue',
    article: ''
  },
  Honey: {
    text: t('foodHoney'),
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
    target: 'Golden',
    article: ''
  },
  Saddle: {
    canBuy: (function() {
      return true;
    }),
    text: t('foodSaddleText'),
    value: 5,
    notes: t('foodSaddleNotes')
  },
  Cake_Skeleton: {
    text: t('foodCakeSkeleton'),
    target: 'Skeleton',
    article: ''
  },
  Cake_Base: {
    text: t('foodCakeBase'),
    target: 'Base',
    article: ''
  },
  Cake_CottonCandyBlue: {
    text: t('foodCakeCottonCandyBlue'),
    target: 'CottonCandyBlue',
    article: ''
  },
  Cake_CottonCandyPink: {
    text: t('foodCakeCottonCandyPink'),
    target: 'CottonCandyPink',
    article: ''
  },
  Cake_Shade: {
    text: t('foodCakeShade'),
    target: 'Shade',
    article: ''
  },
  Cake_White: {
    text: t('foodCakeWhite'),
    target: 'White',
    article: ''
  },
  Cake_Golden: {
    text: t('foodCakeGolden'),
    target: 'Golden',
    article: ''
  },
  Cake_Zombie: {
    text: t('foodCakeZombie'),
    target: 'Zombie',
    article: ''
  },
  Cake_Desert: {
    text: t('foodCakeDesert'),
    target: 'Desert',
    article: ''
  },
  Cake_Red: {
    text: t('foodCakeRed'),
    target: 'Red',
    article: ''
  },
  Candy_Skeleton: {
    text: t('foodCandySkeleton'),
    target: 'Skeleton',
    article: ''
  },
  Candy_Base: {
    text: t('foodCandyBase'),
    target: 'Base',
    article: ''
  },
  Candy_CottonCandyBlue: {
    text: t('foodCandyCottonCandyBlue'),
    target: 'CottonCandyBlue',
    article: ''
  },
  Candy_CottonCandyPink: {
    text: t('foodCandyCottonCandyPink'),
    target: 'CottonCandyPink',
    article: ''
  },
  Candy_Shade: {
    text: t('foodCandyShade'),
    target: 'Shade',
    article: ''
  },
  Candy_White: {
    text: t('foodCandyWhite'),
    target: 'White',
    article: ''
  },
  Candy_Golden: {
    text: t('foodCandyGolden'),
    target: 'Golden',
    article: ''
  },
  Candy_Zombie: {
    text: t('foodCandyZombie'),
    target: 'Zombie',
    article: ''
  },
  Candy_Desert: {
    text: t('foodCandyDesert'),
    target: 'Desert',
    article: ''
  },
  Candy_Red: {
    text: t('foodCandyRed'),
    target: 'Red',
    article: ''
  }
};

_.each(api.food, function(food, key) {
  return _.defaults(food, {
    value: 1,
    key: key,
    notes: t('foodNotes'),
    canBuy: (function() {
      return false;
    }),
    canDrop: false
  });
});

api.userCanOwnQuestCategories = ['unlockable', 'gold', 'pet'];

api.quests = {
  dilatory: {
    text: t("questDilatoryText"),
    notes: t("questDilatoryNotes"),
    completion: t("questDilatoryCompletion"),
    value: 0,
    canBuy: (function() {
      return false;
    }),
    category: 'world',
    boss: {
      name: t("questDilatoryBoss"),
      hp: 5000000,
      str: 1,
      def: 1,
      rage: {
        title: t("questDilatoryBossRageTitle"),
        description: t("questDilatoryBossRageDescription"),
        value: 4000000,
        tavern: t('questDilatoryBossRageTavern'),
        stables: t('questDilatoryBossRageStables'),
        market: t('questDilatoryBossRageMarket')
      }
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'MantisShrimp-Base',
          text: t('questDilatoryDropMantisShrimpPet')
        }, {
          type: 'mounts',
          key: 'MantisShrimp-Base',
          text: t('questDilatoryDropMantisShrimpMount')
        }, {
          type: 'food',
          key: 'Meat',
          text: t('foodMeat')
        }, {
          type: 'food',
          key: 'Milk',
          text: t('foodMilk')
        }, {
          type: 'food',
          key: 'Potatoe',
          text: t('foodPotatoe')
        }, {
          type: 'food',
          key: 'Strawberry',
          text: t('foodStrawberry')
        }, {
          type: 'food',
          key: 'Chocolate',
          text: t('foodChocolate')
        }, {
          type: 'food',
          key: 'Fish',
          text: t('foodFish')
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('foodRottenMeat')
        }, {
          type: 'food',
          key: 'CottonCandyPink',
          text: t('foodCottonCandyPink')
        }, {
          type: 'food',
          key: 'CottonCandyBlue',
          text: t('foodCottonCandyBlue')
        }, {
          type: 'food',
          key: 'Honey',
          text: t('foodHoney')
        }
      ],
      gp: 0,
      exp: 0
    }
  },
  stressbeast: {
    text: t("questStressbeastText"),
    notes: t("questStressbeastNotes"),
    completion: t("questStressbeastCompletion"),
    completionChat: t("questStressbeastCompletionChat"),
    value: 0,
    canBuy: (function() {
      return false;
    }),
    category: 'world',
    boss: {
      name: t("questStressbeastBoss"),
      hp: 2750000,
      str: 1,
      def: 1,
      rage: {
        title: t("questStressbeastBossRageTitle"),
        description: t("questStressbeastBossRageDescription"),
        value: 1450000,
        healing: .3,
        stables: t('questStressbeastBossRageStables'),
        bailey: t('questStressbeastBossRageBailey'),
        guide: t('questStressbeastBossRageGuide')
      },
      desperation: {
        threshold: 500000,
        str: 3.5,
        def: 2,
        text: t('questStressbeastDesperation')
      }
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'Mammoth-Base',
          text: t('questStressbeastDropMammothPet')
        }, {
          type: 'mounts',
          key: 'Mammoth-Base',
          text: t('questStressbeastDropMammothMount')
        }, {
          type: 'food',
          key: 'Meat',
          text: t('foodMeat')
        }, {
          type: 'food',
          key: 'Milk',
          text: t('foodMilk')
        }, {
          type: 'food',
          key: 'Potatoe',
          text: t('foodPotatoe')
        }, {
          type: 'food',
          key: 'Strawberry',
          text: t('foodStrawberry')
        }, {
          type: 'food',
          key: 'Chocolate',
          text: t('foodChocolate')
        }, {
          type: 'food',
          key: 'Fish',
          text: t('foodFish')
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('foodRottenMeat')
        }, {
          type: 'food',
          key: 'CottonCandyPink',
          text: t('foodCottonCandyPink')
        }, {
          type: 'food',
          key: 'CottonCandyBlue',
          text: t('foodCottonCandyBlue')
        }, {
          type: 'food',
          key: 'Honey',
          text: t('foodHoney')
        }
      ],
      gp: 0,
      exp: 0
    }
  },
  burnout: {
    text: t('questBurnoutText'),
    notes: t('questBurnoutNotes'),
    completion: t('questBurnoutCompletion'),
    completionChat: t('questBurnoutCompletionChat'),
    value: 0,
    canBuy: (function() {
      return false;
    }),
    category: 'world',
    boss: {
      name: t('questBurnoutBoss'),
      hp: 11000000,
      str: 2.5,
      def: 1,
      rage: {
        title: t('questBurnoutBossRageTitle'),
        description: t('questBurnoutBossRageDescription'),
        value: 1000000,
        quests: t('questBurnoutBossRageQuests'),
        seasonalShop: t('questBurnoutBossRageSeasonalShop'),
        tavern: t('questBurnoutBossRageTavern')
      }
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'Phoenix-Base',
          text: t('questBurnoutDropPhoenixPet')
        }, {
          type: 'mounts',
          key: 'Phoenix-Base',
          text: t('questBurnoutDropPhoenixMount')
        }, {
          type: 'food',
          key: 'Candy_Base',
          text: t('foodCandyBase')
        }, {
          type: 'food',
          key: 'Candy_White',
          text: t('foodCandyWhite')
        }, {
          type: 'food',
          key: 'Candy_Desert',
          text: t('foodCandyDesert')
        }, {
          type: 'food',
          key: 'Candy_Red',
          text: t('foodCandyRed')
        }, {
          type: 'food',
          key: 'Candy_Shade',
          text: t('foodCandyShade')
        }, {
          type: 'food',
          key: 'Candy_Skeleton',
          text: t('foodCandySkeleton')
        }, {
          type: 'food',
          key: 'Candy_Zombie',
          text: t('foodCandyZombie')
        }, {
          type: 'food',
          key: 'Candy_CottonCandyPink',
          text: t('foodCandyCottonCandyPink')
        }, {
          type: 'food',
          key: 'Candy_CottonCandyBlue',
          text: t('foodCandyCottonCandyBlue')
        }, {
          type: 'food',
          key: 'Candy_Golden',
          text: t('foodCandyGolden')
        }
      ],
      gp: 0,
      exp: 0
    }
  },
  evilsanta: {
    canBuy: (function() {
      return false;
    }),
    text: t('questEvilSantaText'),
    notes: t('questEvilSantaNotes'),
    completion: t('questEvilSantaCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questEvilSantaBoss'),
      hp: 300,
      str: 1
    },
    drop: {
      items: [
        {
          type: 'mounts',
          key: 'BearCub-Polar',
          text: t('questEvilSantaDropBearCubPolarMount')
        }
      ],
      gp: 20,
      exp: 100
    }
  },
  evilsanta2: {
    canBuy: (function() {
      return false;
    }),
    text: t('questEvilSanta2Text'),
    notes: t('questEvilSanta2Notes'),
    completion: t('questEvilSanta2Completion'),
    value: 4,
    previous: 'evilsanta',
    category: 'pet',
    collect: {
      tracks: {
        text: t('questEvilSanta2CollectTracks'),
        count: 20
      },
      branches: {
        text: t('questEvilSanta2CollectBranches'),
        count: 10
      }
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'BearCub-Polar',
          text: t('questEvilSanta2DropBearCubPolarPet')
        }
      ],
      gp: 20,
      exp: 100
    }
  },
  gryphon: {
    text: t('questGryphonText'),
    notes: t('questGryphonNotes'),
    completion: t('questGryphonCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questGryphonBoss'),
      hp: 300,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Gryphon',
          text: t('questGryphonDropGryphonEgg')
        }, {
          type: 'eggs',
          key: 'Gryphon',
          text: t('questGryphonDropGryphonEgg')
        }, {
          type: 'eggs',
          key: 'Gryphon',
          text: t('questGryphonDropGryphonEgg')
        }
      ],
      gp: 25,
      exp: 125,
      unlock: t('questGryphonUnlockText')
    }
  },
  hedgehog: {
    text: t('questHedgehogText'),
    notes: t('questHedgehogNotes'),
    completion: t('questHedgehogCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questHedgehogBoss'),
      hp: 400,
      str: 1.25
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Hedgehog',
          text: t('questHedgehogDropHedgehogEgg')
        }, {
          type: 'eggs',
          key: 'Hedgehog',
          text: t('questHedgehogDropHedgehogEgg')
        }, {
          type: 'eggs',
          key: 'Hedgehog',
          text: t('questHedgehogDropHedgehogEgg')
        }
      ],
      gp: 30,
      exp: 125,
      unlock: t('questHedgehogUnlockText')
    }
  },
  ghost_stag: {
    text: t('questGhostStagText'),
    notes: t('questGhostStagNotes'),
    completion: t('questGhostStagCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questGhostStagBoss'),
      hp: 1200,
      str: 2.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Deer',
          text: t('questGhostStagDropDeerEgg')
        }, {
          type: 'eggs',
          key: 'Deer',
          text: t('questGhostStagDropDeerEgg')
        }, {
          type: 'eggs',
          key: 'Deer',
          text: t('questGhostStagDropDeerEgg')
        }
      ],
      gp: 80,
      exp: 800,
      unlock: t('questGhostStagUnlockText')
    }
  },
  vice1: {
    text: t('questVice1Text'),
    notes: t('questVice1Notes'),
    value: 4,
    lvl: 30,
    category: 'unlockable',
    boss: {
      name: t('questVice1Boss'),
      hp: 750,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: "vice2",
          text: t('questVice1DropVice2Quest')
        }
      ],
      gp: 20,
      exp: 100
    }
  },
  vice2: {
    text: t('questVice2Text'),
    notes: t('questVice2Notes'),
    value: 4,
    lvl: 30,
    category: 'unlockable',
    previous: 'vice1',
    collect: {
      lightCrystal: {
        text: t('questVice2CollectLightCrystal'),
        count: 45
      }
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'vice3',
          text: t('questVice2DropVice3Quest')
        }
      ],
      gp: 20,
      exp: 75
    }
  },
  vice3: {
    text: t('questVice3Text'),
    notes: t('questVice3Notes'),
    completion: t('questVice3Completion'),
    previous: 'vice2',
    value: 4,
    lvl: 30,
    category: 'unlockable',
    boss: {
      name: t('questVice3Boss'),
      hp: 1500,
      str: 3
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: "weapon_special_2",
          text: t('questVice3DropWeaponSpecial2')
        }, {
          type: 'eggs',
          key: 'Dragon',
          text: t('questVice3DropDragonEgg')
        }, {
          type: 'eggs',
          key: 'Dragon',
          text: t('questVice3DropDragonEgg')
        }, {
          type: 'hatchingPotions',
          key: 'Shade',
          text: t('questVice3DropShadeHatchingPotion')
        }, {
          type: 'hatchingPotions',
          key: 'Shade',
          text: t('questVice3DropShadeHatchingPotion')
        }
      ],
      gp: 100,
      exp: 1000
    }
  },
  egg: {
    text: t('questEggHuntText'),
    notes: t('questEggHuntNotes'),
    completion: t('questEggHuntCompletion'),
    value: 1,
    canBuy: (function() {
      return false;
    }),
    category: 'pet',
    collect: {
      plainEgg: {
        text: t('questEggHuntCollectPlainEgg'),
        count: 100
      }
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }
      ],
      gp: 0,
      exp: 0
    }
  },
  rat: {
    text: t('questRatText'),
    notes: t('questRatNotes'),
    completion: t('questRatCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questRatBoss'),
      hp: 1200,
      str: 2.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Rat',
          text: t('questRatDropRatEgg')
        }, {
          type: 'eggs',
          key: 'Rat',
          text: t('questRatDropRatEgg')
        }, {
          type: 'eggs',
          key: 'Rat',
          text: t('questRatDropRatEgg')
        }
      ],
      gp: 80,
      exp: 800,
      unlock: t('questRatUnlockText')
    }
  },
  octopus: {
    text: t('questOctopusText'),
    notes: t('questOctopusNotes'),
    completion: t('questOctopusCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questOctopusBoss'),
      hp: 1200,
      str: 2.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Octopus',
          text: t('questOctopusDropOctopusEgg')
        }, {
          type: 'eggs',
          key: 'Octopus',
          text: t('questOctopusDropOctopusEgg')
        }, {
          type: 'eggs',
          key: 'Octopus',
          text: t('questOctopusDropOctopusEgg')
        }
      ],
      gp: 80,
      exp: 800,
      unlock: t('questOctopusUnlockText')
    }
  },
  dilatory_derby: {
    text: t('questSeahorseText'),
    notes: t('questSeahorseNotes'),
    completion: t('questSeahorseCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSeahorseBoss'),
      hp: 300,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Seahorse',
          text: t('questSeahorseDropSeahorseEgg')
        }, {
          type: 'eggs',
          key: 'Seahorse',
          text: t('questSeahorseDropSeahorseEgg')
        }, {
          type: 'eggs',
          key: 'Seahorse',
          text: t('questSeahorseDropSeahorseEgg')
        }
      ],
      gp: 25,
      exp: 125,
      unlock: t('questSeahorseUnlockText')
    }
  },
  atom1: {
    text: t('questAtom1Text'),
    notes: t('questAtom1Notes'),
    value: 4,
    lvl: 15,
    category: 'unlockable',
    collect: {
      soapBars: {
        text: t('questAtom1CollectSoapBars'),
        count: 20
      }
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: "atom2",
          text: t('questAtom1Drop')
        }
      ],
      gp: 7,
      exp: 50
    }
  },
  atom2: {
    text: t('questAtom2Text'),
    notes: t('questAtom2Notes'),
    previous: 'atom1',
    value: 4,
    lvl: 15,
    category: 'unlockable',
    boss: {
      name: t('questAtom2Boss'),
      hp: 300,
      str: 1
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: "atom3",
          text: t('questAtom2Drop')
        }
      ],
      gp: 20,
      exp: 100
    }
  },
  atom3: {
    text: t('questAtom3Text'),
    notes: t('questAtom3Notes'),
    previous: 'atom2',
    completion: t('questAtom3Completion'),
    value: 4,
    lvl: 15,
    category: 'unlockable',
    boss: {
      name: t('questAtom3Boss'),
      hp: 800,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: "head_special_2",
          text: t('headSpecial2Text')
        }, {
          type: 'hatchingPotions',
          key: "Base",
          text: t('questAtom3DropPotion')
        }, {
          type: 'hatchingPotions',
          key: "Base",
          text: t('questAtom3DropPotion')
        }
      ],
      gp: 25,
      exp: 125
    }
  },
  harpy: {
    text: t('questHarpyText'),
    notes: t('questHarpyNotes'),
    completion: t('questHarpyCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questHarpyBoss'),
      hp: 600,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Parrot',
          text: t('questHarpyDropParrotEgg')
        }, {
          type: 'eggs',
          key: 'Parrot',
          text: t('questHarpyDropParrotEgg')
        }, {
          type: 'eggs',
          key: 'Parrot',
          text: t('questHarpyDropParrotEgg')
        }
      ],
      gp: 43,
      exp: 350,
      unlock: t('questHarpyUnlockText')
    }
  },
  rooster: {
    text: t('questRoosterText'),
    notes: t('questRoosterNotes'),
    completion: t('questRoosterCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questRoosterBoss'),
      hp: 300,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Rooster',
          text: t('questRoosterDropRoosterEgg')
        }, {
          type: 'eggs',
          key: 'Rooster',
          text: t('questRoosterDropRoosterEgg')
        }, {
          type: 'eggs',
          key: 'Rooster',
          text: t('questRoosterDropRoosterEgg')
        }
      ],
      gp: 25,
      exp: 125,
      unlock: t('questRoosterUnlockText')
    }
  },
  spider: {
    text: t('questSpiderText'),
    notes: t('questSpiderNotes'),
    completion: t('questSpiderCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSpiderBoss'),
      hp: 400,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Spider',
          text: t('questSpiderDropSpiderEgg')
        }, {
          type: 'eggs',
          key: 'Spider',
          text: t('questSpiderDropSpiderEgg')
        }, {
          type: 'eggs',
          key: 'Spider',
          text: t('questSpiderDropSpiderEgg')
        }
      ],
      gp: 31,
      exp: 200,
      unlock: t('questSpiderUnlockText')
    }
  },
  moonstone1: {
    text: t('questMoonstone1Text'),
    notes: t('questMoonstone1Notes'),
    value: 4,
    lvl: 60,
    category: 'unlockable',
    collect: {
      moonstone: {
        text: t('questMoonstone1CollectMoonstone'),
        count: 500
      }
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: "moonstone2",
          text: t('questMoonstone1DropMoonstone2Quest')
        }
      ],
      gp: 50,
      exp: 100
    }
  },
  moonstone2: {
    text: t('questMoonstone2Text'),
    notes: t('questMoonstone2Notes'),
    value: 4,
    lvl: 60,
    previous: 'moonstone1',
    category: 'unlockable',
    boss: {
      name: t('questMoonstone2Boss'),
      hp: 1500,
      str: 3
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'moonstone3',
          text: t('questMoonstone2DropMoonstone3Quest')
        }
      ],
      gp: 500,
      exp: 1000
    }
  },
  moonstone3: {
    text: t('questMoonstone3Text'),
    notes: t('questMoonstone3Notes'),
    completion: t('questMoonstone3Completion'),
    previous: 'moonstone2',
    value: 4,
    lvl: 60,
    category: 'unlockable',
    boss: {
      name: t('questMoonstone3Boss'),
      hp: 2000,
      str: 3.5
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: "armor_special_2",
          text: t('armorSpecial2Text')
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('questMoonstone3DropRottenMeat')
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('questMoonstone3DropRottenMeat')
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('questMoonstone3DropRottenMeat')
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('questMoonstone3DropRottenMeat')
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('questMoonstone3DropRottenMeat')
        }, {
          type: 'hatchingPotions',
          key: 'Zombie',
          text: t('questMoonstone3DropZombiePotion')
        }, {
          type: 'hatchingPotions',
          key: 'Zombie',
          text: t('questMoonstone3DropZombiePotion')
        }, {
          type: 'hatchingPotions',
          key: 'Zombie',
          text: t('questMoonstone3DropZombiePotion')
        }
      ],
      gp: 900,
      exp: 1500
    }
  },
  goldenknight1: {
    text: t('questGoldenknight1Text'),
    notes: t('questGoldenknight1Notes'),
    value: 4,
    lvl: 40,
    category: 'unlockable',
    collect: {
      testimony: {
        text: t('questGoldenknight1CollectTestimony'),
        count: 300
      }
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: "goldenknight2",
          text: t('questGoldenknight1DropGoldenknight2Quest')
        }
      ],
      gp: 15,
      exp: 120
    }
  },
  goldenknight2: {
    text: t('questGoldenknight2Text'),
    notes: t('questGoldenknight2Notes'),
    value: 4,
    previous: 'goldenknight1',
    lvl: 40,
    category: 'unlockable',
    boss: {
      name: t('questGoldenknight2Boss'),
      hp: 1000,
      str: 3
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'goldenknight3',
          text: t('questGoldenknight2DropGoldenknight3Quest')
        }
      ],
      gp: 75,
      exp: 750
    }
  },
  goldenknight3: {
    text: t('questGoldenknight3Text'),
    notes: t('questGoldenknight3Notes'),
    completion: t('questGoldenknight3Completion'),
    previous: 'goldenknight2',
    value: 4,
    lvl: 40,
    category: 'unlockable',
    boss: {
      name: t('questGoldenknight3Boss'),
      hp: 1700,
      str: 3.5
    },
    drop: {
      items: [
        {
          type: 'food',
          key: 'Honey',
          text: t('questGoldenknight3DropHoney')
        }, {
          type: 'food',
          key: 'Honey',
          text: t('questGoldenknight3DropHoney')
        }, {
          type: 'food',
          key: 'Honey',
          text: t('questGoldenknight3DropHoney')
        }, {
          type: 'hatchingPotions',
          key: 'Golden',
          text: t('questGoldenknight3DropGoldenPotion')
        }, {
          type: 'hatchingPotions',
          key: 'Golden',
          text: t('questGoldenknight3DropGoldenPotion')
        }, {
          type: 'gear',
          key: 'shield_special_goldenknight',
          text: t('questGoldenknight3DropWeapon')
        }
      ],
      gp: 900,
      exp: 1500
    }
  },
  basilist: {
    text: t('questBasilistText'),
    notes: t('questBasilistNotes'),
    completion: t('questBasilistCompletion'),
    value: 4,
    category: 'unlockable',
    unlockCondition: {
      condition: 'party invite',
      text: t('inviteFriends')
    },
    boss: {
      name: t('questBasilistBoss'),
      hp: 100,
      str: 0.5
    },
    drop: {
      gp: 8,
      exp: 42
    }
  },
  owl: {
    text: t('questOwlText'),
    notes: t('questOwlNotes'),
    completion: t('questOwlCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questOwlBoss'),
      hp: 500,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Owl',
          text: t('questOwlDropOwlEgg')
        }, {
          type: 'eggs',
          key: 'Owl',
          text: t('questOwlDropOwlEgg')
        }, {
          type: 'eggs',
          key: 'Owl',
          text: t('questOwlDropOwlEgg')
        }
      ],
      gp: 37,
      exp: 275,
      unlock: t('questOwlUnlockText')
    }
  },
  penguin: {
    text: t('questPenguinText'),
    notes: t('questPenguinNotes'),
    completion: t('questPenguinCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questPenguinBoss'),
      hp: 400,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Penguin',
          text: t('questPenguinDropPenguinEgg')
        }, {
          type: 'eggs',
          key: 'Penguin',
          text: t('questPenguinDropPenguinEgg')
        }, {
          type: 'eggs',
          key: 'Penguin',
          text: t('questPenguinDropPenguinEgg')
        }
      ],
      gp: 31,
      exp: 200,
      unlock: t('questPenguinUnlockText')
    }
  },
  trex: {
    text: t('questTRexText'),
    notes: t('questTRexNotes'),
    completion: t('questTRexCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questTRexBoss'),
      hp: 800,
      str: 2
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg')
        }, {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg')
        }, {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg')
        }
      ],
      gp: 55,
      exp: 500,
      unlock: t('questTRexUnlockText')
    }
  },
  trex_undead: {
    text: t('questTRexUndeadText'),
    notes: t('questTRexUndeadNotes'),
    completion: t('questTRexUndeadCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questTRexUndeadBoss'),
      hp: 500,
      str: 2,
      rage: {
        title: t("questTRexUndeadRageTitle"),
        description: t("questTRexUndeadRageDescription"),
        value: 50,
        healing: .3,
        effect: t('questTRexUndeadRageEffect')
      }
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg')
        }, {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg')
        }, {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg')
        }
      ],
      gp: 55,
      exp: 500,
      unlock: t('questTRexUnlockText')
    }
  },
  rock: {
    text: t('questRockText'),
    notes: t('questRockNotes'),
    completion: t('questRockCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questRockBoss'),
      hp: 400,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Rock',
          text: t('questRockDropRockEgg')
        }, {
          type: 'eggs',
          key: 'Rock',
          text: t('questRockDropRockEgg')
        }, {
          type: 'eggs',
          key: 'Rock',
          text: t('questRockDropRockEgg')
        }
      ],
      gp: 31,
      exp: 200,
      unlock: t('questRockUnlockText')
    }
  },
  bunny: {
    text: t('questBunnyText'),
    notes: t('questBunnyNotes'),
    completion: t('questBunnyCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questBunnyBoss'),
      hp: 300,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Bunny',
          text: t('questBunnyDropBunnyEgg')
        }, {
          type: 'eggs',
          key: 'Bunny',
          text: t('questBunnyDropBunnyEgg')
        }, {
          type: 'eggs',
          key: 'Bunny',
          text: t('questBunnyDropBunnyEgg')
        }
      ],
      gp: 25,
      exp: 125,
      unlock: t('questBunnyUnlockText')
    }
  },
  slime: {
    text: t('questSlimeText'),
    notes: t('questSlimeNotes'),
    completion: t('questSlimeCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSlimeBoss'),
      hp: 400,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Slime',
          text: t('questSlimeDropSlimeEgg')
        }, {
          type: 'eggs',
          key: 'Slime',
          text: t('questSlimeDropSlimeEgg')
        }, {
          type: 'eggs',
          key: 'Slime',
          text: t('questSlimeDropSlimeEgg')
        }
      ],
      gp: 31,
      exp: 200,
      unlock: t('questSlimeUnlockText')
    }
  },
  sheep: {
    text: t('questSheepText'),
    notes: t('questSheepNotes'),
    completion: t('questSheepCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSheepBoss'),
      hp: 300,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Sheep',
          text: t('questSheepDropSheepEgg')
        }, {
          type: 'eggs',
          key: 'Sheep',
          text: t('questSheepDropSheepEgg')
        }, {
          type: 'eggs',
          key: 'Sheep',
          text: t('questSheepDropSheepEgg')
        }
      ],
      gp: 25,
      exp: 125,
      unlock: t('questSheepUnlockText')
    }
  },
  kraken: {
    text: t('questKrakenText'),
    notes: t('questKrakenNotes'),
    completion: t('questKrakenCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questKrakenBoss'),
      hp: 800,
      str: 2
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Cuttlefish',
          text: t('questKrakenDropCuttlefishEgg')
        }, {
          type: 'eggs',
          key: 'Cuttlefish',
          text: t('questKrakenDropCuttlefishEgg')
        }, {
          type: 'eggs',
          key: 'Cuttlefish',
          text: t('questKrakenDropCuttlefishEgg')
        }
      ],
      gp: 55,
      exp: 500,
      unlock: t('questKrakenUnlockText')
    }
  },
  whale: {
    text: t('questWhaleText'),
    notes: t('questWhaleNotes'),
    completion: t('questWhaleCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questWhaleBoss'),
      hp: 500,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Whale',
          text: t('questWhaleDropWhaleEgg')
        }, {
          type: 'eggs',
          key: 'Whale',
          text: t('questWhaleDropWhaleEgg')
        }, {
          type: 'eggs',
          key: 'Whale',
          text: t('questWhaleDropWhaleEgg')
        }
      ],
      gp: 37,
      exp: 275,
      unlock: t('questWhaleUnlockText')
    }
  },
  dilatoryDistress1: {
    text: t('questDilatoryDistress1Text'),
    notes: t('questDilatoryDistress1Notes'),
    completion: t('questDilatoryDistress1Completion'),
    value: 4,
    goldValue: 200,
    category: 'gold',
    collect: {
      fireCoral: {
        text: t('questDilatoryDistress1CollectFireCoral'),
        count: 25
      },
      blueFins: {
        text: t('questDilatoryDistress1CollectBlueFins'),
        count: 25
      }
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: "armor_special_finnedOceanicArmor",
          text: t('questDilatoryDistress1DropArmor')
        }
      ],
      gp: 0,
      exp: 75
    }
  },
  dilatoryDistress2: {
    text: t('questDilatoryDistress2Text'),
    notes: t('questDilatoryDistress2Notes'),
    completion: t('questDilatoryDistress2Completion'),
    previous: 'dilatoryDistress1',
    value: 4,
    goldValue: 300,
    category: 'gold',
    boss: {
      name: t('questDilatoryDistress2Boss'),
      hp: 500,
      rage: {
        title: t("questDilatoryDistress2RageTitle"),
        description: t("questDilatoryDistress2RageDescription"),
        value: 50,
        healing: .3,
        effect: t('questDilatoryDistress2RageEffect')
      }
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Skeleton',
          text: t('questDilatoryDistress2DropSkeletonPotion')
        }, {
          type: 'hatchingPotions',
          key: 'CottonCandyBlue',
          text: t('questDilatoryDistress2DropCottonCandyBluePotion')
        }, {
          type: 'gear',
          key: "head_special_fireCoralCirclet",
          text: t('questDilatoryDistress2DropHeadgear')
        }
      ],
      gp: 0,
      exp: 500
    }
  },
  dilatoryDistress3: {
    text: t('questDilatoryDistress3Text'),
    notes: t('questDilatoryDistress3Notes'),
    completion: t('questDilatoryDistress3Completion'),
    previous: 'dilatoryDistress2',
    value: 4,
    goldValue: 400,
    category: 'gold',
    boss: {
      name: t('questDilatoryDistress3Boss'),
      hp: 1000,
      str: 2
    },
    drop: {
      items: [
        {
          type: 'food',
          key: 'Fish',
          text: t('questDilatoryDistress3DropFish')
        }, {
          type: 'food',
          key: 'Fish',
          text: t('questDilatoryDistress3DropFish')
        }, {
          type: 'food',
          key: 'Fish',
          text: t('questDilatoryDistress3DropFish')
        }, {
          type: 'gear',
          key: "weapon_special_tridentOfCrashingTides",
          text: t('questDilatoryDistress3DropWeapon')
        }, {
          type: 'gear',
          key: "shield_special_moonpearlShield",
          text: t('questDilatoryDistress3DropShield')
        }
      ],
      gp: 0,
      exp: 650
    }
  },
  cheetah: {
    text: t('questCheetahText'),
    notes: t('questCheetahNotes'),
    completion: t('questCheetahCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questCheetahBoss'),
      hp: 600,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Cheetah',
          text: t('questCheetahDropCheetahEgg')
        }, {
          type: 'eggs',
          key: 'Cheetah',
          text: t('questCheetahDropCheetahEgg')
        }, {
          type: 'eggs',
          key: 'Cheetah',
          text: t('questCheetahDropCheetahEgg')
        }
      ],
      gp: 43,
      exp: 350,
      unlock: t('questCheetahUnlockText')
    }
  },
  horse: {
    text: t('questHorseText'),
    notes: t('questHorseNotes'),
    completion: t('questHorseCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questHorseBoss'),
      hp: 500,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Horse',
          text: t('questHorseDropHorseEgg')
        }, {
          type: 'eggs',
          key: 'Horse',
          text: t('questHorseDropHorseEgg')
        }, {
          type: 'eggs',
          key: 'Horse',
          text: t('questHorseDropHorseEgg')
        }
      ],
      gp: 37,
      exp: 275,
      unlock: t('questHorseUnlockText')
    }
  },
  frog: {
    text: t('questFrogText'),
    notes: t('questFrogNotes'),
    completion: t('questFrogCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questFrogBoss'),
      hp: 300,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Frog',
          text: t('questFrogDropFrogEgg')
        }, {
          type: 'eggs',
          key: 'Frog',
          text: t('questFrogDropFrogEgg')
        }, {
          type: 'eggs',
          key: 'Frog',
          text: t('questFrogDropFrogEgg')
        }
      ],
      gp: 25,
      exp: 125,
      unlock: t('questFrogUnlockText')
    }
  },
  snake: {
    text: t('questSnakeText'),
    notes: t('questSnakeNotes'),
    completion: t('questSnakeCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSnakeBoss'),
      hp: 1100,
      str: 2.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Snake',
          text: t('questSnakeDropSnakeEgg')
        }, {
          type: 'eggs',
          key: 'Snake',
          text: t('questSnakeDropSnakeEgg')
        }, {
          type: 'eggs',
          key: 'Snake',
          text: t('questSnakeDropSnakeEgg')
        }
      ],
      gp: 73,
      exp: 725,
      unlock: t('questSnakeUnlockText')
    }
  }
};

_.each(api.quests, function(v, key) {
  var b;
  _.defaults(v, {
    key: key,
    canBuy: (function() {
      return true;
    })
  });
  b = v.boss;
  if (b) {
    _.defaults(b, {
      str: 1,
      def: 1
    });
    if (b.rage) {
      return _.defaults(b.rage, {
        title: t('bossRageTitle'),
        description: t('bossRageDescription')
      });
    }
  }
});

api.questsByLevel = _.sortBy(api.quests, function(quest) {
  return quest.lvl || 0;
});

api.backgrounds = {
  backgrounds062014: {
    beach: {
      text: t('backgroundBeachText'),
      notes: t('backgroundBeachNotes')
    },
    fairy_ring: {
      text: t('backgroundFairyRingText'),
      notes: t('backgroundFairyRingNotes')
    },
    forest: {
      text: t('backgroundForestText'),
      notes: t('backgroundForestNotes')
    }
  },
  backgrounds072014: {
    open_waters: {
      text: t('backgroundOpenWatersText'),
      notes: t('backgroundOpenWatersNotes')
    },
    coral_reef: {
      text: t('backgroundCoralReefText'),
      notes: t('backgroundCoralReefNotes')
    },
    seafarer_ship: {
      text: t('backgroundSeafarerShipText'),
      notes: t('backgroundSeafarerShipNotes')
    }
  },
  backgrounds082014: {
    volcano: {
      text: t('backgroundVolcanoText'),
      notes: t('backgroundVolcanoNotes')
    },
    clouds: {
      text: t('backgroundCloudsText'),
      notes: t('backgroundCloudsNotes')
    },
    dusty_canyons: {
      text: t('backgroundDustyCanyonsText'),
      notes: t('backgroundDustyCanyonsNotes')
    }
  },
  backgrounds092014: {
    thunderstorm: {
      text: t('backgroundThunderstormText'),
      notes: t('backgroundThunderstormNotes')
    },
    autumn_forest: {
      text: t('backgroundAutumnForestText'),
      notes: t('backgroundAutumnForestNotes')
    },
    harvest_fields: {
      text: t('backgroundHarvestFieldsText'),
      notes: t('backgroundHarvestFieldsNotes')
    }
  },
  backgrounds102014: {
    graveyard: {
      text: t('backgroundGraveyardText'),
      notes: t('backgroundGraveyardNotes')
    },
    haunted_house: {
      text: t('backgroundHauntedHouseText'),
      notes: t('backgroundHauntedHouseNotes')
    },
    pumpkin_patch: {
      text: t('backgroundPumpkinPatchText'),
      notes: t('backgroundPumpkinPatchNotes')
    }
  },
  backgrounds112014: {
    harvest_feast: {
      text: t('backgroundHarvestFeastText'),
      notes: t('backgroundHarvestFeastNotes')
    },
    sunset_meadow: {
      text: t('backgroundSunsetMeadowText'),
      notes: t('backgroundSunsetMeadowNotes')
    },
    starry_skies: {
      text: t('backgroundStarrySkiesText'),
      notes: t('backgroundStarrySkiesNotes')
    }
  },
  backgrounds122014: {
    iceberg: {
      text: t('backgroundIcebergText'),
      notes: t('backgroundIcebergNotes')
    },
    twinkly_lights: {
      text: t('backgroundTwinklyLightsText'),
      notes: t('backgroundTwinklyLightsNotes')
    },
    south_pole: {
      text: t('backgroundSouthPoleText'),
      notes: t('backgroundSouthPoleNotes')
    }
  },
  backgrounds012015: {
    ice_cave: {
      text: t('backgroundIceCaveText'),
      notes: t('backgroundIceCaveNotes')
    },
    frigid_peak: {
      text: t('backgroundFrigidPeakText'),
      notes: t('backgroundFrigidPeakNotes')
    },
    snowy_pines: {
      text: t('backgroundSnowyPinesText'),
      notes: t('backgroundSnowyPinesNotes')
    }
  },
  backgrounds022015: {
    blacksmithy: {
      text: t('backgroundBlacksmithyText'),
      notes: t('backgroundBlacksmithyNotes')
    },
    crystal_cave: {
      text: t('backgroundCrystalCaveText'),
      notes: t('backgroundCrystalCaveNotes')
    },
    distant_castle: {
      text: t('backgroundDistantCastleText'),
      notes: t('backgroundDistantCastleNotes')
    }
  },
  backgrounds032015: {
    spring_rain: {
      text: t('backgroundSpringRainText'),
      notes: t('backgroundSpringRainNotes')
    },
    stained_glass: {
      text: t('backgroundStainedGlassText'),
      notes: t('backgroundStainedGlassNotes')
    },
    rolling_hills: {
      text: t('backgroundRollingHillsText'),
      notes: t('backgroundRollingHillsNotes')
    }
  },
  backgrounds042015: {
    cherry_trees: {
      text: t('backgroundCherryTreesText'),
      notes: t('backgroundCherryTreesNotes')
    },
    floral_meadow: {
      text: t('backgroundFloralMeadowText'),
      notes: t('backgroundFloralMeadowNotes')
    },
    gumdrop_land: {
      text: t('backgroundGumdropLandText'),
      notes: t('backgroundGumdropLandNotes')
    }
  },
  backgrounds052015: {
    marble_temple: {
      text: t('backgroundMarbleTempleText'),
      notes: t('backgroundMarbleTempleNotes')
    },
    mountain_lake: {
      text: t('backgroundMountainLakeText'),
      notes: t('backgroundMountainLakeNotes')
    },
    pagodas: {
      text: t('backgroundPagodasText'),
      notes: t('backgroundPagodasNotes')
    }
  },
  backgrounds062015: {
    drifting_raft: {
      text: t('backgroundDriftingRaftText'),
      notes: t('backgroundDriftingRaftNotes')
    },
    shimmery_bubbles: {
      text: t('backgroundShimmeryBubblesText'),
      notes: t('backgroundShimmeryBubblesNotes')
    },
    island_waterfalls: {
      text: t('backgroundIslandWaterfallsText'),
      notes: t('backgroundIslandWaterfallsNotes')
    }
  },
  backgrounds072015: {
    dilatory_ruins: {
      text: t('backgroundDilatoryRuinsText'),
      notes: t('backgroundDilatoryRuinsNotes')
    },
    giant_wave: {
      text: t('backgroundGiantWaveText'),
      notes: t('backgroundGiantWaveNotes')
    },
    sunken_ship: {
      text: t('backgroundSunkenShipText'),
      notes: t('backgroundSunkenShipNotes')
    }
  },
  backgrounds082015: {
    pyramids: {
      text: t('backgroundPyramidsText'),
      notes: t('backgroundPyramidsNotes')
    },
    sunset_savannah: {
      text: t('backgroundSunsetSavannahText'),
      notes: t('backgroundSunsetSavannahNotes')
    },
    twinkly_party_lights: {
      text: t('backgroundTwinklyPartyLightsText'),
      notes: t('backgroundTwinklyPartyLightsNotes')
    }
  },
  backgrounds092015: {
    market: {
      text: t('backgroundMarketText'),
      notes: t('backgroundMarketNotes')
    },
    stable: {
      text: t('backgroundStableText'),
      notes: t('backgroundStableNotes')
    },
    tavern: {
      text: t('backgroundTavernText'),
      notes: t('backgroundTavernNotes')
    }
  },
  backgrounds102015: {
    harvest_moon: {
      text: t('backgroundHarvestMoonText'),
      notes: t('backgroundHarvestMoonNotes')
    },
    slimy_swamp: {
      text: t('backgroundSlimySwampText'),
      notes: t('backgroundSlimySwampNotes')
    },
    swarming_darkness: {
      text: t('backgroundSwarmingDarknessText'),
      notes: t('backgroundSwarmingDarknessNotes')
    }
  },
  backgrounds112015: {
    floating_islands: {
      text: t('backgroundFloatingIslandsText'),
      notes: t('backgroundFloatingIslandsNotes')
    },
    night_dunes: {
      text: t('backgroundNightDunesText'),
      notes: t('backgroundNightDunesNotes')
    },
    sunset_oasis: {
      text: t('backgroundSunsetOasisText'),
      notes: t('backgroundSunsetOasisNotes')
    }
  }
};

api.subscriptionBlocks = {
  basic_earned: {
    months: 1,
    price: 5
  },
  basic_3mo: {
    months: 3,
    price: 15
  },
  basic_6mo: {
    months: 6,
    price: 30
  },
  google_6mo: {
    months: 6,
    price: 24,
    discount: true,
    original: 30
  },
  basic_12mo: {
    months: 12,
    price: 48
  }
};

_.each(api.subscriptionBlocks, function(b, k) {
  return b.key = k;
});

api.userDefaults = {
  habits: [
    {
      type: 'habit',
      text: t('defaultHabit1Text'),
      value: 0,
      up: true,
      down: false,
      attribute: 'per'
    }, {
      type: 'habit',
      text: t('defaultHabit2Text'),
      value: 0,
      up: false,
      down: true,
      attribute: 'str'
    }, {
      type: 'habit',
      text: t('defaultHabit3Text'),
      value: 0,
      up: true,
      down: true,
      attribute: 'str'
    }
  ],
  dailys: [],
  todos: [
    {
      type: 'todo',
      text: t('defaultTodo1Text'),
      notes: t('defaultTodoNotes'),
      completed: false,
      attribute: 'int'
    }
  ],
  rewards: [
    {
      type: 'reward',
      text: t('defaultReward1Text'),
      value: 10
    }
  ],
  tags: [
    {
      name: t('defaultTag1')
    }, {
      name: t('defaultTag2')
    }, {
      name: t('defaultTag3')
    }
  ]
};

api.faq = require('./faq.js');
