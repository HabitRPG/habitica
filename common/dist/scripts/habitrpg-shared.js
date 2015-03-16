(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./script/index.coffee');
var _ = require('lodash');
var moment = require('moment');

if (typeof window !== 'undefined') {
  window.habitrpgShared = module.exports;
  window._ = _;
  window.moment = moment;
}

},{"./script/index.coffee":4,"lodash":6,"moment":7}],2:[function(require,module,exports){
var api, classes, diminishingReturns, events, gear, gearTypes, i18n, moment, repeat, t, _;

_ = require('lodash');

api = module.exports;

moment = require('moment');

i18n = require('./i18n.coffee');

t = function(string, vars) {
  var func;
  func = function(lang) {
    if (vars == null) {
      vars = {
        a: 'a'
      };
    }
    return i18n.t(string, vars, lang);
  };
  func.i18nLangFunc = true;
  return func;
};


/*
  ---------------------------------------------------------------
  Gear (Weapons, Armor, Head, Shield)
  Item definitions: {index, text, notes, value, str, def, int, per, classes, type}
  ---------------------------------------------------------------
 */

classes = ['warrior', 'rogue', 'healer', 'wizard'];

gearTypes = ['weapon', 'armor', 'head', 'shield', 'body', 'back', 'headAccessory', 'eyewear'];

events = {
  winter: {
    start: '2013-12-31',
    end: '2014-02-01'
  },
  birthday: {
    start: '2013-01-30',
    end: '2014-02-01'
  },
  spring: {
    start: '2014-03-21',
    end: '2014-05-01'
  },
  summer: {
    start: '2014-06-20',
    end: '2014-08-01'
  },
  gaymerx: {
    start: '2014-07-02',
    end: '2014-08-01'
  },
  fall: {
    start: '2014-09-21',
    end: '2014-11-01'
  },
  winter2015: {
    start: '2014-12-21',
    end: '2015-02-02'
  }
};

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
    text: 'Autumn Strider Item Set'
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
          var _ref;
          return +((_ref = u.backer) != null ? _ref.tier : void 0) >= 70;
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
          var _ref;
          return +((_ref = u.contributor) != null ? _ref.level : void 0) >= 4;
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
          var _ref;
          return (+((_ref = u.backer) != null ? _ref.tier : void 0) >= 300) || (u.items.gear.owned.weapon_special_2 != null);
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
          var _ref;
          return (+((_ref = u.backer) != null ? _ref.tier : void 0) >= 300) || (u.items.gear.owned.weapon_special_3 != null);
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
          var _ref;
          return !!((_ref = u.contributor) != null ? _ref.critical : void 0);
        })
      },
      yeti: {
        event: events.winter,
        specialClass: 'warrior',
        text: t('weaponSpecialYetiText'),
        notes: t('weaponSpecialYetiNotes', {
          str: 15
        }),
        str: 15,
        value: 90
      },
      ski: {
        event: events.winter,
        specialClass: 'rogue',
        text: t('weaponSpecialSkiText'),
        notes: t('weaponSpecialSkiNotes', {
          str: 8
        }),
        str: 8,
        value: 90
      },
      candycane: {
        event: events.winter,
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
        event: events.winter,
        specialClass: 'healer',
        text: t('weaponSpecialSnowflakeText'),
        notes: t('weaponSpecialSnowflakeNotes', {
          int: 9
        }),
        int: 9,
        value: 90
      },
      springRogue: {
        event: events.spring,
        specialClass: 'rogue',
        text: t('weaponSpecialSpringRogueText'),
        notes: t('weaponSpecialSpringRogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      springWarrior: {
        event: events.spring,
        specialClass: 'warrior',
        text: t('weaponSpecialSpringWarriorText'),
        notes: t('weaponSpecialSpringWarriorNotes', {
          str: 15
        }),
        value: 90,
        str: 15
      },
      springMage: {
        event: events.spring,
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
        event: events.spring,
        specialClass: 'healer',
        text: t('weaponSpecialSpringHealerText'),
        notes: t('weaponSpecialSpringHealerNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      summerRogue: {
        event: events.summer,
        specialClass: 'rogue',
        text: t('weaponSpecialSummerRogueText'),
        notes: t('weaponSpecialSummerRogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      summerWarrior: {
        event: events.summer,
        specialClass: 'warrior',
        text: t('weaponSpecialSummerWarriorText'),
        notes: t('weaponSpecialSummerWarriorNotes', {
          str: 15
        }),
        value: 90,
        str: 15
      },
      summerMage: {
        event: events.summer,
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
        event: events.summer,
        specialClass: 'healer',
        text: t('weaponSpecialSummerHealerText'),
        notes: t('weaponSpecialSummerHealerNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      fallRogue: {
        event: events.fall,
        specialClass: 'rogue',
        text: t('weaponSpecialFallRogueText'),
        notes: t('weaponSpecialFallRogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      fallWarrior: {
        event: events.fall,
        specialClass: 'warrior',
        text: t('weaponSpecialFallWarriorText'),
        notes: t('weaponSpecialFallWarriorNotes', {
          str: 15
        }),
        value: 90,
        str: 15
      },
      fallMage: {
        event: events.fall,
        specialClass: 'wizard',
        twoHanded: true,
        text: t('weaponSpecialFallMageText'),
        notes: t('weaponSpecialFallMageNotes', {
          int: 15,
          per: 7
        }),
        value: 160,
        int: 15,
        per: 7
      },
      fallHealer: {
        event: events.fall,
        specialClass: 'healer',
        text: t('weaponSpecialFallHealerText'),
        notes: t('weaponSpecialFallHealerNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      winter2015Rogue: {
        event: events.winter2015,
        specialClass: 'rogue',
        text: t('weaponSpecialWinter2015RogueText'),
        notes: t('weaponSpecialWinter2015RogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      winter2015Warrior: {
        event: events.winter2015,
        specialClass: 'warrior',
        text: t('weaponSpecialWinter2015WarriorText'),
        notes: t('weaponSpecialWinter2015WarriorNotes', {
          str: 15
        }),
        value: 90,
        str: 15
      },
      winter2015Mage: {
        event: events.winter2015,
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
        event: events.winter2015,
        specialClass: 'healer',
        text: t('weaponSpecialWinter2015HealerText'),
        notes: t('weaponSpecialWinter2015HealerNotes', {
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
      301404: {
        text: t('weaponMystery301404Text'),
        notes: t('weaponMystery301404Notes'),
        mystery: '301404',
        value: 0
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
          var _ref;
          return +((_ref = u.backer) != null ? _ref.tier : void 0) >= 45;
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
          var _ref;
          return +((_ref = u.contributor) != null ? _ref.level : void 0) >= 2;
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
          var _ref;
          return +((_ref = u.backer) != null ? _ref.tier : void 0) >= 300 || (u.items.gear.owned.armor_special_2 != null);
        })
      },
      yeti: {
        event: events.winter,
        specialClass: 'warrior',
        text: t('armorSpecialYetiText'),
        notes: t('armorSpecialYetiNotes', {
          con: 9
        }),
        con: 9,
        value: 90
      },
      ski: {
        event: events.winter,
        specialClass: 'rogue',
        text: t('armorSpecialSkiText'),
        notes: t('armorSpecialSkiNotes', {
          per: 15
        }),
        per: 15,
        value: 90
      },
      candycane: {
        event: events.winter,
        specialClass: 'wizard',
        text: t('armorSpecialCandycaneText'),
        notes: t('armorSpecialCandycaneNotes', {
          int: 9
        }),
        int: 9,
        value: 90
      },
      snowflake: {
        event: events.winter,
        specialClass: 'healer',
        text: t('armorSpecialSnowflakeText'),
        notes: t('armorSpecialSnowflakeNotes', {
          con: 15
        }),
        con: 15,
        value: 90
      },
      birthday: {
        event: events.birthday,
        text: t('armorSpecialBirthdayText'),
        notes: t('armorSpecialBirthdayNotes'),
        value: 0
      },
      springRogue: {
        event: events.spring,
        specialClass: 'rogue',
        text: t('armorSpecialSpringRogueText'),
        notes: t('armorSpecialSpringRogueNotes', {
          per: 15
        }),
        value: 90,
        per: 15
      },
      springWarrior: {
        event: events.spring,
        specialClass: 'warrior',
        text: t('armorSpecialSpringWarriorText'),
        notes: t('armorSpecialSpringWarriorNotes', {
          con: 9
        }),
        value: 90,
        con: 9
      },
      springMage: {
        event: events.spring,
        specialClass: 'wizard',
        text: t('armorSpecialSpringMageText'),
        notes: t('armorSpecialSpringMageNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      springHealer: {
        event: events.spring,
        specialClass: 'healer',
        text: t('armorSpecialSpringHealerText'),
        notes: t('armorSpecialSpringHealerNotes', {
          con: 15
        }),
        value: 90,
        con: 15
      },
      summerRogue: {
        event: events.summer,
        specialClass: 'rogue',
        text: t('armorSpecialSummerRogueText'),
        notes: t('armorSpecialSummerRogueNotes', {
          per: 15
        }),
        value: 90,
        per: 15
      },
      summerWarrior: {
        event: events.summer,
        specialClass: 'warrior',
        text: t('armorSpecialSummerWarriorText'),
        notes: t('armorSpecialSummerWarriorNotes', {
          con: 9
        }),
        value: 90,
        con: 9
      },
      summerMage: {
        event: events.summer,
        specialClass: 'wizard',
        text: t('armorSpecialSummerMageText'),
        notes: t('armorSpecialSummerMageNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      summerHealer: {
        event: events.summer,
        specialClass: 'healer',
        text: t('armorSpecialSummerHealerText'),
        notes: t('armorSpecialSummerHealerNotes', {
          con: 15
        }),
        value: 90,
        con: 15
      },
      fallRogue: {
        event: events.fall,
        specialClass: 'rogue',
        text: t('armorSpecialFallRogueText'),
        notes: t('armorSpecialFallRogueNotes', {
          per: 15
        }),
        value: 90,
        per: 15
      },
      fallWarrior: {
        event: events.fall,
        specialClass: 'warrior',
        text: t('armorSpecialFallWarriorText'),
        notes: t('armorSpecialFallWarriorNotes', {
          con: 9
        }),
        value: 90,
        con: 9
      },
      fallMage: {
        event: events.fall,
        specialClass: 'wizard',
        text: t('armorSpecialFallMageText'),
        notes: t('armorSpecialFallMageNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      fallHealer: {
        event: events.fall,
        specialClass: 'healer',
        text: t('armorSpecialFallHealerText'),
        notes: t('armorSpecialFallHealerNotes', {
          con: 15
        }),
        value: 90,
        con: 15
      },
      winter2015Rogue: {
        event: events.winter2015,
        specialClass: 'rogue',
        text: t('armorSpecialWinter2015RogueText'),
        notes: t('armorSpecialWinter2015RogueNotes', {
          per: 15
        }),
        value: 90,
        per: 15
      },
      winter2015Warrior: {
        event: events.winter2015,
        specialClass: 'warrior',
        text: t('armorSpecialWinter2015WarriorText'),
        notes: t('armorSpecialWinter2015WarriorNotes', {
          con: 9
        }),
        value: 90,
        con: 9
      },
      winter2015Mage: {
        event: events.winter2015,
        specialClass: 'wizard',
        text: t('armorSpecialWinter2015MageText'),
        notes: t('armorSpecialWinter2015MageNotes', {
          int: 9
        }),
        value: 90,
        int: 9
      },
      winter2015Healer: {
        event: events.winter2015,
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
      gaymerx: {
        event: events.gaymerx,
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
      301404: {
        text: t('armorMystery301404Text'),
        notes: t('armorMystery301404Notes'),
        mystery: '301404',
        value: 0
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
          var _ref;
          return +((_ref = u.backer) != null ? _ref.tier : void 0) >= 45;
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
          var _ref;
          return +((_ref = u.contributor) != null ? _ref.level : void 0) >= 3;
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
          var _ref;
          return (+((_ref = u.backer) != null ? _ref.tier : void 0) >= 300) || (u.items.gear.owned.head_special_2 != null);
        })
      },
      nye: {
        event: events.winter,
        text: t('headSpecialNyeText'),
        notes: t('headSpecialNyeNotes'),
        value: 0
      },
      yeti: {
        event: events.winter,
        specialClass: 'warrior',
        text: t('headSpecialYetiText'),
        notes: t('headSpecialYetiNotes', {
          str: 9
        }),
        str: 9,
        value: 60
      },
      ski: {
        event: events.winter,
        specialClass: 'rogue',
        text: t('headSpecialSkiText'),
        notes: t('headSpecialSkiNotes', {
          per: 9
        }),
        per: 9,
        value: 60
      },
      candycane: {
        event: events.winter,
        specialClass: 'wizard',
        text: t('headSpecialCandycaneText'),
        notes: t('headSpecialCandycaneNotes', {
          per: 7
        }),
        per: 7,
        value: 60
      },
      snowflake: {
        event: events.winter,
        specialClass: 'healer',
        text: t('headSpecialSnowflakeText'),
        notes: t('headSpecialSnowflakeNotes', {
          int: 7
        }),
        int: 7,
        value: 60
      },
      springRogue: {
        event: events.spring,
        specialClass: 'rogue',
        text: t('headSpecialSpringRogueText'),
        notes: t('headSpecialSpringRogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      springWarrior: {
        event: events.spring,
        specialClass: 'warrior',
        text: t('headSpecialSpringWarriorText'),
        notes: t('headSpecialSpringWarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      springMage: {
        event: events.spring,
        specialClass: 'wizard',
        text: t('headSpecialSpringMageText'),
        notes: t('headSpecialSpringMageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      springHealer: {
        event: events.spring,
        specialClass: 'healer',
        text: t('headSpecialSpringHealerText'),
        notes: t('headSpecialSpringHealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7
      },
      summerRogue: {
        event: events.summer,
        specialClass: 'rogue',
        text: t('headSpecialSummerRogueText'),
        notes: t('headSpecialSummerRogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      summerWarrior: {
        event: events.summer,
        specialClass: 'warrior',
        text: t('headSpecialSummerWarriorText'),
        notes: t('headSpecialSummerWarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      summerMage: {
        event: events.summer,
        specialClass: 'wizard',
        text: t('headSpecialSummerMageText'),
        notes: t('headSpecialSummerMageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      summerHealer: {
        event: events.summer,
        specialClass: 'healer',
        text: t('headSpecialSummerHealerText'),
        notes: t('headSpecialSummerHealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7
      },
      fallRogue: {
        event: events.fall,
        specialClass: 'rogue',
        text: t('headSpecialFallRogueText'),
        notes: t('headSpecialFallRogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      fallWarrior: {
        event: events.fall,
        specialClass: 'warrior',
        text: t('headSpecialFallWarriorText'),
        notes: t('headSpecialFallWarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      fallMage: {
        event: events.fall,
        specialClass: 'wizard',
        text: t('headSpecialFallMageText'),
        notes: t('headSpecialFallMageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      fallHealer: {
        event: events.fall,
        specialClass: 'healer',
        text: t('headSpecialFallHealerText'),
        notes: t('headSpecialFallHealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7
      },
      winter2015Rogue: {
        event: events.winter2015,
        specialClass: 'rogue',
        text: t('headSpecialWinter2015RogueText'),
        notes: t('headSpecialWinter2015RogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      winter2015Warrior: {
        event: events.winter2015,
        specialClass: 'warrior',
        text: t('headSpecialWinter2015WarriorText'),
        notes: t('headSpecialWinter2015WarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      winter2015Mage: {
        event: events.winter2015,
        specialClass: 'wizard',
        text: t('headSpecialWinter2015MageText'),
        notes: t('headSpecialWinter2015MageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      winter2015Healer: {
        event: events.winter2015,
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
      gaymerx: {
        event: events.gaymerx,
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
          var _ref;
          return +((_ref = u.backer) != null ? _ref.tier : void 0) >= 45;
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
          var _ref;
          return +((_ref = u.contributor) != null ? _ref.level : void 0) >= 5;
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
      yeti: {
        event: events.winter,
        specialClass: 'warrior',
        text: t('shieldSpecialYetiText'),
        notes: t('shieldSpecialYetiNotes', {
          con: 7
        }),
        con: 7,
        value: 70
      },
      ski: {
        event: events.winter,
        specialClass: 'rogue',
        text: t('weaponSpecialSkiText'),
        notes: t('weaponSpecialSkiNotes', {
          str: 8
        }),
        str: 8,
        value: 90
      },
      snowflake: {
        event: events.winter,
        specialClass: 'healer',
        text: t('shieldSpecialSnowflakeText'),
        notes: t('shieldSpecialSnowflakeNotes', {
          con: 9
        }),
        con: 9,
        value: 70
      },
      springRogue: {
        event: events.spring,
        specialClass: 'rogue',
        text: t('shieldSpecialSpringRogueText'),
        notes: t('shieldSpecialSpringRogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      springWarrior: {
        event: events.spring,
        specialClass: 'warrior',
        text: t('shieldSpecialSpringWarriorText'),
        notes: t('shieldSpecialSpringWarriorNotes', {
          con: 7
        }),
        value: 70,
        con: 7
      },
      springHealer: {
        event: events.spring,
        specialClass: 'healer',
        text: t('shieldSpecialSpringHealerText'),
        notes: t('shieldSpecialSpringHealerNotes', {
          con: 9
        }),
        value: 70,
        con: 9
      },
      summerRogue: {
        event: events.summer,
        specialClass: 'rogue',
        text: t('shieldSpecialSummerRogueText'),
        notes: t('shieldSpecialSummerRogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      summerWarrior: {
        event: events.summer,
        specialClass: 'warrior',
        text: t('shieldSpecialSummerWarriorText'),
        notes: t('shieldSpecialSummerWarriorNotes', {
          con: 7
        }),
        value: 70,
        con: 7
      },
      summerHealer: {
        event: events.summer,
        specialClass: 'healer',
        text: t('shieldSpecialSummerHealerText'),
        notes: t('shieldSpecialSummerHealerNotes', {
          con: 9
        }),
        value: 70,
        con: 9
      },
      fallRogue: {
        event: events.fall,
        specialClass: 'rogue',
        text: t('shieldSpecialFallRogueText'),
        notes: t('shieldSpecialFallRogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      fallWarrior: {
        event: events.fall,
        specialClass: 'warrior',
        text: t('shieldSpecialFallWarriorText'),
        notes: t('shieldSpecialFallWarriorNotes', {
          con: 7
        }),
        value: 70,
        con: 7
      },
      fallHealer: {
        event: events.fall,
        specialClass: 'healer',
        text: t('shieldSpecialFallHealerText'),
        notes: t('shieldSpecialFallHealerNotes', {
          con: 9
        }),
        value: 70,
        con: 9
      },
      winter2015Rogue: {
        event: events.winter2015,
        specialClass: 'rogue',
        text: t('shieldSpecialWinter2015RogueText'),
        notes: t('shieldSpecialWinter2015RogueNotes', {
          str: 8
        }),
        value: 80,
        str: 8
      },
      winter2015Warrior: {
        event: events.winter2015,
        specialClass: 'warrior',
        text: t('shieldSpecialWinter2015WarriorText'),
        notes: t('shieldSpecialWinter2015WarriorNotes', {
          con: 7
        }),
        value: 70,
        con: 7
      },
      winter2015Healer: {
        event: events.winter2015,
        specialClass: 'healer',
        text: t('shieldSpecialWinter2015HealerText'),
        notes: t('shieldSpecialWinter2015HealerNotes', {
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
        event: events.summer,
        specialClass: 'healer',
        text: t('bodySpecialSummerHealerText'),
        notes: t('bodySpecialSummerHealerNotes'),
        value: 20
      },
      summerMage: {
        event: events.summer,
        specialClass: 'wizard',
        text: t('bodySpecialSummerMageText'),
        notes: t('bodySpecialSummerMageNotes'),
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
        event: events.spring,
        specialClass: 'rogue',
        text: t('headAccessorySpecialSpringRogueText'),
        notes: t('headAccessorySpecialSpringRogueNotes'),
        value: 20
      },
      springWarrior: {
        event: events.spring,
        specialClass: 'warrior',
        text: t('headAccessorySpecialSpringWarriorText'),
        notes: t('headAccessorySpecialSpringWarriorNotes'),
        value: 20
      },
      springMage: {
        event: events.spring,
        specialClass: 'wizard',
        text: t('headAccessorySpecialSpringMageText'),
        notes: t('headAccessorySpecialSpringMageNotes'),
        value: 20
      },
      springHealer: {
        event: events.spring,
        specialClass: 'healer',
        text: t('headAccessorySpecialSpringHealerText'),
        notes: t('headAccessorySpecialSpringHealerNotes'),
        value: 20
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
        event: events.summer,
        specialClass: 'rogue',
        text: t('eyewearSpecialSummerRogueText'),
        notes: t('eyewearSpecialSummerRogueNotes'),
        value: 20
      },
      summerWarrior: {
        event: events.summer,
        specialClass: 'warrior',
        text: t('eyewearSpecialSummerWarriorText'),
        notes: t('eyewearSpecialSummerWarriorNotes'),
        value: 20
      }
    },
    mystery: {
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
    }
  }
};


/*
  The gear is exported as a tree (defined above), and a flat list (eg, {weapon_healer_1: .., shield_special_0: ...}) since
  they are needed in different froms at different points in the app
 */

api.gear = {
  tree: gear,
  flat: {}
};

_.each(gearTypes, function(type) {
  return _.each(classes.concat(['base', 'special', 'mystery']), function(klass) {
    return _.each(gear[type][klass], function(item, i) {
      var key, _canOwn;
      key = "" + type + "_" + klass + "_" + i;
      _.defaults(item, {
        type: type,
        key: key,
        klass: klass,
        index: i,
        str: 0,
        int: 0,
        per: 0,
        con: 0
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
  Potion
  ---------------------------------------------------------------
 */

api.potion = {
  type: 'potion',
  text: t('potionText'),
  notes: t('potionNotes'),
  value: 25,
  key: 'potion'
};


/*
   ---------------------------------------------------------------
   Classes
   ---------------------------------------------------------------
 */

api.classes = classes;


/*
   ---------------------------------------------------------------
   Gear Types
   ---------------------------------------------------------------
 */

api.gearTypes = gearTypes;


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

api.spells = {
  wizard: {
    fireball: {
      text: t('spellWizardFireballText'),
      mana: 10,
      lvl: 11,
      target: 'task',
      notes: t('spellWizardFireballNotes'),
      cast: function(user, target) {
        var bonus;
        bonus = user._statsComputed.int * user.fns.crit('per');
        target.value += diminishingReturns(bonus * .02, 4);
        bonus *= Math.ceil((target.value < 0 ? 1 : target.value + 1) * .075);
        user.stats.exp += diminishingReturns(bonus, 75);
        return user.party.quest.progress.up += diminishingReturns(bonus * .1, 50, 30);
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
          bonus = Math.ceil(user._statsComputed.int * .1);
          if (bonus > 25) {
            bonus = 25;
          }
          return member.stats.mp += bonus;
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
          var _base;
          if ((_base = member.stats.buffs).int == null) {
            _base.int = 0;
          }
          return member.stats.buffs.int += Math.ceil(user._statsComputed.int * .05);
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
        target.value += 2.5 * (user._statsComputed.str / (user._statsComputed.str + 50)) * user.fns.crit('con');
        return user.party.quest.progress.up += Math.ceil(user._statsComputed.str * .2);
      }
    },
    defensiveStance: {
      text: t('spellWarriorDefensiveStanceText'),
      mana: 25,
      lvl: 12,
      target: 'self',
      notes: t('spellWarriorDefensiveStanceNotes'),
      cast: function(user, target) {
        var _base;
        if ((_base = user.stats.buffs).con == null) {
          _base.con = 0;
        }
        return user.stats.buffs.con += Math.ceil(user._statsComputed.con * .05);
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
          var _base;
          if ((_base = member.stats.buffs).str == null) {
            _base.str = 0;
          }
          return member.stats.buffs.str += Math.ceil(user._statsComputed.str * .05);
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
          var _base;
          if ((_base = member.stats.buffs).con == null) {
            _base.con = 0;
          }
          return member.stats.buffs.con += Math.ceil(user._statsComputed.con * .03);
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
        bonus = (target.value < 0 ? 1 : target.value + 2) + (user._statsComputed.per * 0.5);
        return user.stats.gp += 25 * (bonus / (bonus + 75));
      }
    },
    backStab: {
      text: t('spellRogueBackStabText'),
      mana: 15,
      lvl: 12,
      target: 'task',
      notes: t('spellRogueBackStabNotes'),
      cast: function(user, target) {
        var bonus, _crit;
        _crit = user.fns.crit('str', .3);
        target.value += _crit * .03;
        bonus = (target.value < 0 ? 1 : target.value + 1) * _crit;
        user.stats.exp += bonus;
        return user.stats.gp += bonus;
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
          var _base;
          if ((_base = member.stats.buffs).per == null) {
            _base.per = 0;
          }
          return member.stats.buffs.per += Math.ceil(user._statsComputed.per * .03);
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
        var _base;
        if ((_base = user.stats.buffs).stealth == null) {
          _base.stealth = 0;
        }
        return user.stats.buffs.stealth += Math.ceil(user.dailys.length * user._statsComputed.per / 100);
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
          return target.value += 1.5 * (user._statsComputed.int / (user._statsComputed.int + 40));
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
          var _base;
          if ((_base = member.stats.buffs).con == null) {
            _base.con = 0;
          }
          return member.stats.buffs.con += Math.ceil(user._statsComputed.con * .15);
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
        var _base;
        target.stats.buffs.snowball = true;
        if ((_base = target.achievements).snowball == null) {
          _base.snowball = 0;
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
        var _base;
        target.stats.buffs.spookDust = true;
        if ((_base = target.achievements).spookDust == null) {
          _base.spookDust = 0;
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
    nye: {
      text: t('nyeCard'),
      mana: 0,
      value: 10,
      immediateUse: true,
      silent: true,
      target: 'user',
      notes: t('nyeCardNotes'),
      cast: function(user, target) {
        var _base;
        if (user === target) {
          if ((_base = user.achievements).nye == null) {
            _base.nye = 0;
          }
          user.achievements.nye++;
        } else {
          _.each([user, target], function(t) {
            var _base1;
            if ((_base1 = t.achievements).nye == null) {
              _base1.nye = 0;
            }
            return t.achievements.nye++;
          });
        }
        if (!target.items.special.nyeReceived) {
          target.items.special.nyeReceived = [];
        }
        target.items.special.nyeReceived.push(user.profile.name);
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
        var _base;
        if (user === target) {
          if ((_base = user.achievements).valentine == null) {
            _base.valentine = 0;
          }
          user.achievements.valentine++;
        } else {
          _.each([user, target], function(t) {
            var _base1;
            if ((_base1 = t.achievements).valentine == null) {
              _base1.valentine = 0;
            }
            return t.achievements.valentine++;
          });
        }
        if (!target.items.special.valentineReceived) {
          target.items.special.valentineReceived = [];
        }
        target.items.special.valentineReceived.push(user.profile.name);
        if (typeof target.markModified === "function") {
          target.markModified('items.special.valentineReceived');
        }
        return user.stats.gp -= 10;
      }
    }
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
    canBuy: true,
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
    canBuy: false
  },
  Hedgehog: {
    text: t('questEggHedgehogText'),
    adjective: t('questEggHedgehogAdjective'),
    canBuy: false
  },
  Deer: {
    text: t('questEggDeerText'),
    adjective: t('questEggDeerAdjective'),
    canBuy: false
  },
  Egg: {
    text: t('questEggEggText'),
    adjective: t('questEggEggAdjective'),
    canBuy: false,
    noMount: true
  },
  Rat: {
    text: t('questEggRatText'),
    adjective: t('questEggRatAdjective'),
    canBuy: false
  },
  Octopus: {
    text: t('questEggOctopusText'),
    adjective: t('questEggOctopusAdjective'),
    canBuy: false
  },
  Seahorse: {
    text: t('questEggSeahorseText'),
    adjective: t('questEggSeahorseAdjective'),
    canBuy: false
  },
  Parrot: {
    text: t('questEggParrotText'),
    adjective: t('questEggParrotAdjective'),
    canBuy: false
  },
  Rooster: {
    text: t('questEggRoosterText'),
    adjective: t('questEggRoosterAdjective'),
    canBuy: false
  },
  Spider: {
    text: t('questEggSpiderText'),
    adjective: t('questEggSpiderAdjective'),
    canBuy: false
  },
  Owl: {
    text: t('questEggOwlText'),
    adjective: t('questEggOwlAdjective'),
    canBuy: false
  },
  Penguin: {
    text: t('questEggPenguinText'),
    adjective: t('questEggPenguinAdjective'),
    canBuy: false
  },
  TRex: {
    text: t('questEggTRexText'),
    adjective: t('questEggTRexAdjective'),
    canBuy: false
  },
  Rock: {
    text: t('questEggRockText'),
    adjective: t('questEggRockAdjective'),
    canBuy: false
  }
};

_.each(api.questEggs, function(egg, key) {
  return _.defaults(egg, {
    canBuy: false,
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
  'Mammoth-Base': 'mammoth'
};

api.specialMounts = {
  'BearCub-Polar': 'polarBear',
  'LionCub-Ethereal': 'etherealLion',
  'MantisShrimp-Base': 'mantisShrimp',
  'Turkey-Base': 'turkey',
  'Mammoth-Base': 'mammoth'
};

api.hatchingPotions = {
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

_.each(api.hatchingPotions, function(pot, key) {
  return _.defaults(pot, {
    key: key,
    value: 2,
    notes: t('hatchingPotionNotes', {
      potText: pot.text
    })
  });
});

api.pets = _.transform(api.dropEggs, function(m, egg) {
  return _.defaults(m, _.transform(api.hatchingPotions, function(m2, pot) {
    return m2[egg.key + "-" + pot.key] = true;
  }));
});

api.questPets = _.transform(api.questEggs, function(m, egg) {
  return _.defaults(m, _.transform(api.hatchingPotions, function(m2, pot) {
    return m2[egg.key + "-" + pot.key] = true;
  }));
});

api.mounts = _.transform(api.dropEggs, function(m, egg) {
  return _.defaults(m, _.transform(api.hatchingPotions, function(m2, pot) {
    return m2[egg.key + "-" + pot.key] = true;
  }));
});

api.questMounts = _.transform(api.questEggs, function(m, egg) {
  return _.defaults(m, _.transform(api.hatchingPotions, function(m2, pot) {
    return m2[egg.key + "-" + pot.key] = true;
  }));
});

api.food = {
  Meat: {
    canBuy: true,
    canDrop: true,
    text: t('foodMeat'),
    target: 'Base',
    article: ''
  },
  Milk: {
    canBuy: true,
    canDrop: true,
    text: t('foodMilk'),
    target: 'White',
    article: ''
  },
  Potatoe: {
    canBuy: true,
    canDrop: true,
    text: t('foodPotatoe'),
    target: 'Desert',
    article: 'a '
  },
  Strawberry: {
    canBuy: true,
    canDrop: true,
    text: t('foodStrawberry'),
    target: 'Red',
    article: 'a '
  },
  Chocolate: {
    canBuy: true,
    canDrop: true,
    text: t('foodChocolate'),
    target: 'Shade',
    article: ''
  },
  Fish: {
    canBuy: true,
    canDrop: true,
    text: t('foodFish'),
    target: 'Skeleton',
    article: 'a '
  },
  RottenMeat: {
    canBuy: true,
    canDrop: true,
    text: t('foodRottenMeat'),
    target: 'Zombie',
    article: ''
  },
  CottonCandyPink: {
    canBuy: true,
    canDrop: true,
    text: t('foodCottonCandyPink'),
    target: 'CottonCandyPink',
    article: ''
  },
  CottonCandyBlue: {
    canBuy: true,
    canDrop: true,
    text: t('foodCottonCandyBlue'),
    target: 'CottonCandyBlue',
    article: ''
  },
  Honey: {
    canBuy: true,
    canDrop: true,
    text: t('foodHoney'),
    target: 'Golden',
    article: ''
  },
  Saddle: {
    canBuy: true,
    canDrop: false,
    text: t('foodSaddleText'),
    value: 5,
    notes: t('foodSaddleNotes')
  },
  Cake_Skeleton: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeSkeleton'),
    target: 'Skeleton',
    article: ''
  },
  Cake_Base: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeBase'),
    target: 'Base',
    article: ''
  },
  Cake_CottonCandyBlue: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeCottonCandyBlue'),
    target: 'CottonCandyBlue',
    article: ''
  },
  Cake_CottonCandyPink: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeCottonCandyPink'),
    target: 'CottonCandyPink',
    article: ''
  },
  Cake_Shade: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeShade'),
    target: 'Shade',
    article: ''
  },
  Cake_White: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeWhite'),
    target: 'White',
    article: ''
  },
  Cake_Golden: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeGolden'),
    target: 'Golden',
    article: ''
  },
  Cake_Zombie: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeZombie'),
    target: 'Zombie',
    article: ''
  },
  Cake_Desert: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeDesert'),
    target: 'Desert',
    article: ''
  },
  Cake_Red: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeRed'),
    target: 'Red',
    article: ''
  },
  Candy_Skeleton: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandySkeleton'),
    target: 'Skeleton',
    article: ''
  },
  Candy_Base: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyBase'),
    target: 'Base',
    article: ''
  },
  Candy_CottonCandyBlue: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyCottonCandyBlue'),
    target: 'CottonCandyBlue',
    article: ''
  },
  Candy_CottonCandyPink: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyCottonCandyPink'),
    target: 'CottonCandyPink',
    article: ''
  },
  Candy_Shade: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyShade'),
    target: 'Shade',
    article: ''
  },
  Candy_White: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyWhite'),
    target: 'White',
    article: ''
  },
  Candy_Golden: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyGolden'),
    target: 'Golden',
    article: ''
  },
  Candy_Zombie: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyZombie'),
    target: 'Zombie',
    article: ''
  },
  Candy_Desert: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyDesert'),
    target: 'Desert',
    article: ''
  },
  Candy_Red: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyRed'),
    target: 'Red',
    article: ''
  }
};

_.each(api.food, function(food, key) {
  return _.defaults(food, {
    value: 1,
    key: key,
    notes: t('foodNotes')
  });
});

api.quests = {
  dilatory: {
    text: t("questDilatoryText"),
    notes: t("questDilatoryNotes"),
    completion: t("questDilatoryCompletion"),
    value: 0,
    canBuy: false,
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
    canBuy: false,
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
  evilsanta: {
    canBuy: false,
    text: t('questEvilSantaText'),
    notes: t('questEvilSantaNotes'),
    completion: t('questEvilSantaCompletion'),
    value: 4,
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
    canBuy: false,
    text: t('questEvilSanta2Text'),
    notes: t('questEvilSanta2Notes'),
    completion: t('questEvilSanta2Completion'),
    value: 4,
    previous: 'evilsanta',
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
      exp: 125
    }
  },
  hedgehog: {
    text: t('questHedgehogText'),
    notes: t('questHedgehogNotes'),
    completion: t('questHedgehogCompletion'),
    value: 4,
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
      exp: 125
    }
  },
  ghost_stag: {
    text: t('questGhostStagText'),
    notes: t('questGhostStagNotes'),
    completion: t('questGhostStagCompletion'),
    value: 4,
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
      exp: 800
    }
  },
  vice1: {
    text: t('questVice1Text'),
    notes: t('questVice1Notes'),
    value: 4,
    lvl: 30,
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
    lvl: 35,
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
    lvl: 40,
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
    canBuy: false,
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
      exp: 800
    }
  },
  octopus: {
    text: t('questOctopusText'),
    notes: t('questOctopusNotes'),
    completion: t('questOctopusCompletion'),
    value: 4,
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
      exp: 800
    }
  },
  dilatory_derby: {
    text: t('questSeahorseText'),
    notes: t('questSeahorseNotes'),
    completion: t('questSeahorseCompletion'),
    value: 4,
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
      exp: 125
    }
  },
  atom1: {
    text: t('questAtom1Text'),
    notes: t('questAtom1Notes'),
    value: 4,
    lvl: 15,
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
      exp: 350
    }
  },
  rooster: {
    text: t('questRoosterText'),
    notes: t('questRoosterNotes'),
    completion: t('questRoosterCompletion'),
    value: 4,
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
      exp: 125
    }
  },
  spider: {
    text: t('questSpiderText'),
    notes: t('questSpiderNotes'),
    completion: t('questSpiderCompletion'),
    value: 4,
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
      exp: 200
    }
  },
  moonstone1: {
    text: t('questMoonstone1Text'),
    notes: t('questMoonstone1Notes'),
    value: 4,
    lvl: 60,
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
    lvl: 65,
    previous: 'moonstone1',
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
    lvl: 70,
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
    lvl: 45,
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
    lvl: 50,
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
    canBuy: false,
    value: 4,
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
      exp: 275
    }
  },
  penguin: {
    text: t('questPenguinText'),
    notes: t('questPenguinNotes'),
    completion: t('questPenguinCompletion'),
    value: 4,
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
      exp: 200
    }
  },
  trex: {
    text: t('questTRexText'),
    notes: t('questTRexNotes'),
    completion: t('questTRexCompletion'),
    value: 4,
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
      exp: 500
    }
  },
  trex_undead: {
    text: t('questTRexUndeadText'),
    notes: t('questTRexUndeadNotes'),
    completion: t('questTRexUndeadCompletion'),
    value: 4,
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
      exp: 500
    }
  },
  rock: {
    text: t('questRockText'),
    notes: t('questRockNotes'),
    completion: t('questRockCompletion'),
    value: 4,
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
      exp: 200
    }
  }
};

_.each(api.quests, function(v, key) {
  var b;
  _.defaults(v, {
    key: key,
    canBuy: true
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

repeat = {
  m: true,
  t: true,
  w: true,
  th: true,
  f: true,
  s: true,
  su: true
};

api.userDefaults = {
  habits: [
    {
      type: 'habit',
      text: t('defaultHabit1Text'),
      notes: t('defaultHabit1Notes'),
      value: 0,
      up: true,
      down: false,
      attribute: 'str'
    }, {
      type: 'habit',
      text: t('defaultHabit2Text'),
      notes: t('defaultHabit2Notes'),
      value: 0,
      up: false,
      down: true,
      attribute: 'str'
    }, {
      type: 'habit',
      text: t('defaultHabit3Text'),
      notes: t('defaultHabit3Notes'),
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
  rewards: [],
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


},{"./i18n.coffee":3,"lodash":6,"moment":7}],3:[function(require,module,exports){
var _;

_ = require('lodash');

module.exports = {
  strings: null,
  translations: {},
  t: function(stringName) {
    var clonedVars, e, locale, string, stringNotFound, vars;
    vars = arguments[1];
    if (_.isString(arguments[1])) {
      vars = null;
      locale = arguments[1];
    } else if (arguments[2] != null) {
      vars = arguments[1];
      locale = arguments[2];
    }
    if ((locale == null) || (!module.exports.strings && !module.exports.translations[locale])) {
      locale = 'en';
    }
    string = !module.exports.strings ? module.exports.translations[locale][stringName] : module.exports.strings[stringName];
    clonedVars = _.clone(vars) || {};
    clonedVars.locale = locale;
    if (string) {
      try {
        return _.template(string, clonedVars);
      } catch (_error) {
        e = _error;
        return 'Error processing string. Please report to http://github.com/HabitRPG/habitrpg.';
      }
    } else {
      stringNotFound = !module.exports.strings ? module.exports.translations[locale].stringNotFound : module.exports.strings.stringNotFound;
      try {
        return _.template(stringNotFound, {
          string: stringName
        });
      } catch (_error) {
        e = _error;
        return 'Error processing string. Please report to http://github.com/HabitRPG/habitrpg.';
      }
    }
  }
};


},{"lodash":6}],4:[function(require,module,exports){
(function (process){
var $w, api, content, i18n, moment, preenHistory, sanitizeOptions, sortOrder, _,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

moment = require('moment');

_ = require('lodash');

content = require('./content.coffee');

i18n = require('./i18n.coffee');

api = module.exports = {};

api.i18n = i18n;

$w = api.$w = function(s) {
  return s.split(' ');
};

api.dotSet = function(obj, path, val) {
  var arr;
  arr = path.split('.');
  return _.reduce(arr, (function(_this) {
    return function(curr, next, index) {
      if ((arr.length - 1) === index) {
        curr[next] = val;
      }
      return curr[next] != null ? curr[next] : curr[next] = {};
    };
  })(this), obj);
};

api.dotGet = function(obj, path) {
  return _.reduce(path.split('.'), ((function(_this) {
    return function(curr, next) {
      return curr != null ? curr[next] : void 0;
    };
  })(this)), obj);
};


/*
  Reflists are arrays, but stored as objects. Mongoose has a helluvatime working with arrays (the main problem for our
  syncing issues) - so the goal is to move away from arrays to objects, since mongoose can reference elements by ID
  no problem. To maintain sorting, we use these helper functions:
 */

api.refPush = function(reflist, item, prune) {
  if (prune == null) {
    prune = 0;
  }
  item.sort = _.isEmpty(reflist) ? 0 : _.max(reflist, 'sort').sort + 1;
  if (!(item.id && !reflist[item.id])) {
    item.id = api.uuid();
  }
  return reflist[item.id] = item;
};

api.planGemLimits = {
  convRate: 20,
  convCap: 25
};


/*
  ------------------------------------------------------
  Time / Day
  ------------------------------------------------------
 */


/*
  Each time we're performing date math (cron, task-due-days, etc), we need to take user preferences into consideration.
  Specifically {dayStart} (custom day start) and {timezoneOffset}. This function sanitizes / defaults those values.
  {now} is also passed in for various purposes, one example being the test scripts scripts testing different "now" times
 */

sanitizeOptions = function(o) {
  var dayStart, now, timezoneOffset, _ref;
  dayStart = !_.isNaN(+o.dayStart) && (0 <= (_ref = +o.dayStart) && _ref <= 24) ? +o.dayStart : 0;
  timezoneOffset = o.timezoneOffset ? +o.timezoneOffset : +moment().zone();
  now = o.now ? moment(o.now).zone(timezoneOffset) : moment(+(new Date)).zone(timezoneOffset);
  return {
    dayStart: dayStart,
    timezoneOffset: timezoneOffset,
    now: now
  };
};

api.startOfWeek = api.startOfWeek = function(options) {
  var o;
  if (options == null) {
    options = {};
  }
  o = sanitizeOptions(options);
  return moment(o.now).startOf('week');
};

api.startOfDay = function(options) {
  var dayStart, o;
  if (options == null) {
    options = {};
  }
  o = sanitizeOptions(options);
  dayStart = moment(o.now).startOf('day').add({
    hours: o.dayStart
  });
  if (moment(o.now).hour() < o.dayStart) {
    dayStart.subtract({
      days: 1
    });
  }
  return dayStart;
};

api.dayMapping = {
  0: 'su',
  1: 'm',
  2: 't',
  3: 'w',
  4: 'th',
  5: 'f',
  6: 's'
};


/*
  Absolute diff from "yesterday" till now
 */

api.daysSince = function(yesterday, options) {
  var o;
  if (options == null) {
    options = {};
  }
  o = sanitizeOptions(options);
  return Math.abs(api.startOfDay(_.defaults({
    now: yesterday
  }, o)).diff(api.startOfDay(_.defaults({
    now: o.now
  }, o)), 'days'));
};


/*
  Should the user do this taks on this date, given the task's repeat options and user.preferences.dayStart?
 */

api.shouldDo = function(day, repeat, options) {
  var o, selected;
  if (options == null) {
    options = {};
  }
  if (!repeat) {
    return false;
  }
  o = sanitizeOptions(options);
  selected = repeat[api.dayMapping[api.startOfDay(_.defaults({
    now: day
  }, o)).day()]];
  return selected;
};


/*
  ------------------------------------------------------
  Scoring
  ------------------------------------------------------
 */

api.tnl = function(lvl) {
  return Math.round(((Math.pow(lvl, 2) * 0.25) + (10 * lvl) + 139.75) / 10) * 10;
};


/*
  A hyperbola function that creates diminishing returns, so you can't go to infinite (eg, with Exp gain).
  {max} The asymptote
  {bonus} All the numbers combined for your point bonus (eg, task.value * user.stats.int * critChance, etc)
  {halfway} (optional) the point at which the graph starts bending
 */

api.diminishingReturns = function(bonus, max, halfway) {
  if (halfway == null) {
    halfway = max / 2;
  }
  return max * (bonus / (bonus + halfway));
};

api.monod = function(bonus, rateOfIncrease, max) {
  return rateOfIncrease * max * bonus / (rateOfIncrease * bonus + max);
};


/*
Preen history for users with > 7 history entries
This takes an infinite array of single day entries [day day day day day...], and turns it into a condensed array
of averages, condensing more the further back in time we go. Eg, 7 entries each for last 7 days; 1 entry each week
of this month; 1 entry for each month of this year; 1 entry per previous year: [day*7 week*4 month*12 year*infinite]
 */

preenHistory = function(history) {
  var newHistory, preen, thisMonth;
  history = _.filter(history, function(h) {
    return !!h;
  });
  newHistory = [];
  preen = function(amount, groupBy) {
    var groups;
    groups = _.chain(history).groupBy(function(h) {
      return moment(h.date).format(groupBy);
    }).sortBy(function(h, k) {
      return k;
    }).value();
    groups = groups.slice(-amount);
    groups.pop();
    return _.each(groups, function(group) {
      newHistory.push({
        date: moment(group[0].date).toDate(),
        value: _.reduce(group, (function(m, obj) {
          return m + obj.value;
        }), 0) / group.length
      });
      return true;
    });
  };
  preen(50, "YYYY");
  preen(moment().format('MM'), "YYYYMM");
  thisMonth = moment().format('YYYYMM');
  newHistory = newHistory.concat(_.filter(history, function(h) {
    return moment(h.date).format('YYYYMM') === thisMonth;
  }));
  return newHistory;
};


/*
  Update the in-browser store with new gear. FIXME this was in user.fns, but it was causing strange issues there
 */

sortOrder = _.reduce(content.gearTypes, (function(m, v, k) {
  m[v] = k;
  return m;
}), {});

api.updateStore = function(user) {
  var changes;
  if (!user) {
    return;
  }
  changes = [];
  _.each(content.gearTypes, function(type) {
    var found;
    found = _.find(content.gear.tree[type][user.stats["class"]], function(item) {
      return !user.items.gear.owned[item.key];
    });
    if (found) {
      changes.push(found);
    }
    return true;
  });
  changes = changes.concat(_.filter(content.gear.flat, function(v) {
    var _ref;
    return ((_ref = v.klass) === 'special' || _ref === 'mystery') && !user.items.gear.owned[v.key] && (typeof v.canOwn === "function" ? v.canOwn(user) : void 0);
  }));
  changes.push(content.potion);
  return _.sortBy(changes, function(c) {
    return sortOrder[c.type];
  });
};


/*
------------------------------------------------------
Content
------------------------------------------------------
 */

api.content = content;


/*
------------------------------------------------------
Misc Helpers
------------------------------------------------------
 */

api.uuid = function() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r, v;
    r = Math.random() * 16 | 0;
    v = (c === "x" ? r : r & 0x3 | 0x8);
    return v.toString(16);
  });
};

api.countExists = function(items) {
  return _.reduce(items, (function(m, v) {
    return m + (v ? 1 : 0);
  }), 0);
};


/*
Even though Mongoose handles task defaults, we want to make sure defaults are set on the client-side before
sending up to the server for performance
 */

api.taskDefaults = function(task) {
  var defaults, _ref, _ref1, _ref2;
  if (task == null) {
    task = {};
  }
  if (!(task.type && ((_ref = task.type) === 'habit' || _ref === 'daily' || _ref === 'todo' || _ref === 'reward'))) {
    task.type = 'habit';
  }
  defaults = {
    id: api.uuid(),
    text: task.id != null ? task.id : '',
    notes: '',
    priority: 1,
    challenge: {},
    attribute: 'str',
    dateCreated: new Date()
  };
  _.defaults(task, defaults);
  if (task.type === 'habit') {
    _.defaults(task, {
      up: true,
      down: true
    });
  }
  if ((_ref1 = task.type) === 'habit' || _ref1 === 'daily') {
    _.defaults(task, {
      history: []
    });
  }
  if ((_ref2 = task.type) === 'daily' || _ref2 === 'todo') {
    _.defaults(task, {
      completed: false
    });
  }
  if (task.type === 'daily') {
    _.defaults(task, {
      streak: 0,
      repeat: {
        su: 1,
        m: 1,
        t: 1,
        w: 1,
        th: 1,
        f: 1,
        s: 1
      }
    });
  }
  task._id = task.id;
  if (task.value == null) {
    task.value = task.type === 'reward' ? 10 : 0;
  }
  if (!_.isNumber(task.priority)) {
    task.priority = 1;
  }
  return task;
};

api.percent = function(x, y, dir) {
  var roundFn;
  switch (dir) {
    case "up":
      roundFn = Math.ceil;
      break;
    case "down":
      roundFn = Math.floor;
      break;
    default:
      roundFn = Math.round;
  }
  if (x === 0) {
    x = 1;
  }
  return Math.max(0, roundFn(x / y * 100));
};


/*
Remove whitespace #FIXME are we using this anywwhere? Should we be?
 */

api.removeWhitespace = function(str) {
  if (!str) {
    return '';
  }
  return str.replace(/\s/g, '');
};


/*
Encode the download link for .ics iCal file
 */

api.encodeiCalLink = function(uid, apiToken) {
  var loc, _ref;
  loc = (typeof window !== "undefined" && window !== null ? window.location.host : void 0) || (typeof process !== "undefined" && process !== null ? (_ref = process.env) != null ? _ref.BASE_URL : void 0 : void 0) || '';
  return encodeURIComponent("http://" + loc + "/v1/users/" + uid + "/calendar.ics?apiToken=" + apiToken);
};


/*
Gold amount from their money
 */

api.gold = function(num) {
  if (num) {
    return Math.floor(num);
  } else {
    return "0";
  }
};


/*
Silver amount from their money
 */

api.silver = function(num) {
  if (num) {
    return ("0" + Math.floor((num - Math.floor(num)) * 100)).slice(-2);
  } else {
    return "00";
  }
};


/*
Task classes given everything about the class
 */

api.taskClasses = function(task, filters, dayStart, lastCron, showCompleted, main) {
  var classes, completed, enabled, filter, priority, repeat, type, value, _ref;
  if (filters == null) {
    filters = [];
  }
  if (dayStart == null) {
    dayStart = 0;
  }
  if (lastCron == null) {
    lastCron = +(new Date);
  }
  if (showCompleted == null) {
    showCompleted = false;
  }
  if (main == null) {
    main = false;
  }
  if (!task) {
    return;
  }
  type = task.type, completed = task.completed, value = task.value, repeat = task.repeat, priority = task.priority;
  if (main) {
    if (!task._editing) {
      for (filter in filters) {
        enabled = filters[filter];
        if (enabled && !((_ref = task.tags) != null ? _ref[filter] : void 0)) {
          return 'hidden';
        }
      }
    }
  }
  classes = type;
  if (task._editing) {
    classes += " beingEdited";
  }
  if (type === 'todo' || type === 'daily') {
    if (completed || (type === 'daily' && !api.shouldDo(+(new Date), task.repeat, {
      dayStart: dayStart
    }))) {
      classes += " completed";
    } else {
      classes += " uncompleted";
    }
  } else if (type === 'habit') {
    if (task.down && task.up) {
      classes += ' habit-wide';
    }
    if (!task.down && !task.up) {
      classes += ' habit-narrow';
    }
  }
  if (priority === 1) {
    classes += ' difficulty-easy';
  } else if (priority === 1.5) {
    classes += ' difficulty-medium';
  } else if (priority === 2) {
    classes += ' difficulty-hard';
  }
  if (value < -20) {
    classes += ' color-worst';
  } else if (value < -10) {
    classes += ' color-worse';
  } else if (value < -1) {
    classes += ' color-bad';
  } else if (value < 1) {
    classes += ' color-neutral';
  } else if (value < 5) {
    classes += ' color-good';
  } else if (value < 10) {
    classes += ' color-better';
  } else {
    classes += ' color-best';
  }
  return classes;
};


/*
Friendly timestamp
 */

api.friendlyTimestamp = function(timestamp) {
  return moment(timestamp).format('MM/DD h:mm:ss a');
};


/*
Does user have new chat messages?
 */

api.newChatMessages = function(messages, lastMessageSeen) {
  if (!((messages != null ? messages.length : void 0) > 0)) {
    return false;
  }
  return (messages != null ? messages[0] : void 0) && (messages[0].id !== lastMessageSeen);
};


/*
are any tags active?
 */

api.noTags = function(tags) {
  return _.isEmpty(tags) || _.isEmpty(_.filter(tags, function(t) {
    return t;
  }));
};


/*
Are there tags applied?
 */

api.appliedTags = function(userTags, taskTags) {
  var arr;
  arr = [];
  _.each(userTags, function(t) {
    if (t == null) {
      return;
    }
    if (taskTags != null ? taskTags[t.id] : void 0) {
      return arr.push(t.name);
    }
  });
  return arr.join(', ');
};

api.countPets = function(originalCount, pets) {
  var count, pet;
  count = originalCount != null ? originalCount : _.size(pets);
  for (pet in content.questPets) {
    if (pets[pet]) {
      count--;
    }
  }
  for (pet in content.specialPets) {
    if (pets[pet]) {
      count--;
    }
  }
  return count;
};

api.countMounts = function(originalCount, mounts) {
  var count2, mount;
  count2 = originalCount != null ? originalCount : _.size(mounts);
  for (mount in content.questPets) {
    if (mounts[mount]) {
      count2--;
    }
  }
  for (mount in content.specialMounts) {
    if (mounts[mount]) {
      count2--;
    }
  }
  return count2;
};

api.countTriad = function(pets) {
  var count3, egg, potion;
  count3 = 0;
  for (egg in content.dropEggs) {
    for (potion in content.hatchingPotions) {
      if (pets[egg + "-" + potion] > 0) {
        count3++;
      }
    }
  }
  return count3;
};


/*
------------------------------------------------------
User (prototype wrapper to give it ops, helper funcs, and virtuals
------------------------------------------------------
 */


/*
User is now wrapped (both on client and server), adding a few new properties:
  * getters (_statsComputed, tasks, etc)
  * user.fns, which is a bunch of helper functions
    These were originally up above, but they make more sense belonging to the user object so we don't have to pass
    the user object all over the place. In fact, we should pull in more functions such as cron(), updateStats(), etc.
  * user.ops, which is super important:

If a function is inside user.ops, it has magical properties. If you call it on the client it updates the user object in
the browser and when it's done it automatically POSTs to the server, calling src/controllers/user.js#OP_NAME (the exact same name
of the op function). The first argument req is {query, body, params}, it's what the express controller function
expects. This means we call our functions as if we were calling an Express route. Eg, instead of score(task, direction),
we call score({params:{id:task.id,direction:direction}}). This also forces us to think about our routes (whether to use
params, query, or body for variables). see http://stackoverflow.com/questions/4024271/rest-api-best-practices-where-to-put-parameters

If `src/controllers/user.js#OP_NAME` doesn't exist on the server, it's automatically added. It runs the code in user.ops.OP_NAME
to update the user model server-side, then performs `user.save()`. You can see this in action for `user.ops.buy`. That
function doesn't exist on the server - so the client calls it, it updates user in the browser, auto-POSTs to server, server
handles it by calling `user.ops.buy` again (to update user on the server), and then saves. We can do this for
everything that doesn't need any code difference from what's in user.ops.OP_NAME for special-handling server-side. If we
*do* need special handling, just add `src/controllers/user.js#OP_NAME` to override the user.ops.OP_NAME, and be
sure to call user.ops.OP_NAME at some point within the overridden function.

TODO
  * Is this the best way to wrap the user object? I thought of using user.prototype, but user is an object not a Function.
    user on the server is a Mongoose model, so we can use prototype - but to do it on the client, we'd probably have to
    move to $resource for user
  * Move to $resource!
 */

api.wrap = function(user, main) {
  if (main == null) {
    main = true;
  }
  if (user._wrapped) {
    return;
  }
  user._wrapped = true;
  if (main) {
    user.ops = {
      update: function(req, cb) {
        _.each(req.body, function(v, k) {
          user.fns.dotSet(k, v);
          return true;
        });
        return typeof cb === "function" ? cb(null, user) : void 0;
      },
      sleep: function(req, cb) {
        user.preferences.sleep = !user.preferences.sleep;
        return typeof cb === "function" ? cb(null, {}) : void 0;
      },
      revive: function(req, cb) {
        var cl, gearOwned, item, losableItems, lostItem, lostStat, _base;
        if (!(user.stats.hp <= 0)) {
          return typeof cb === "function" ? cb({
            code: 400,
            message: "Cannot revive if not dead"
          }) : void 0;
        }
        _.merge(user.stats, {
          hp: 50,
          exp: 0,
          gp: 0
        });
        if (user.stats.lvl > 1) {
          user.stats.lvl--;
        }
        lostStat = user.fns.randomVal(_.reduce(['str', 'con', 'per', 'int'], (function(m, k) {
          if (user.stats[k]) {
            m[k] = k;
          }
          return m;
        }), {}));
        if (lostStat) {
          user.stats[lostStat]--;
        }
        cl = user.stats["class"];
        gearOwned = (typeof (_base = user.items.gear.owned).toObject === "function" ? _base.toObject() : void 0) || user.items.gear.owned;
        losableItems = {};
        _.each(gearOwned, function(v, k) {
          var itm;
          if (v) {
            itm = content.gear.flat['' + k];
            if (itm) {
              if ((itm.value > 0 || k === 'weapon_warrior_0') && (itm.klass === cl || (itm.klass === 'special' && (!itm.specialClass || itm.specialClass === cl)))) {
                return losableItems['' + k] = '' + k;
              }
            }
          }
        });
        lostItem = user.fns.randomVal(losableItems);
        if (item = content.gear.flat[lostItem]) {
          user.items.gear.owned[lostItem] = false;
          if (user.items.gear.equipped[item.type] === lostItem) {
            user.items.gear.equipped[item.type] = "" + item.type + "_base_0";
          }
          if (user.items.gear.costume[item.type] === lostItem) {
            user.items.gear.costume[item.type] = "" + item.type + "_base_0";
          }
        }
        if (typeof user.markModified === "function") {
          user.markModified('items.gear');
        }
        return typeof cb === "function" ? cb((item ? {
          code: 200,
          message: i18n.t('messageLostItem', {
            itemText: item.text(req.language)
          }, req.language)
        } : null), user) : void 0;
      },
      reset: function(req, cb) {
        var gear;
        user.habits = [];
        user.dailys = [];
        user.todos = [];
        user.rewards = [];
        user.stats.hp = 50;
        user.stats.lvl = 1;
        user.stats.gp = 0;
        user.stats.exp = 0;
        gear = user.items.gear;
        _.each(['equipped', 'costume'], function(type) {
          gear[type].armor = 'armor_base_0';
          gear[type].weapon = 'weapon_base_0';
          gear[type].head = 'head_base_0';
          return gear[type].shield = 'shield_base_0';
        });
        if (typeof gear.owned === 'undefined') {
          gear.owned = {};
        }
        _.each(gear.owned, function(v, k) {
          if (gear.owned[k]) {
            gear.owned[k] = false;
          }
          return true;
        });
        gear.owned.weapon_warrior_0 = true;
        if (typeof user.markModified === "function") {
          user.markModified('items.gear.owned');
        }
        user.preferences.costume = false;
        return typeof cb === "function" ? cb(null, user) : void 0;
      },
      reroll: function(req, cb, ga) {
        if (user.balance < 1) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('notEnoughGems', req.language)
          }) : void 0;
        }
        user.balance--;
        _.each(user.tasks, function(task) {
          if (task.type !== 'reward') {
            return task.value = 0;
          }
        });
        user.stats.hp = 50;
        if (typeof cb === "function") {
          cb(null, user);
        }
        return ga != null ? ga.event('purchase', 'reroll').send() : void 0;
      },
      rebirth: function(req, cb, ga) {
        var flags, gear, lvl, stats;
        if (user.balance < 2 && user.stats.lvl < 100) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('notEnoughGems', req.language)
          }) : void 0;
        }
        if (user.stats.lvl < 100) {
          user.balance -= 2;
        }
        if (user.stats.lvl < 100) {
          lvl = user.stats.lvl;
        } else {
          lvl = 100;
        }
        _.each(user.tasks, function(task) {
          if (task.type !== 'reward') {
            task.value = 0;
          }
          if (task.type === 'daily') {
            return task.streak = 0;
          }
        });
        stats = user.stats;
        stats.buffs = {};
        stats.hp = 50;
        stats.lvl = 1;
        stats["class"] = 'warrior';
        _.each(['per', 'int', 'con', 'str', 'points', 'gp', 'exp', 'mp'], function(value) {
          return stats[value] = 0;
        });
        gear = user.items.gear;
        _.each(['equipped', 'costume'], function(type) {
          gear[type] = {};
          gear[type].armor = 'armor_base_0';
          gear[type].weapon = 'weapon_warrior_0';
          gear[type].head = 'head_base_0';
          return gear[type].shield = 'shield_base_0';
        });
        if (user.items.currentPet) {
          user.ops.equip({
            params: {
              type: 'pet',
              key: user.items.currentPet
            }
          });
        }
        if (user.items.currentMount) {
          user.ops.equip({
            params: {
              type: 'mount',
              key: user.items.currentMount
            }
          });
        }
        _.each(gear.owned, function(v, k) {
          if (gear.owned[k]) {
            gear.owned[k] = false;
            return true;
          }
        });
        gear.owned.weapon_warrior_0 = true;
        if (typeof user.markModified === "function") {
          user.markModified('items.gear.owned');
        }
        user.preferences.costume = false;
        flags = user.flags;
        if (!(user.achievements.ultimateGear || user.achievements.beastMaster)) {
          flags.rebirthEnabled = false;
        }
        flags.itemsEnabled = false;
        flags.dropsEnabled = false;
        flags.classSelected = false;
        flags.levelDrops = {};
        if (!user.achievements.rebirths) {
          user.achievements.rebirths = 1;
          user.achievements.rebirthLevel = lvl;
        } else if (lvl > user.achievements.rebirthLevel || lvl === 100) {
          user.achievements.rebirths++;
          user.achievements.rebirthLevel = lvl;
        }
        user.stats.buffs = {};
        if (typeof cb === "function") {
          cb(null, user);
        }
        return ga != null ? ga.event('purchase', 'Rebirth').send() : void 0;
      },
      allocateNow: function(req, cb) {
        _.times(user.stats.points, user.fns.autoAllocate);
        user.stats.points = 0;
        if (typeof user.markModified === "function") {
          user.markModified('stats');
        }
        return typeof cb === "function" ? cb(null, user.stats) : void 0;
      },
      clearCompleted: function(req, cb) {
        _.remove(user.todos, function(t) {
          var _ref;
          return t.completed && !((_ref = t.challenge) != null ? _ref.id : void 0);
        });
        if (typeof user.markModified === "function") {
          user.markModified('todos');
        }
        return typeof cb === "function" ? cb(null, user.todos) : void 0;
      },
      sortTask: function(req, cb) {
        var from, id, movedTask, task, tasks, to, _ref;
        id = req.params.id;
        _ref = req.query, to = _ref.to, from = _ref.from;
        task = user.tasks[id];
        if (!task) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messageTaskNotFound', req.language)
          }) : void 0;
        }
        if (!((to != null) && (from != null))) {
          return typeof cb === "function" ? cb('?to=__&from=__ are required') : void 0;
        }
        tasks = user["" + task.type + "s"];
        movedTask = tasks.splice(from, 1)[0];
        if (to === -1) {
          tasks.push(movedTask);
        } else {
          tasks.splice(to, 0, movedTask);
        }
        return typeof cb === "function" ? cb(null, tasks) : void 0;
      },
      updateTask: function(req, cb) {
        var task, _ref;
        if (!(task = user.tasks[(_ref = req.params) != null ? _ref.id : void 0])) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messageTaskNotFound', req.language)
          }) : void 0;
        }
        _.merge(task, _.omit(req.body, ['checklist', 'id', 'type']));
        if (req.body.checklist) {
          task.checklist = req.body.checklist;
        }
        if (typeof task.markModified === "function") {
          task.markModified('tags');
        }
        return typeof cb === "function" ? cb(null, task) : void 0;
      },
      deleteTask: function(req, cb) {
        var i, task, _ref;
        task = user.tasks[(_ref = req.params) != null ? _ref.id : void 0];
        if (!task) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messageTaskNotFound', req.language)
          }) : void 0;
        }
        i = user[task.type + "s"].indexOf(task);
        if (~i) {
          user[task.type + "s"].splice(i, 1);
        }
        return typeof cb === "function" ? cb(null, {}) : void 0;
      },
      addTask: function(req, cb) {
        var task;
        task = api.taskDefaults(req.body);
        user["" + task.type + "s"].unshift(task);
        if (user.preferences.newTaskEdit) {
          task._editing = true;
        }
        if (user.preferences.tagsCollapsed) {
          task._tags = true;
        }
        if (user.preferences.advancedCollapsed) {
          task._advanced = true;
        }
        if (typeof cb === "function") {
          cb(null, task);
        }
        return task;
      },
      addTag: function(req, cb) {
        if (user.tags == null) {
          user.tags = [];
        }
        user.tags.push({
          name: req.body.name,
          id: req.body.id || api.uuid()
        });
        return typeof cb === "function" ? cb(null, user.tags) : void 0;
      },
      sortTag: function(req, cb) {
        var from, to, _ref;
        _ref = req.query, to = _ref.to, from = _ref.from;
        if (!((to != null) && (from != null))) {
          return typeof cb === "function" ? cb('?to=__&from=__ are required') : void 0;
        }
        user.tags.splice(to, 0, user.tags.splice(from, 1)[0]);
        return typeof cb === "function" ? cb(null, user.tags) : void 0;
      },
      updateTag: function(req, cb) {
        var i, tid;
        tid = req.params.id;
        i = _.findIndex(user.tags, {
          id: tid
        });
        if (!~i) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messageTagNotFound', req.language)
          }) : void 0;
        }
        user.tags[i].name = req.body.name;
        return typeof cb === "function" ? cb(null, user.tags[i]) : void 0;
      },
      deleteTag: function(req, cb) {
        var i, tag, tid;
        tid = req.params.id;
        i = _.findIndex(user.tags, {
          id: tid
        });
        if (!~i) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messageTagNotFound', req.language)
          }) : void 0;
        }
        tag = user.tags[i];
        delete user.filters[tag.id];
        user.tags.splice(i, 1);
        _.each(user.tasks, function(task) {
          return delete task.tags[tag.id];
        });
        _.each(['habits', 'dailys', 'todos', 'rewards'], function(type) {
          return typeof user.markModified === "function" ? user.markModified(type) : void 0;
        });
        return typeof cb === "function" ? cb(null, user.tags) : void 0;
      },
      addWebhook: function(req, cb) {
        var wh;
        wh = user.preferences.webhooks;
        api.refPush(wh, {
          url: req.body.url,
          enabled: req.body.enabled || true,
          id: req.body.id
        });
        if (typeof user.markModified === "function") {
          user.markModified('preferences.webhooks');
        }
        return typeof cb === "function" ? cb(null, user.preferences.webhooks) : void 0;
      },
      updateWebhook: function(req, cb) {
        _.merge(user.preferences.webhooks[req.params.id], req.body);
        if (typeof user.markModified === "function") {
          user.markModified('preferences.webhooks');
        }
        return typeof cb === "function" ? cb(null, user.preferences.webhooks) : void 0;
      },
      deleteWebhook: function(req, cb) {
        delete user.preferences.webhooks[req.params.id];
        if (typeof user.markModified === "function") {
          user.markModified('preferences.webhooks');
        }
        return typeof cb === "function" ? cb(null, user.preferences.webhooks) : void 0;
      },
      clearPMs: function(req, cb) {
        user.inbox.messages = {};
        if (typeof user.markModified === "function") {
          user.markModified('inbox.messages');
        }
        return typeof cb === "function" ? cb(null, user.inbox.messages) : void 0;
      },
      deletePM: function(req, cb) {
        delete user.inbox.messages[req.params.id];
        if (typeof user.markModified === "function") {
          user.markModified('inbox.messages.' + req.params.id);
        }
        return typeof cb === "function" ? cb(null, user.inbox.messages) : void 0;
      },
      blockUser: function(req, cb) {
        var i;
        i = user.inbox.blocks.indexOf(req.params.uuid);
        if (~i) {
          user.inbox.blocks.splice(i, 1);
        } else {
          user.inbox.blocks.push(req.params.uuid);
        }
        if (typeof user.markModified === "function") {
          user.markModified('inbox.blocks');
        }
        return typeof cb === "function" ? cb(null, user.inbox.blocks) : void 0;
      },
      feed: function(req, cb) {
        var egg, eggText, evolve, food, message, pet, petDisplayName, potion, potionText, userPets, _ref, _ref1, _ref2;
        _ref = req.params, pet = _ref.pet, food = _ref.food;
        food = content.food[food];
        _ref1 = pet.split('-'), egg = _ref1[0], potion = _ref1[1];
        userPets = user.items.pets;
        potionText = content.hatchingPotions[potion] ? content.hatchingPotions[potion].text() : potion;
        eggText = content.eggs[egg] ? content.eggs[egg].text() : egg;
        petDisplayName = i18n.t('petName', {
          potion: potionText,
          egg: eggText
        });
        if (!userPets[pet]) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messagePetNotFound', req.language)
          }) : void 0;
        }
        if (!((_ref2 = user.items.food) != null ? _ref2[food.key] : void 0)) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messageFoodNotFound', req.language)
          }) : void 0;
        }
        if (content.specialPets[pet] || (egg === "Egg")) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('messageCannotFeedPet', req.language)
          }) : void 0;
        }
        if (user.items.mounts[pet]) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('messageAlreadyMount', req.language)
          }) : void 0;
        }
        message = '';
        evolve = function() {
          userPets[pet] = -1;
          user.items.mounts[pet] = true;
          if (pet === user.items.currentPet) {
            user.items.currentPet = "";
          }
          return message = i18n.t('messageEvolve', {
            egg: petDisplayName
          }, req.language);
        };
        if (food.key === 'Saddle') {
          evolve();
        } else {
          if (food.target === potion) {
            userPets[pet] += 5;
            message = i18n.t('messageLikesFood', {
              egg: petDisplayName,
              foodText: food.text(req.language)
            }, req.language);
          } else {
            userPets[pet] += 2;
            message = i18n.t('messageDontEnjoyFood', {
              egg: petDisplayName,
              foodText: food.text(req.language)
            }, req.language);
          }
          if (userPets[pet] >= 50 && !user.items.mounts[pet]) {
            evolve();
          }
        }
        user.items.food[food.key]--;
        return typeof cb === "function" ? cb({
          code: 200,
          message: message
        }, userPets[pet]) : void 0;
      },
      buySpecialSpell: function(req, cb) {
        var item, key, message, _base;
        key = req.params.key;
        item = content.special[key];
        if (user.stats.gp < item.value) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('messageNotEnoughGold', req.language)
          }) : void 0;
        }
        user.stats.gp -= item.value;
        if ((_base = user.items.special)[key] == null) {
          _base[key] = 0;
        }
        user.items.special[key]++;
        if (typeof user.markModified === "function") {
          user.markModified('items.special');
        }
        message = i18n.t('messageBought', {
          itemText: item.text(req.language)
        }, req.language);
        return typeof cb === "function" ? cb({
          code: 200,
          message: message
        }, _.pick(user, $w('items stats'))) : void 0;
      },
      purchase: function(req, cb, ga) {
        var convCap, convRate, item, key, price, type, _ref, _ref1, _ref2, _ref3;
        _ref = req.params, type = _ref.type, key = _ref.key;
        if (type === 'gems' && key === 'gem') {
          _ref1 = api.planGemLimits, convRate = _ref1.convRate, convCap = _ref1.convCap;
          convCap += user.purchased.plan.consecutive.gemCapExtra;
          if (!((_ref2 = user.purchased) != null ? (_ref3 = _ref2.plan) != null ? _ref3.customerId : void 0 : void 0)) {
            return typeof cb === "function" ? cb({
              code: 401,
              message: "Must subscribe to purchase gems with GP"
            }, req) : void 0;
          }
          if (!(user.stats.gp >= convRate)) {
            return typeof cb === "function" ? cb({
              code: 401,
              message: "Not enough Gold"
            }) : void 0;
          }
          if (user.purchased.plan.gemsBought >= convCap) {
            return typeof cb === "function" ? cb({
              code: 401,
              message: "You've reached the Gold=>Gem conversion cap (" + convCap + ") for this month. We have this to prevent abuse / farming. The cap will reset within the first three days of next month."
            }) : void 0;
          }
          user.balance += .25;
          user.purchased.plan.gemsBought++;
          user.stats.gp -= convRate;
          return typeof cb === "function" ? cb({
            code: 200,
            message: "+1 Gems"
          }, _.pick(user, $w('stats balance'))) : void 0;
        }
        if (type !== 'eggs' && type !== 'hatchingPotions' && type !== 'food' && type !== 'quests' && type !== 'gear') {
          return typeof cb === "function" ? cb({
            code: 404,
            message: ":type must be in [eggs,hatchingPotions,food,quests,gear]"
          }, req) : void 0;
        }
        if (type === 'gear') {
          item = content.gear.flat[key];
          if (user.items.gear.owned[key]) {
            return typeof cb === "function" ? cb({
              code: 401,
              message: i18n.t('alreadyHave', req.language)
            }) : void 0;
          }
          price = (item.twoHanded ? 2 : 1) / 4;
        } else {
          item = content[type][key];
          price = item.value / 4;
        }
        if (!item) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: ":key not found for Content." + type
          }, req) : void 0;
        }
        if (user.balance < price) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('notEnoughGems', req.language)
          }) : void 0;
        }
        user.balance -= price;
        if (type === 'gear') {
          user.items.gear.owned[key] = true;
        } else {
          if (!(user.items[type][key] > 0)) {
            user.items[type][key] = 0;
          }
          user.items[type][key]++;
        }
        if (typeof cb === "function") {
          cb(null, _.pick(user, $w('items balance')));
        }
        return ga != null ? ga.event('purchase', key).send() : void 0;
      },
      releasePets: function(req, cb) {
        var pet;
        if (user.balance < 1) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('notEnoughGems', req.language)
          }) : void 0;
        } else {
          user.balance--;
          for (pet in content.pets) {
            user.items.pets[pet] = 0;
          }
          if (!user.achievements.beastMasterCount) {
            user.achievements.beastMasterCount = 0;
          }
          user.achievements.beastMasterCount++;
          user.items.currentPet = "";
        }
        return typeof cb === "function" ? cb(null, user) : void 0;
      },
      releaseMounts: function(req, cb) {
        var mount;
        if (user.balance < 1) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('notEnoughGems', req.language)
          }) : void 0;
        } else {
          user.balance -= 1;
          user.items.currentMount = "";
          for (mount in content.pets) {
            user.items.mounts[mount] = null;
          }
          if (!user.achievements.mountMasterCount) {
            user.achievements.mountMasterCount = 0;
          }
          user.achievements.mountMasterCount++;
        }
        return typeof cb === "function" ? cb(null, user) : void 0;
      },
      releaseBoth: function(req, cb) {
        var animal, giveTriadBingo;
        if (user.balance < 1.5) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('notEnoughGems', req.language)
          }) : void 0;
        } else {
          giveTriadBingo = true;
          user.balance -= 1.5;
          user.items.currentMount = "";
          user.items.currentPet = "";
          for (animal in content.pets) {
            if (user.items.pets[animal] === -1) {
              giveTriadBingo = false;
            }
            user.items.pets[animal] = 0;
            user.items.mounts[animal] = null;
          }
          if (!user.achievements.beastMasterCount) {
            user.achievements.beastMasterCount = 0;
          }
          user.achievements.beastMasterCount++;
          if (!user.achievements.mountMasterCount) {
            user.achievements.mountMasterCount = 0;
          }
          user.achievements.mountMasterCount++;
          if (giveTriadBingo) {
            if (!user.achievements.triadBingoCount) {
              user.achievements.triadBingoCount = 0;
            }
            user.achievements.triadBingoCount++;
          }
        }
        return typeof cb === "function" ? cb(null, user) : void 0;
      },
      buy: function(req, cb) {
        var item, key, message;
        key = req.params.key;
        item = key === 'potion' ? content.potion : content.gear.flat[key];
        if (!item) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: "Item '" + key + " not found (see https://github.com/HabitRPG/habitrpg-shared/blob/develop/script/content.coffee)"
          }) : void 0;
        }
        if (user.stats.gp < item.value) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('messageNotEnoughGold', req.language)
          }) : void 0;
        }
        if ((item.canOwn != null) && !item.canOwn(user)) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: "You can't own this item"
          }) : void 0;
        }
        if (item.key === 'potion') {
          user.stats.hp += 15;
          if (user.stats.hp > 50) {
            user.stats.hp = 50;
          }
        } else {
          user.items.gear.equipped[item.type] = item.key;
          user.items.gear.owned[item.key] = true;
          message = user.fns.handleTwoHanded(item, null, req);
          if (message == null) {
            message = i18n.t('messageBought', {
              itemText: item.text(req.language)
            }, req.language);
          }
          if (!user.achievements.ultimateGear && item.last) {
            user.fns.ultimateGear();
          }
        }
        user.stats.gp -= item.value;
        return typeof cb === "function" ? cb({
          code: 200,
          message: message
        }, _.pick(user, $w('items achievements stats'))) : void 0;
      },
      buyMysterySet: function(req, cb) {
        var mysterySet, _ref;
        if (!(user.purchased.plan.consecutive.trinkets > 0)) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: "You don't have enough Mystic Hourglasses"
          }) : void 0;
        }
        mysterySet = (_ref = content.timeTravelerStore(user.items.gear.owned)) != null ? _ref[req.params.key] : void 0;
        if ((typeof window !== "undefined" && window !== null ? window.confirm : void 0) != null) {
          if (!window.confirm("Buy this full set of items for 1 Mystic Hourglass?")) {
            return;
          }
        }
        if (!mysterySet) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: "Mystery set not found, or set already owned"
          }) : void 0;
        }
        _.each(mysterySet.items, function(i) {
          return user.items.gear.owned[i.key] = true;
        });
        user.purchased.plan.consecutive.trinkets--;
        return typeof cb === "function" ? cb(null, _.pick(user, $w('items purchased.plan.consecutive'))) : void 0;
      },
      sell: function(req, cb) {
        var key, type, _ref;
        _ref = req.params, key = _ref.key, type = _ref.type;
        if (type !== 'eggs' && type !== 'hatchingPotions' && type !== 'food') {
          return typeof cb === "function" ? cb({
            code: 404,
            message: ":type not found. Must bes in [eggs, hatchingPotions, food]"
          }) : void 0;
        }
        if (!user.items[type][key]) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: ":key not found for user.items." + type
          }) : void 0;
        }
        user.items[type][key]--;
        user.stats.gp += content[type][key].value;
        return typeof cb === "function" ? cb(null, _.pick(user, $w('stats items'))) : void 0;
      },
      equip: function(req, cb) {
        var item, key, message, type, _ref;
        _ref = [req.params.type || 'equipped', req.params.key], type = _ref[0], key = _ref[1];
        switch (type) {
          case 'mount':
            if (!user.items.mounts[key]) {
              return typeof cb === "function" ? cb({
                code: 404,
                message: ":You do not own this mount."
              }) : void 0;
            }
            user.items.currentMount = user.items.currentMount === key ? '' : key;
            break;
          case 'pet':
            if (!user.items.pets[key]) {
              return typeof cb === "function" ? cb({
                code: 404,
                message: ":You do not own this pet."
              }) : void 0;
            }
            user.items.currentPet = user.items.currentPet === key ? '' : key;
            break;
          case 'costume':
          case 'equipped':
            item = content.gear.flat[key];
            if (!user.items.gear.owned[key]) {
              return typeof cb === "function" ? cb({
                code: 404,
                message: ":You do not own this gear."
              }) : void 0;
            }
            if (user.items.gear[type][item.type] === key) {
              user.items.gear[type][item.type] = "" + item.type + "_base_0";
              message = i18n.t('messageUnEquipped', {
                itemText: item.text(req.language)
              }, req.language);
            } else {
              user.items.gear[type][item.type] = item.key;
              message = user.fns.handleTwoHanded(item, type, req);
            }
            if (typeof user.markModified === "function") {
              user.markModified("items.gear." + type);
            }
        }
        return typeof cb === "function" ? cb((message ? {
          code: 200,
          message: message
        } : null), user.items) : void 0;
      },
      hatch: function(req, cb) {
        var egg, hatchingPotion, pet, _ref;
        _ref = req.params, egg = _ref.egg, hatchingPotion = _ref.hatchingPotion;
        if (!(egg && hatchingPotion)) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: "Please specify query.egg & query.hatchingPotion"
          }) : void 0;
        }
        if (!(user.items.eggs[egg] > 0 && user.items.hatchingPotions[hatchingPotion] > 0)) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('messageMissingEggPotion', req.language)
          }) : void 0;
        }
        pet = "" + egg + "-" + hatchingPotion;
        if (user.items.pets[pet] && user.items.pets[pet] > 0) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('messageAlreadyPet', req.language)
          }) : void 0;
        }
        user.items.pets[pet] = 5;
        user.items.eggs[egg]--;
        user.items.hatchingPotions[hatchingPotion]--;
        return typeof cb === "function" ? cb({
          code: 200,
          message: i18n.t('messageHatched', req.language)
        }, user.items) : void 0;
      },
      unlock: function(req, cb, ga) {
        var alreadyOwns, cost, fullSet, k, path, split, v;
        path = req.query.path;
        fullSet = ~path.indexOf(",");
        cost = ~path.indexOf('background.') ? fullSet ? 3.75 : 1.75 : fullSet ? 1.25 : 0.5;
        alreadyOwns = !fullSet && user.fns.dotGet("purchased." + path) === true;
        if (user.balance < cost && !alreadyOwns) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('notEnoughGems', req.language)
          }) : void 0;
        }
        if (fullSet) {
          _.each(path.split(","), function(p) {
            user.fns.dotSet("purchased." + p, true);
            return true;
          });
        } else {
          if (alreadyOwns) {
            split = path.split('.');
            v = split.pop();
            k = split.join('.');
            if (k === 'background' && v === user.preferences.background) {
              v = '';
            }
            user.fns.dotSet("preferences." + k, v);
            return typeof cb === "function" ? cb(null, req) : void 0;
          }
          user.fns.dotSet("purchased." + path, true);
        }
        user.balance -= cost;
        if (typeof user.markModified === "function") {
          user.markModified('purchased');
        }
        if (typeof cb === "function") {
          cb(null, _.pick(user, $w('purchased preferences')));
        }
        return ga != null ? ga.event('purchase', path).send() : void 0;
      },
      changeClass: function(req, cb, ga) {
        var klass, _ref;
        klass = (_ref = req.query) != null ? _ref["class"] : void 0;
        if (klass === 'warrior' || klass === 'rogue' || klass === 'wizard' || klass === 'healer') {
          user.stats["class"] = klass;
          user.flags.classSelected = true;
          _.each(["weapon", "armor", "shield", "head"], function(type) {
            var foundKey;
            foundKey = false;
            _.findLast(user.items.gear.owned, function(v, k) {
              if (~k.indexOf(type + "_" + klass) && v === true) {
                return foundKey = k;
              }
            });
            user.items.gear.equipped[type] = foundKey ? foundKey : type === "weapon" ? "weapon_" + klass + "_0" : type === "shield" && klass === "rogue" ? "shield_rogue_0" : "" + type + "_base_0";
            if (type === "weapon" || (type === "shield" && klass === "rogue")) {
              user.items.gear.owned["" + type + "_" + klass + "_0"] = true;
            }
            return true;
          });
        } else {
          if (user.preferences.disableClasses) {
            user.preferences.disableClasses = false;
            user.preferences.autoAllocate = false;
          } else {
            if (!(user.balance >= .75)) {
              return typeof cb === "function" ? cb({
                code: 401,
                message: i18n.t('notEnoughGems', req.language)
              }) : void 0;
            }
            user.balance -= .75;
          }
          _.merge(user.stats, {
            str: 0,
            con: 0,
            per: 0,
            int: 0,
            points: user.stats.lvl
          });
          user.flags.classSelected = false;
          if (ga != null) {
            ga.event('purchase', 'changeClass').send();
          }
        }
        return typeof cb === "function" ? cb(null, _.pick(user, $w('stats flags items preferences'))) : void 0;
      },
      disableClasses: function(req, cb) {
        user.stats["class"] = 'warrior';
        user.flags.classSelected = true;
        user.preferences.disableClasses = true;
        user.preferences.autoAllocate = true;
        user.stats.str = user.stats.lvl;
        user.stats.points = 0;
        return typeof cb === "function" ? cb(null, _.pick(user, $w('stats flags preferences'))) : void 0;
      },
      allocate: function(req, cb) {
        var stat;
        stat = req.query.stat || 'str';
        if (user.stats.points > 0) {
          user.stats[stat]++;
          user.stats.points--;
          if (stat === 'int') {
            user.stats.mp++;
          }
        }
        return typeof cb === "function" ? cb(null, _.pick(user, $w('stats'))) : void 0;
      },
      readValentine: function(req, cb) {
        user.items.special.valentineReceived.shift();
        if (typeof user.markModified === "function") {
          user.markModified('items.special.valentineReceived');
        }
        return typeof cb === "function" ? cb(null, 'items.special') : void 0;
      },
      openMysteryItem: function(req, cb, ga) {
        var item, _ref, _ref1;
        item = (_ref = user.purchased.plan) != null ? (_ref1 = _ref.mysteryItems) != null ? _ref1.shift() : void 0 : void 0;
        if (!item) {
          return typeof cb === "function" ? cb({
            code: 400,
            message: "Empty"
          }) : void 0;
        }
        item = content.gear.flat[item];
        user.items.gear.owned[item.key] = true;
        if (typeof user.markModified === "function") {
          user.markModified('purchased.plan.mysteryItems');
        }
        if (typeof window !== 'undefined') {
          (user._tmp != null ? user._tmp : user._tmp = {}).drop = {
            type: 'gear',
            dialog: "" + (item.text(req.language)) + " inside!"
          };
        }
        return typeof cb === "function" ? cb(null, user.items.gear.owned) : void 0;
      },
      readNYE: function(req, cb) {
        user.items.special.nyeReceived.shift();
        if (typeof user.markModified === "function") {
          user.markModified('items.special.nyeReceived');
        }
        return typeof cb === "function" ? cb(null, 'items.special') : void 0;
      },
      score: function(req, cb) {
        var addPoints, calculateDelta, calculateReverseDelta, changeTaskValue, delta, direction, id, mpDelta, multiplier, num, options, stats, subtractPoints, task, th, _ref;
        _ref = req.params, id = _ref.id, direction = _ref.direction;
        task = user.tasks[id];
        options = req.query || {};
        _.defaults(options, {
          times: 1,
          cron: false
        });
        user._tmp = {};
        stats = {
          gp: +user.stats.gp,
          hp: +user.stats.hp,
          exp: +user.stats.exp
        };
        task.value = +task.value;
        task.streak = ~~task.streak;
        if (task.priority == null) {
          task.priority = 1;
        }
        if (task.value > stats.gp && task.type === 'reward') {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('messageNotEnoughGold', req.language)
          }) : void 0;
        }
        delta = 0;
        calculateDelta = function() {
          var currVal, nextDelta, _ref1;
          currVal = task.value < -47.27 ? -47.27 : task.value > 21.27 ? 21.27 : task.value;
          nextDelta = Math.pow(0.9747, currVal) * (direction === 'down' ? -1 : 1);
          if (((_ref1 = task.checklist) != null ? _ref1.length : void 0) > 0) {
            if (direction === 'down' && task.type === 'daily' && options.cron) {
              nextDelta *= 1 - _.reduce(task.checklist, (function(m, i) {
                return m + (i.completed ? 1 : 0);
              }), 0) / task.checklist.length;
            }
            if (task.type === 'todo') {
              nextDelta *= 1 + _.reduce(task.checklist, (function(m, i) {
                return m + (i.completed ? 1 : 0);
              }), 0);
            }
          }
          return nextDelta;
        };
        calculateReverseDelta = function() {
          var calc, closeEnough, currVal, diff, nextDelta, testVal, _ref1;
          currVal = task.value < -47.27 ? -47.27 : task.value > 21.27 ? 21.27 : task.value;
          testVal = currVal + Math.pow(0.9747, currVal) * (direction === 'down' ? -1 : 1);
          closeEnough = 0.00001;
          while (true) {
            calc = testVal + Math.pow(0.9747, testVal);
            diff = currVal - calc;
            if (Math.abs(diff) < closeEnough) {
              break;
            }
            if (diff > 0) {
              testVal -= diff;
            } else {
              testVal += diff;
            }
          }
          nextDelta = testVal - currVal;
          if (((_ref1 = task.checklist) != null ? _ref1.length : void 0) > 0) {
            if (task.type === 'todo') {
              nextDelta *= 1 + _.reduce(task.checklist, (function(m, i) {
                return m + (i.completed ? 1 : 0);
              }), 0);
            }
          }
          return nextDelta;
        };
        changeTaskValue = function() {
          return _.times(options.times, function() {
            var nextDelta, _ref1;
            nextDelta = !options.cron && direction === 'down' ? calculateReverseDelta() : calculateDelta();
            if (task.type !== 'reward') {
              if (user.preferences.automaticAllocation === true && user.preferences.allocationMode === 'taskbased' && !(task.type === 'todo' && direction === 'down')) {
                user.stats.training[task.attribute] += nextDelta;
              }
              if (direction === 'up' && !(task.type === 'habit' && !task.down)) {
                user.party.quest.progress.up = user.party.quest.progress.up || 0;
                if ((_ref1 = task.type) === 'daily' || _ref1 === 'todo') {
                  user.party.quest.progress.up += nextDelta * (1 + (user._statsComputed.str / 200));
                }
              }
              task.value += nextDelta;
            }
            return delta += nextDelta;
          });
        };
        addPoints = function() {
          var afterStreak, currStreak, gpMod, intBonus, perBonus, streakBonus, _crit;
          _crit = (delta > 0 ? user.fns.crit() : 1);
          if (_crit > 1) {
            user._tmp.crit = _crit;
          }
          intBonus = 1 + (user._statsComputed.int * .025);
          stats.exp += Math.round(delta * intBonus * task.priority * _crit * 6);
          perBonus = 1 + user._statsComputed.per * .02;
          gpMod = delta * task.priority * _crit * perBonus;
          return stats.gp += task.streak ? (currStreak = direction === 'down' ? task.streak - 1 : task.streak, streakBonus = currStreak / 100 + 1, afterStreak = gpMod * streakBonus, currStreak > 0 ? gpMod > 0 ? user._tmp.streakBonus = afterStreak - gpMod : void 0 : void 0, afterStreak) : gpMod;
        };
        subtractPoints = function() {
          var conBonus, hpMod;
          conBonus = 1 - (user._statsComputed.con / 250);
          if (conBonus < .1) {
            conBonus = 0.1;
          }
          hpMod = delta * conBonus * task.priority * 2;
          return stats.hp += Math.round(hpMod * 10) / 10;
        };
        switch (task.type) {
          case 'habit':
            changeTaskValue();
            if (delta > 0) {
              addPoints();
            } else {
              subtractPoints();
            }
            th = (task.history != null ? task.history : task.history = []);
            if (th[th.length - 1] && moment(th[th.length - 1].date).isSame(new Date, 'day')) {
              th[th.length - 1].value = task.value;
            } else {
              th.push({
                date: +(new Date),
                value: task.value
              });
            }
            if (typeof user.markModified === "function") {
              user.markModified("habits." + (_.findIndex(user.habits, {
                id: task.id
              })) + ".history");
            }
            break;
          case 'daily':
            if (options.cron) {
              changeTaskValue();
              subtractPoints();
              if (!user.stats.buffs.streaks) {
                task.streak = 0;
              }
            } else {
              changeTaskValue();
              if (direction === 'down') {
                delta = calculateDelta();
              }
              addPoints();
              if (direction === 'up') {
                task.streak = task.streak ? task.streak + 1 : 1;
                if ((task.streak % 21) === 0) {
                  user.achievements.streak = user.achievements.streak ? user.achievements.streak + 1 : 1;
                }
              } else {
                if ((task.streak % 21) === 0) {
                  user.achievements.streak = user.achievements.streak ? user.achievements.streak - 1 : 0;
                }
                task.streak = task.streak ? task.streak - 1 : 0;
              }
            }
            break;
          case 'todo':
            if (options.cron) {
              changeTaskValue();
            } else {
              task.dateCompleted = direction === 'up' ? new Date : void 0;
              changeTaskValue();
              if (direction === 'down') {
                delta = calculateDelta();
              }
              addPoints();
              multiplier = _.max([
                _.reduce(task.checklist, (function(m, i) {
                  return m + (i.completed ? 1 : 0);
                }), 1), 1
              ]);
              mpDelta = _.max([multiplier, .01 * user._statsComputed.maxMP * multiplier]);
              mpDelta *= user._tmp.crit || 1;
              if (direction === 'down') {
                mpDelta *= -1;
              }
              user.stats.mp += mpDelta;
              if (user.stats.mp >= user._statsComputed.maxMP) {
                user.stats.mp = user._statsComputed.maxMP;
              }
              if (user.stats.mp < 0) {
                user.stats.mp = 0;
              }
            }
            break;
          case 'reward':
            changeTaskValue();
            stats.gp -= Math.abs(task.value);
            num = parseFloat(task.value).toFixed(2);
            if (stats.gp < 0) {
              stats.hp += stats.gp;
              stats.gp = 0;
            }
        }
        user.fns.updateStats(stats, req);
        if (typeof window === 'undefined') {
          if (direction === 'up') {
            user.fns.randomDrop({
              task: task,
              delta: delta
            }, req);
          }
        }
        if (typeof cb === "function") {
          cb(null, user);
        }
        return delta;
      }
    };
  }
  user.fns = {
    getItem: function(type) {
      var item;
      item = content.gear.flat[user.items.gear.equipped[type]];
      if (!item) {
        return content.gear.flat["" + type + "_base_0"];
      }
      return item;
    },
    handleTwoHanded: function(item, type, req) {
      var message, weapon, _ref;
      if (type == null) {
        type = 'equipped';
      }
      if (item.type === "shield" && ((_ref = (weapon = content.gear.flat[user.items.gear[type].weapon])) != null ? _ref.twoHanded : void 0)) {
        user.items.gear[type].weapon = 'weapon_base_0';
        message = i18n.t('messageTwoHandled', {
          gearText: weapon.text(req.language)
        }, req.language);
      }
      if (item.twoHanded) {
        user.items.gear[type].shield = "shield_base_0";
        message = i18n.t('messageTwoHandled', {
          gearText: item.text(req.language)
        }, req.language);
      }
      return message;
    },

    /*
    Because the same op needs to be performed on the client and the server (critical hits, item drops, etc),
    we need things to be "random", but technically predictable so that they don't go out-of-sync
     */
    predictableRandom: function(seed) {
      var x;
      if (!seed || seed === Math.PI) {
        seed = _.reduce(user.stats, (function(m, v) {
          if (_.isNumber(v)) {
            return m + v;
          } else {
            return m;
          }
        }), 0);
      }
      x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    },
    crit: function(stat, chance) {
      if (stat == null) {
        stat = 'str';
      }
      if (chance == null) {
        chance = .03;
      }
      if (user.fns.predictableRandom() <= chance * (1 + user._statsComputed[stat] / 100)) {
        return 1.5 + (.02 * user._statsComputed[stat]);
      } else {
        return 1;
      }
    },

    /*
      Get a random property from an object
      returns random property (the value)
     */
    randomVal: function(obj, options) {
      var array, rand;
      array = (options != null ? options.key : void 0) ? _.keys(obj) : _.values(obj);
      rand = user.fns.predictableRandom(options != null ? options.seed : void 0);
      array.sort();
      return array[Math.floor(rand * array.length)];
    },

    /*
    This allows you to set object properties by dot-path. Eg, you can run pathSet('stats.hp',50,user) which is the same as
    user.stats.hp = 50. This is useful because in our habitrpg-shared functions we're returning changesets as {path:value},
    so that different consumers can implement setters their own way. Derby needs model.set(path, value) for example, where
    Angular sets object properties directly - in which case, this function will be used.
     */
    dotSet: function(path, val) {
      return api.dotSet(user, path, val);
    },
    dotGet: function(path) {
      return api.dotGet(user, path);
    },
    randomDrop: function(modifiers, req) {
      var acceptableDrops, chance, drop, dropK, dropMultiplier, quest, rarity, task, _base, _base1, _base2, _name, _name1, _name2, _ref, _ref1, _ref2, _ref3;
      task = modifiers.task;
      chance = _.min([Math.abs(task.value - 21.27), 37.5]) / 150 + .02;
      chance *= task.priority * (1 + (task.streak / 100 || 0)) * (1 + (user._statsComputed.per / 100)) * (1 + (user.contributor.level / 40 || 0)) * (1 + (user.achievements.rebirths / 20 || 0)) * (1 + (user.achievements.streak / 200 || 0)) * (user._tmp.crit || 1) * (1 + .5 * (_.reduce(task.checklist, (function(m, i) {
        return m + (i.completed ? 1 : 0);
      }), 0) || 0));
      chance = api.diminishingReturns(chance, 0.75);
      quest = content.quests[(_ref = user.party.quest) != null ? _ref.key : void 0];
      if ((quest != null ? quest.collect : void 0) && user.fns.predictableRandom(user.stats.gp) < chance) {
        dropK = user.fns.randomVal(quest.collect, {
          key: true
        });
        user.party.quest.progress.collect[dropK]++;
        if (typeof user.markModified === "function") {
          user.markModified('party.quest.progress');
        }
      }
      dropMultiplier = ((_ref1 = user.purchased) != null ? (_ref2 = _ref1.plan) != null ? _ref2.customerId : void 0 : void 0) ? 2 : 1;
      if ((api.daysSince(user.items.lastDrop.date, user.preferences) === 0) && (user.items.lastDrop.count >= dropMultiplier * (5 + Math.floor(user._statsComputed.per / 25) + (user.contributor.level || 0)))) {
        return;
      }
      if (((_ref3 = user.flags) != null ? _ref3.dropsEnabled : void 0) && user.fns.predictableRandom(user.stats.exp) < chance) {
        rarity = user.fns.predictableRandom(user.stats.gp);
        if (rarity > .6) {
          drop = user.fns.randomVal(_.where(content.food, {
            canDrop: true
          }));
          if ((_base = user.items.food)[_name = drop.key] == null) {
            _base[_name] = 0;
          }
          user.items.food[drop.key] += 1;
          drop.type = 'Food';
          drop.dialog = i18n.t('messageDropFood', {
            dropArticle: drop.article,
            dropText: drop.text(req.language),
            dropNotes: drop.notes(req.language)
          }, req.language);
        } else if (rarity > .3) {
          drop = user.fns.randomVal(_.where(content.eggs, {
            canBuy: true
          }));
          if ((_base1 = user.items.eggs)[_name1 = drop.key] == null) {
            _base1[_name1] = 0;
          }
          user.items.eggs[drop.key]++;
          drop.type = 'Egg';
          drop.dialog = i18n.t('messageDropEgg', {
            dropText: drop.text(req.language),
            dropNotes: drop.notes(req.language)
          }, req.language);
        } else {
          acceptableDrops = rarity < .02 ? ['Golden'] : rarity < .09 ? ['Zombie', 'CottonCandyPink', 'CottonCandyBlue'] : rarity < .18 ? ['Red', 'Shade', 'Skeleton'] : ['Base', 'White', 'Desert'];
          drop = user.fns.randomVal(_.pick(content.hatchingPotions, (function(v, k) {
            return __indexOf.call(acceptableDrops, k) >= 0;
          })));
          if ((_base2 = user.items.hatchingPotions)[_name2 = drop.key] == null) {
            _base2[_name2] = 0;
          }
          user.items.hatchingPotions[drop.key]++;
          drop.type = 'HatchingPotion';
          drop.dialog = i18n.t('messageDropPotion', {
            dropText: drop.text(req.language),
            dropNotes: drop.notes(req.language)
          }, req.language);
        }
        user._tmp.drop = drop;
        user.items.lastDrop.date = +(new Date);
        return user.items.lastDrop.count++;
      }
    },

    /*
      Updates user stats with new stats. Handles death, leveling up, etc
      {stats} new stats
      {update} if aggregated changes, pass in userObj as update. otherwise commits will be made immediately
     */
    autoAllocate: function() {
      return user.stats[(function() {
        var diff, ideal, preference, stats, suggested;
        switch (user.preferences.allocationMode) {
          case "flat":
            stats = _.pick(user.stats, $w('con str per int'));
            return _.invert(stats)[_.min(stats)];
          case "classbased":
            ideal = [user.stats.lvl / 7 * 3, user.stats.lvl / 7 * 2, user.stats.lvl / 7, user.stats.lvl / 7];
            preference = (function() {
              switch (user.stats["class"]) {
                case "wizard":
                  return ["int", "per", "con", "str"];
                case "rogue":
                  return ["per", "str", "int", "con"];
                case "healer":
                  return ["con", "int", "str", "per"];
                default:
                  return ["str", "con", "per", "int"];
              }
            })();
            diff = [user.stats[preference[0]] - ideal[0], user.stats[preference[1]] - ideal[1], user.stats[preference[2]] - ideal[2], user.stats[preference[3]] - ideal[3]];
            suggested = _.findIndex(diff, (function(val) {
              if (val === _.min(diff)) {
                return true;
              }
            }));
            if (~suggested) {
              return preference[suggested];
            } else {
              return "str";
            }
          case "taskbased":
            suggested = _.invert(user.stats.training)[_.max(user.stats.training)];
            _.merge(user.stats.training, {
              str: 0,
              int: 0,
              con: 0,
              per: 0
            });
            return suggested || "str";
          default:
            return "str";
        }
      })()]++;
    },
    updateStats: function(stats, req) {
      var tnl;
      if (stats.hp <= 0) {
        return user.stats.hp = 0;
      }
      user.stats.hp = stats.hp;
      user.stats.gp = stats.gp >= 0 ? stats.gp : 0;
      tnl = api.tnl(user.stats.lvl);
      if (stats.exp >= tnl) {
        user.stats.exp = stats.exp;
        while (stats.exp >= tnl) {
          stats.exp -= tnl;
          user.stats.lvl++;
          tnl = api.tnl(user.stats.lvl);
          if (user.preferences.automaticAllocation) {
            user.fns.autoAllocate();
          } else {
            user.stats.points = user.stats.lvl - (user.stats.con + user.stats.str + user.stats.per + user.stats.int);
          }
          user.stats.hp = 50;
        }
      }
      user.stats.exp = stats.exp;
      if (user.flags == null) {
        user.flags = {};
      }
      if (!user.flags.customizationsNotification && (user.stats.exp > 5 || user.stats.lvl > 1)) {
        user.flags.customizationsNotification = true;
      }
      if (!user.flags.itemsEnabled && (user.stats.exp > 10 || user.stats.lvl > 1)) {
        user.flags.itemsEnabled = true;
      }
      if (!user.flags.partyEnabled && user.stats.lvl >= 3) {
        user.flags.partyEnabled = true;
      }
      if (!user.flags.dropsEnabled && user.stats.lvl >= 4) {
        user.flags.dropsEnabled = true;
        if (user.items.eggs["Wolf"] > 0) {
          user.items.eggs["Wolf"]++;
        } else {
          user.items.eggs["Wolf"] = 1;
        }
      }
      if (!user.flags.classSelected && user.stats.lvl >= 10) {
        user.flags.classSelected;
      }
      _.each({
        vice1: 30,
        atom1: 15,
        moonstone1: 60,
        goldenknight1: 40
      }, function(lvl, k) {
        var _base, _base1, _ref;
        if (!((_ref = user.flags.levelDrops) != null ? _ref[k] : void 0) && user.stats.lvl >= lvl) {
          if ((_base = user.items.quests)[k] == null) {
            _base[k] = 0;
          }
          user.items.quests[k]++;
          ((_base1 = user.flags).levelDrops != null ? _base1.levelDrops : _base1.levelDrops = {})[k] = true;
          if (typeof user.markModified === "function") {
            user.markModified('flags.levelDrops');
          }
          return user._tmp.drop = _.defaults(content.quests[k], {
            type: 'Quest',
            dialog: i18n.t('messageFoundQuest', {
              questText: content.quests[k].text(req.language)
            }, req.language)
          });
        }
      });
      if (!user.flags.rebirthEnabled && (user.stats.lvl >= 50 || user.achievements.ultimateGear || user.achievements.beastMaster)) {
        user.flags.rebirthEnabled = true;
      }
      if (user.stats.lvl >= 100 && !user.flags.freeRebirth) {
        return user.flags.freeRebirth = true;
      }
    },

    /*
      ------------------------------------------------------
      Cron
      ------------------------------------------------------
     */

    /*
      At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
      For incomplete Dailys, deduct experience
      Make sure to run this function once in a while as server will not take care of overnight calculations.
      And you have to run it every time client connects.
      {user}
     */
    cron: function(options) {
      var clearBuffs, daysMissed, expTally, lvl, lvlDiv2, now, perfect, plan, progress, todoTally, _base, _base1, _base2, _base3, _progress, _ref, _ref1, _ref2;
      if (options == null) {
        options = {};
      }
      now = +options.now || +(new Date);
      daysMissed = api.daysSince(user.lastCron, _.defaults({
        now: now
      }, user.preferences));
      if (!(daysMissed > 0)) {
        return;
      }
      user.auth.timestamps.loggedin = new Date();
      user.lastCron = now;
      if (user.items.lastDrop.count > 0) {
        user.items.lastDrop.count = 0;
      }
      perfect = true;
      clearBuffs = {
        str: 0,
        int: 0,
        per: 0,
        con: 0,
        stealth: 0,
        streaks: false
      };
      plan = (_ref = user.purchased) != null ? _ref.plan : void 0;
      if (plan != null ? plan.customerId : void 0) {
        if (moment(plan.dateUpdated).format('MMYYYY') !== moment().format('MMYYYY')) {
          plan.gemsBought = 0;
          plan.dateUpdated = new Date();
          _.defaults(plan.consecutive, {
            count: 0,
            offset: 0,
            trinkets: 0,
            gemCapExtra: 0
          });
          plan.consecutive.count++;
          if (plan.consecutive.offset > 0) {
            plan.consecutive.offset--;
          } else if (plan.consecutive.count % 3 === 0) {
            plan.consecutive.trinkets++;
            plan.consecutive.gemCapExtra += 5;
            if (plan.consecutive.gemCapExtra > 25) {
              plan.consecutive.gemCapExtra = 25;
            }
          }
        }
        if (plan.dateTerminated && moment(plan.dateTerminated).isBefore(+(new Date))) {
          _.merge(plan, {
            planId: null,
            customerId: null,
            paymentMethod: null
          });
          _.merge(plan.consecutive, {
            count: 0,
            offset: 0,
            gemCapExtra: 0
          });
          if (typeof user.markModified === "function") {
            user.markModified('purchased.plan');
          }
        }
      }
      if (user.preferences.sleep === true) {
        user.stats.buffs = clearBuffs;
        return;
      }
      todoTally = 0;
      if ((_base = user.party.quest.progress).down == null) {
        _base.down = 0;
      }
      user.todos.concat(user.dailys).forEach(function(task) {
        var absVal, completed, delta, id, repeat, scheduleMisses, type;
        if (!task) {
          return;
        }
        id = task.id, type = task.type, completed = task.completed, repeat = task.repeat;
        if ((type === 'daily') && !completed && user.stats.buffs.stealth && user.stats.buffs.stealth--) {
          return;
        }
        if (!completed) {
          scheduleMisses = daysMissed;
          if ((type === 'daily') && repeat) {
            scheduleMisses = 0;
            _.times(daysMissed, function(n) {
              var thatDay;
              thatDay = moment(now).subtract({
                days: n + 1
              });
              if (api.shouldDo(thatDay, repeat, user.preferences)) {
                return scheduleMisses++;
              }
            });
          }
          if (scheduleMisses > 0) {
            if (type === 'daily') {
              perfect = false;
            }
            delta = user.ops.score({
              params: {
                id: task.id,
                direction: 'down'
              },
              query: {
                times: scheduleMisses,
                cron: true
              }
            });
            if (type === 'daily') {
              user.party.quest.progress.down += delta;
            }
          }
        }
        switch (type) {
          case 'daily':
            (task.history != null ? task.history : task.history = []).push({
              date: +(new Date),
              value: task.value
            });
            task.completed = false;
            return _.each(task.checklist, (function(i) {
              i.completed = false;
              return true;
            }));
          case 'todo':
            absVal = completed ? Math.abs(task.value) : task.value;
            return todoTally += absVal;
        }
      });
      user.habits.forEach(function(task) {
        if (task.up === false || task.down === false) {
          if (Math.abs(task.value) < 0.1) {
            return task.value = 0;
          } else {
            return task.value = task.value / 2;
          }
        }
      });
      ((_base1 = (user.history != null ? user.history : user.history = {})).todos != null ? _base1.todos : _base1.todos = []).push({
        date: now,
        value: todoTally
      });
      expTally = user.stats.exp;
      lvl = 0;
      while (lvl < (user.stats.lvl - 1)) {
        lvl++;
        expTally += api.tnl(lvl);
      }
      ((_base2 = user.history).exp != null ? _base2.exp : _base2.exp = []).push({
        date: now,
        value: expTally
      });
      if (!((_ref1 = user.purchased) != null ? (_ref2 = _ref1.plan) != null ? _ref2.customerId : void 0 : void 0)) {
        user.fns.preenUserHistory();
        if (typeof user.markModified === "function") {
          user.markModified('history');
        }
        if (typeof user.markModified === "function") {
          user.markModified('dailys');
        }
      }
      user.stats.buffs = perfect ? ((_base3 = user.achievements).perfect != null ? _base3.perfect : _base3.perfect = 0, user.achievements.perfect++, user.stats.lvl < 100 ? lvlDiv2 = Math.ceil(user.stats.lvl / 2) : lvlDiv2 = 50, {
        str: lvlDiv2,
        int: lvlDiv2,
        per: lvlDiv2,
        con: lvlDiv2,
        stealth: 0,
        streaks: false
      }) : clearBuffs;
      user.stats.mp += _.max([10, .1 * user._statsComputed.maxMP]);
      if (user.stats.mp > user._statsComputed.maxMP) {
        user.stats.mp = user._statsComputed.maxMP;
      }
      progress = user.party.quest.progress;
      _progress = _.cloneDeep(progress);
      _.merge(progress, {
        down: 0,
        up: 0
      });
      progress.collect = _.transform(progress.collect, (function(m, v, k) {
        return m[k] = 0;
      }));
      return _progress;
    },
    preenUserHistory: function(minHistLen) {
      if (minHistLen == null) {
        minHistLen = 7;
      }
      _.each(user.habits.concat(user.dailys), function(task) {
        var _ref;
        if (((_ref = task.history) != null ? _ref.length : void 0) > minHistLen) {
          task.history = preenHistory(task.history);
        }
        return true;
      });
      _.defaults(user.history, {
        todos: [],
        exp: []
      });
      if (user.history.exp.length > minHistLen) {
        user.history.exp = preenHistory(user.history.exp);
      }
      if (user.history.todos.length > minHistLen) {
        return user.history.todos = preenHistory(user.history.todos);
      }
    },
    ultimateGear: function() {
      var gear, lastGearClassTypeMatrix, ownedLastGear, shouldGrant;
      gear = typeof window !== "undefined" && window !== null ? user.items.gear.owned : user.items.gear.owned.toObject();
      ownedLastGear = _.chain(content.gear.flat).pick(_.keys(gear)).values().filter(function(gear) {
        return gear.last;
      });
      lastGearClassTypeMatrix = {};
      _.each(content.classes, function(klass) {
        lastGearClassTypeMatrix[klass] = {};
        return _.each(['armor', 'weapon', 'shield', 'head'], function(type) {
          lastGearClassTypeMatrix[klass][type] = false;
          return true;
        });
      });
      ownedLastGear.each(function(gear) {
        if (gear.twoHanded) {
          lastGearClassTypeMatrix[gear.klass]["shield"] = true;
        }
        return lastGearClassTypeMatrix[gear.klass][gear.type] = true;
      });
      shouldGrant = _(lastGearClassTypeMatrix).values().reduce((function(ans, klass) {
        return ans || _(klass).values().reduce((function(ans, gearType) {
          return ans && gearType;
        }), true);
      }), false).valueOf();
      return user.achievements.ultimateGear = shouldGrant;
    },
    nullify: function() {
      user.ops = null;
      user.fns = null;
      return user = null;
    }
  };
  Object.defineProperty(user, '_statsComputed', {
    get: function() {
      var computed;
      computed = _.reduce(['per', 'con', 'str', 'int'], (function(_this) {
        return function(m, stat) {
          m[stat] = _.reduce($w('stats stats.buffs items.gear.equipped.weapon items.gear.equipped.armor items.gear.equipped.head items.gear.equipped.shield'), function(m2, path) {
            var item, val;
            val = user.fns.dotGet(path);
            return m2 + (~path.indexOf('items.gear') ? (item = content.gear.flat[val], (+(item != null ? item[stat] : void 0) || 0) * ((item != null ? item.klass : void 0) === user.stats["class"] || (item != null ? item.specialClass : void 0) === user.stats["class"] ? 1.5 : 1)) : +val[stat] || 0);
          }, 0);
          if (user.stats.lvl < 100) {
            m[stat] += (user.stats.lvl - 1) / 2;
          } else {
            m[stat] += 50;
          }
          return m;
        };
      })(this), {});
      computed.maxMP = computed.int * 2 + 30;
      return computed;
    }
  });
  return Object.defineProperty(user, 'tasks', {
    get: function() {
      var tasks;
      tasks = user.habits.concat(user.dailys).concat(user.todos).concat(user.rewards);
      return _.object(_.pluck(tasks, "id"), tasks);
    }
  });
};


}).call(this,require('_process'))
},{"./content.coffee":2,"./i18n.coffee":3,"_process":5,"lodash":6,"moment":7}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],6:[function(require,module,exports){
(function (global){
/**
 * @license
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modern -o ./dist/lodash.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detect and test whitespace */
  var whitespace = (
    // whitespace
    ' \t\x0B\f\xA0\ufeff' +

    // line terminators
    '\n\r\u2028\u2029' +

    // unicode category "Zs" space separators
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading whitespace and zeros to be removed */
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object',
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
    'parseInt', 'setTimeout'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used as an internal `_.debounce` options object */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default callback when a given
   * collection is a string value.
   *
   * @private
   * @param {string} value The character to inspect.
   * @returns {number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ac = a.criteria,
        bc = b.criteria,
        index = -1,
        length = ac.length;

    while (++index < length) {
      var value = ac[index],
          other = bc[index];

      if (value !== other) {
        if (value > other || typeof value == 'undefined') {
          return 1;
        }
        if (value < other || typeof other == 'undefined') {
          return -1;
        }
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to return the same value for
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
    //
    // This also ensures a stable sort in V8 and other engines.
    // See http://code.google.com/p/v8/issues/detail?id=90
    return a.index - b.index;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'criteria': null,
      'false': false,
      'index': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false,
      'value': null
    };
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given context object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /**
     * Used for `Array` method references.
     *
     * Normally `Array.prototype` would suffice, however, using an array literal
     * avoids issues in Narwhal.
     */
    var arrayRef = [];

    /** Used for native method references */
    var objectProto = Object.prototype;

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to resolve the internal [[Class]] of values */
    var toString = objectProto.toString;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        fnToString = Function.prototype.toString,
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectProto.hasOwnProperty,
        push = arrayRef.push,
        setTimeout = context.setTimeout,
        splice = arrayRef.splice,
        unshift = arrayRef.unshift;

    /** Used to set meta data on functions */
    var defineProperty = (function() {
      // IE 8 only accepts DOM elements
      try {
        var o = {},
            func = isNative(func = Object.defineProperty) && func,
            result = func(o, o, o) && func;
      } catch(e) { }
      return result;
    }());

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps the given value to enable intuitive
     * method chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
     * and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
     * `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * provided, otherwise they return unwrapped values.
     *
     * Explicit chaining can be enabled by using the `_.chain` method.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap in a `lodash` instance.
     * @param {boolean} chainAll A flag to enable chaining for all methods
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value, chainAll) {
      this.__chain__ = !!chainAll;
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    /**
     * Detect if functions can be decompiled by `Function#toString`
     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

    /**
     * Detect if `Function#name` is supported (all but IE).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcNames = typeof Function.name == 'string';

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The base implementation of `_.bind` that creates the bound function and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new bound function.
     */
    function baseBind(bindData) {
      var func = bindData[0],
          partialArgs = bindData[2],
          thisArg = bindData[4];

      function bound() {
        // `Function#bind` spec
        // http://es5.github.io/#x15.3.4.5
        if (partialArgs) {
          // avoid `arguments` object deoptimizations by using `slice` instead
          // of `Array.prototype.slice.call` and not assigning `arguments` to a
          // variable as a ternary expression
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        // mimic the constructor's `return` behavior
        // http://es5.github.io/#x13.2.2
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          var thisBinding = baseCreate(func.prototype),
              result = func.apply(thisBinding, args || arguments);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.clone` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, callback, stackA, stackB) {
      if (callback) {
        var result = callback(value);
        if (typeof result != 'undefined') {
          return result;
        }
      }
      // inspect [[Class]]
      var isObj = isObject(value);
      if (isObj) {
        var className = toString.call(value);
        if (!cloneableClasses[className]) {
          return value;
        }
        var ctor = ctorByClass[className];
        switch (className) {
          case boolClass:
          case dateClass:
            return new ctor(+value);

          case numberClass:
          case stringClass:
            return new ctor(value);

          case regexpClass:
            result = ctor(value.source, reFlags.exec(value));
            result.lastIndex = value.lastIndex;
            return result;
        }
      } else {
        return value;
      }
      var isArr = isArray(value);
      if (isDeep) {
        // check for circular references and return corresponding clone
        var initedStack = !stackA;
        stackA || (stackA = getArray());
        stackB || (stackB = getArray());

        var length = stackA.length;
        while (length--) {
          if (stackA[length] == value) {
            return stackB[length];
          }
        }
        result = isArr ? ctor(value.length) : {};
      }
      else {
        result = isArr ? slice(value) : assign({}, value);
      }
      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // exit for shallow clone
      if (!isDeep) {
        return result;
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? forEach : forOwn)(value, function(objValue, key) {
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
      });

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(prototype, properties) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    // fallback for browsers without `Object.create`
    if (!nativeCreate) {
      baseCreate = (function() {
        function Object() {}
        return function(prototype) {
          if (isObject(prototype)) {
            Object.prototype = prototype;
            var result = new Object;
            Object.prototype = null;
          }
          return result || context.Object();
        };
      }());
    }

    /**
     * The base implementation of `_.createCallback` without support for creating
     * "_.pluck" or "_.where" style callbacks.
     *
     * @private
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     */
    function baseCreateCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      // exit early for no `thisArg` or already bound by `Function#bind`
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
      }
      var bindData = func.__bindData__;
      if (typeof bindData == 'undefined') {
        if (support.funcNames) {
          bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
          var source = fnToString.call(func);
          if (!support.funcNames) {
            bindData = !reFuncName.test(source);
          }
          if (!bindData) {
            // checks if `func` references the `this` keyword and stores the result
            bindData = reThis.test(source);
            setBindData(func, bindData);
          }
        }
      }
      // exit early if there are no `this` references or `func` is bound
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 2: return function(a, b) {
          return func.call(thisArg, a, b);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return bind(func, thisArg);
    }

    /**
     * The base implementation of `createWrapper` that creates the wrapper and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new function.
     */
    function baseCreateWrapper(bindData) {
      var func = bindData[0],
          bitmask = bindData[1],
          partialArgs = bindData[2],
          partialRightArgs = bindData[3],
          thisArg = bindData[4],
          arity = bindData[5];

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          key = func;

      function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
          args || (args = slice(arguments));
          if (partialRightArgs) {
            push.apply(args, partialRightArgs);
          }
          if (isCurry && args.length < arity) {
            bitmask |= 16 & ~32;
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
          }
        }
        args || (args = arguments);
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (this instanceof bound) {
          thisBinding = baseCreate(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.difference` that accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {Array} [values] The array of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     */
    function baseDifference(array, values) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
          result = [];

      if (isLarge) {
        var cache = createCache(values);
        if (cache) {
          indexOf = cacheIndexOf;
          values = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(values, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(values);
      }
      return result;
    }

    /**
     * The base implementation of `_.flatten` without support for callback
     * shorthands or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
     * @param {number} [fromIndex=0] The index to start from.
     * @returns {Array} Returns a new flattened array.
     */
    function baseFlatten(array, isShallow, isStrict, fromIndex) {
      var index = (fromIndex || 0) - 1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value && typeof value == 'object' && typeof value.length == 'number'
            && (isArray(value) || isArguments(value))) {
          // recursively flatten arrays (susceptible to call stack limits)
          if (!isShallow) {
            value = baseFlatten(value, isShallow, isStrict);
          }
          var valIndex = -1,
              valLength = value.length,
              resIndex = result.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[resIndex++] = value[valIndex];
          }
        } else if (!isStrict) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
     * that allows partial "_.where" style comparisons.
     *
     * @private
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          !(a && objectTypes[type]) &&
          !(b && objectTypes[otherType])) {
        return false;
      }
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
      // http://es5.github.io/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
            bWrapped = hasOwnProperty.call(b, '__wrapped__');

        if (aWrapped || bWrapped) {
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = a.constructor,
            ctorB = b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB &&
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
              ('constructor' in a && 'constructor' in b)
            ) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        // compare lengths to determine if a deep comparison is necessary
        length = a.length;
        size = b.length;
        result = size == length;

        if (result || isWhere) {
          // deep compare the contents, ignoring non-numeric properties
          while (size--) {
            var index = length,
                value = b[size];

            if (isWhere) {
              while (index--) {
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                  break;
                }
              }
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        }
      }
      else {
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
        // which, in this case, is more costly
        forIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            // count the number of properties.
            size++;
            // deep compare each property value.
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
          }
        });

        if (result && !isWhere) {
          // ensure both objects have the same number of properties
          forIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              // `size` will be `-1` if `a` has more properties than `b`
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     */
    function baseMerge(object, source, callback, stackA, stackB) {
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
        var found,
            isArr,
            result = source,
            value = object[key];

        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            if ((found = stackA[stackLength] == source)) {
              value = stackB[stackLength];
              break;
            }
          }
          if (!found) {
            var isShallow;
            if (callback) {
              result = callback(value, source);
              if ((isShallow = typeof result != 'undefined')) {
                value = result;
              }
            }
            if (!isShallow) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});
            }
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value);

            // recursively merge objects and arrays (susceptible to call stack limits)
            if (!isShallow) {
              baseMerge(value, source, callback, stackA, stackB);
            }
          }
        }
        else {
          if (callback) {
            result = callback(value, source);
            if (typeof result == 'undefined') {
              result = source;
            }
          }
          if (typeof result != 'undefined') {
            value = result;
          }
        }
        object[key] = value;
      });
    }

    /**
     * The base implementation of `_.random` without argument juggling or support
     * for returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns a random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function} [callback] The function called per iteration.
     * @returns {Array} Returns a duplicate-value-free array.
     */
    function baseUniq(array, isSorted, callback) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [];

      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
          seen = (callback || isLarge) ? getArray() : result;

      if (isLarge) {
        var cache = createCache(seen);
        indexOf = cacheIndexOf;
        seen = cache;
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      if (isLarge) {
        releaseArray(seen.array);
        releaseObject(seen);
      } else if (callback) {
        releaseArray(seen);
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an object composed
     * of keys generated from the results of running each element of the collection
     * through a callback. The given `setter` function sets the keys and values
     * of the composed object.
     *
     * @private
     * @param {Function} setter The setter function.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter) {
      return function(collection, callback, thisArg) {
        var result = {};
        callback = lodash.createCallback(callback, thisArg, 3);

        var index = -1,
            length = collection ? collection.length : 0;

        if (typeof length == 'number') {
          while (++index < length) {
            var value = collection[index];
            setter(result, value, callback(value, index, collection), collection);
          }
        } else {
          forOwn(collection, function(value, key, collection) {
            setter(result, value, callback(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that, when called, either curries or invokes `func`
     * with an optional `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of method flags to compose.
     *  The bitmask may be composed of the following flags:
     *  1 - `_.bind`
     *  2 - `_.bindKey`
     *  4 - `_.curry`
     *  8 - `_.curry` (bound)
     *  16 - `_.partial`
     *  32 - `_.partialRight`
     * @param {Array} [partialArgs] An array of arguments to prepend to those
     *  provided to the new function.
     * @param {Array} [partialRightArgs] An array of arguments to append to those
     *  provided to the new function.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new function.
     */
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError;
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        // clone `bindData`
        bindData = slice(bindData);
        if (bindData[2]) {
          bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
          bindData[3] = slice(bindData[3]);
        }
        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
      }
      // fast path for `_.bind`
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} match The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized, this method returns the custom method, otherwise it returns
     * the `baseIndexOf` function.
     *
     * @private
     * @returns {Function} Returns the "indexOf" function.
     */
    function getIndexOf() {
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
      return result;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
     */
    function isNative(value) {
      return typeof value == 'function' && reNative.test(value);
    }

    /**
     * Sets `this` binding data on a given function.
     *
     * @private
     * @param {Function} func The function to set data on.
     * @param {Array} value The data array to set.
     */
    var setBindData = !defineProperty ? noop : function(func, value) {
      descriptor.value = value;
      defineProperty(func, '__bindData__', descriptor);
    };

    /**
     * A fallback implementation of `isPlainObject` which checks if a given value
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var ctor,
          result;

      // avoid non Object objects, `arguments` objects, and DOM elements
      if (!(value && toString.call(value) == objectClass) ||
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor))) {
        return false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} match The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == argsClass || false;
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == arrayClass || false;
    };

    /**
     * A fallback implementation of `Object.keys` which produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     */
    var shimKeys = function(object) {
      var index, iterable = object, result = [];
      if (!iterable) return result;
      if (!(objectTypes[typeof object])) return result;
        for (index in iterable) {
          if (hasOwnProperty.call(iterable, index)) {
            result.push(index);
          }
        }
      return result
    };

    /**
     * Creates an array composed of the own enumerable property names of an object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      return nativeKeys(object);
    };

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /** Used to match HTML entities and HTML characters */
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a callback is provided it will be executed to produce the
     * assigned values. The callback is bound to `thisArg` and invoked with two
     * arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
     * // => { 'name': 'fred', 'employer': 'slate' }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var object = { 'name': 'barney' };
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var assign = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
        var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
      } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
        callback = args[--argsLength];
      }
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
        }
        }
      }
      return result
    };

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a callback
     * is provided it will be executed to produce the cloned values. If the
     * callback returns `undefined` cloning will be handled by the method instead.
     * The callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var shallow = _.clone(characters);
     * shallow[0] === characters[0];
     * // => true
     *
     * var deep = _.clone(characters, true);
     * deep[0] === characters[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, callback, thisArg) {
      // allows working with "Collections" methods without using their `index`
      // and `collection` arguments for `isDeep` and `callback`
      if (typeof isDeep != 'boolean' && isDeep != null) {
        thisArg = callback;
        callback = isDeep;
        isDeep = false;
      }
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates a deep clone of `value`. If a callback is provided it will be
     * executed to produce the cloned values. If the callback returns `undefined`
     * cloning will be handled by the method instead. The callback is bound to
     * `thisArg` and invoked with one argument; (value).
     *
     * Note: This method is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var deep = _.cloneDeep(characters);
     * deep[0] === characters[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? assign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var object = { 'name': 'barney' };
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var defaults = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (typeof result[index] == 'undefined') result[index] = iterable[index];
        }
        }
      }
      return result
    };

    /**
     * This method is like `_.findIndex` except that it returns the key of the
     * first element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
     *
     * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (property order is not guaranteed across environments)
     *
     * // using "_.where" callback shorthand
     * _.findKey(characters, { 'age': 1 });
     * // => 'pebbles'
     *
     * // using "_.pluck" callback shorthand
     * _.findKey(characters, 'blocked');
     * // => 'fred'
     */
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
     *
     * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
     *
     * // using "_.where" callback shorthand
     * _.findLastKey(characters, { 'age': 40 });
     * // => 'fred'
     *
     * // using "_.pluck" callback shorthand
     * _.findLastKey(characters, 'blocked');
     * // => 'pebbles'
     */
    function findLastKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwnRight(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over own and inherited enumerable properties of an object,
     * executing the callback for each property. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
     */
    var forIn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        for (index in iterable) {
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forIn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
     */
    function forInRight(object, callback, thisArg) {
      var pairs = [];

      forIn(object, function(value, key) {
        pairs.push(key, value);
      });

      var length = pairs.length;
      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(pairs[length--], pairs[length], object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Iterates over own enumerable properties of an object, executing the callback
     * for each property. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
     */
    var forOwn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forOwn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
     */
    function forOwnRight(object, callback, thisArg) {
      var props = keys(object),
          length = props.length;

      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        var key = props[length];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Creates a sorted array of property names of all enumerable properties,
     * own and inherited, of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified property name exists as a direct property of `object`,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to check.
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, key) {
      return object ? hasOwnProperty.call(object, key) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     * _.invert({ 'first': 'fred', 'second': 'barney' });
     * // => { 'fred': 'first', 'barney': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        value && typeof value == 'object' && toString.call(value) == boolClass || false;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value && value.nodeType === 1 || false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass || className == argsClass ) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If a callback is provided it will be executed
     * to compare values. If the callback returns `undefined` comparisons will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var copy = { 'name': 'fred' };
     *
     * object == copy;
     * // => false
     *
     * _.isEqual(object, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg) {
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite` which will return true for
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.io/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return !!(value && objectTypes[typeof value]);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN` which will return `true` for
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        value && typeof value == 'object' && toString.call(value) == numberClass || false;
    }

    /**
     * Checks if `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * _.isPlainObject(new Shape);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && toString.call(value) == objectClass)) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/fred/);
     * // => true
     */
    function isRegExp(value) {
      return value && typeof value == 'object' && toString.call(value) == regexpClass || false;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('fred');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' ||
        value && typeof value == 'object' && toString.call(value) == stringClass || false;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     *
     * var characters = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // using "_.pluck" callback shorthand
     * _.mapValues(characters, 'age');
     * // => { 'fred': 40, 'pebbles': 1 }
     */
    function mapValues(object, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg, 3);

      forOwn(object, function(value, key, object) {
        result[key] = callback(value, key, object);
      });
      return result;
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a callback is
     * provided it will be executed to produce the merged values of the destination
     * and source properties. If the callback returns `undefined` merging will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object) {
      var args = arguments,
          length = 2;

      if (!isObject(object)) {
        return object;
      }
      // allows working with `_.reduce` and `_.reduceRight` without using
      // their `index` and `collection` arguments
      if (typeof args[2] != 'number') {
        length = args.length;
      }
      if (length > 3 && typeof args[length - 2] == 'function') {
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
      } else if (length > 2 && typeof args[length - 1] == 'function') {
        callback = args[--length];
      }
      var sources = slice(arguments, 1, length),
          index = -1,
          stackA = getArray(),
          stackB = getArray();

      while (++index < length) {
        baseMerge(object, sources[index], callback, stackA, stackB);
      }
      releaseArray(stackA);
      releaseArray(stackB);
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` omitting the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The properties to omit or the
     *  function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
     * // => { 'name': 'fred' }
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'fred' }
     */
    function omit(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var props = [];
        forIn(object, function(value, key) {
          props.push(key);
        });
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          result[key] = object[key];
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (!callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates a two dimensional array of an object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` picking the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The function called per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
     * // => { 'name': 'fred' }
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'fred' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1,
            props = baseFlatten(arguments, true, false, 1),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * An alternative to `_.reduce` this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable properties through a callback, with each callback execution
     * potentially mutating the `accumulator` object. The callback is bound to
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
     * Callbacks may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
     * // => [1, 9, 25]
     *
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor,
              proto = ctor && ctor.prototype;

          accumulator = baseCreate(proto);
        }
      }
      if (callback) {
        callback = lodash.createCallback(callback, thisArg, 4);
        (isArr ? forEach : forOwn)(object, function(value, index, object) {
          return callback(accumulator, value, index, object);
        });
      }
      return accumulator;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (property order is not guaranteed across environments)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
     *   to retrieve, specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
     * // => ['fred', 'pebbles']
     */
    function at(collection) {
      var args = arguments,
          index = -1,
          props = baseFlatten(args, true, false, 1),
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
          result = Array(length);

      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given value is present in a collection using strict equality
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
     * offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {*} target The value to check for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.contains('pebbles', 'eb');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          indexOf = getIndexOf(),
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
      } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        forOwn(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through the callback. The corresponding value
     * of each key is the number of times the key was returned by the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });

    /**
     * Checks if the given callback returns truey value for **all** elements of
     * a collection. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if all elements passed the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes']);
     * // => false
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(characters, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(characters, { 'age': 36 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning an array of all elements
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(characters, 'blocked');
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     *
     * // using "_.where" callback shorthand
     * _.filter(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning the first element that
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect, findWhere
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
     *
     * // using "_.where" callback shorthand
     * _.find(characters, { 'age': 1 });
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
     *
     * // using "_.pluck" callback shorthand
     * _.find(characters, 'blocked');
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * This method is like `_.find` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
     * // => 3
     */
    function findLast(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forEachRight(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result = value;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over elements of a collection, executing the callback for each
     * element. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * Note: As with other "Collections" methods, objects with a `length` property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
     * // => logs each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
     * // => logs each number and returns the object (property order is not guaranteed across environments)
     */
    function forEach(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        forOwn(collection, callback);
      }
      return collection;
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
     * // => logs each number from right to left and returns '3,2,1'
     */
    function forEachRight(collection, callback, thisArg) {
      var length = collection ? collection.length : 0;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (length--) {
          if (callback(collection[length], length, collection) === false) {
            break;
          }
        }
      } else {
        var props = keys(collection);
        length = props.length;
        forOwn(collection, function(value, key, collection) {
          key = props ? props[--length] : --length;
          return callback(collection[key], key, collection);
        });
      }
      return collection;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of a collection through the callback. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of the collection through the given callback. The corresponding
     * value of each key is the last element responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keys = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keys, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method named by `methodName` on each element in the `collection`
     * returning an array of the results of each invoked method. Additional arguments
     * will be provided to each invoked method. If `methodName` is a function it
     * will be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|string} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [arg] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the collection
     * through the callback. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (property order is not guaranteed across environments)
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(characters, 'name');
     * // => ['barney', 'fred']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        var result = Array(length);
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        result = [];
        forOwn(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of a collection. If the collection is empty or
     * falsey `-Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.max(characters, function(chr) { return chr.age; });
     * // => { 'name': 'fred', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(characters, 'age');
     * // => { 'name': 'fred', 'age': 40 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of a collection. If the collection is empty or
     * falsey `Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.min(characters, function(chr) { return chr.age; });
     * // => { 'name': 'barney', 'age': 36 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(characters, 'age');
     * // => { 'name': 'barney', 'age': 36 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the collection.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {string} property The name of the property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(characters, 'name');
     * // => ['barney', 'fred']
     */
    var pluck = map;

    /**
     * Reduces a collection to a value which is the accumulated result of running
     * each element in the collection through the callback, where each successive
     * callback execution consumes the return value of the previous execution. If
     * `accumulator` is not provided the first element of the collection will be
     * used as the initial `accumulator` value. The callback is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      if (!collection) return accumulator;
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      var index = -1,
          length = collection.length;

      if (typeof length == 'number') {
        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      forEachRight(collection, function(value, index, collection) {
        accumulator = noaccum
          ? (noaccum = false, value)
          : callback(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter` this method returns the elements of a
     * collection that the callback does **not** return truey for.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that failed the callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(characters, 'blocked');
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     *
     * // using "_.where" callback shorthand
     * _.reject(characters, { 'age': 36 });
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Retrieves a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Allows working with functions like `_.map`
     *  without using their `index` arguments as `n`.
     * @returns {Array} Returns the random sample(s) of `collection`.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (collection && typeof collection.length != 'number') {
        collection = values(collection);
      }
      if (n == null || guard) {
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(nativeMax(0, n), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the callback returns a truey value for **any** element of a
     * collection. The function returns as soon as it finds a passing value and
     * does not iterate over the entire collection. The callback is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if any element passed the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(characters, 'blocked');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(characters, { 'age': 1 });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through the callback. This method
     * performs a stable sort, that is, it will preserve the original sort order
     * of equal elements. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an array of property names is provided for `callback` the collection
     * will be sorted by each property value.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'barney',  'age': 26 },
     *   { 'name': 'fred',    'age': 30 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(_.sortBy(characters, 'age'), _.values);
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
     *
     * // sorting by multiple properties
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          isArr = isArray(callback),
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      if (!isArr) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      forEach(collection, function(value, key, collection) {
        var object = result[++index] = getObject();
        if (isArr) {
          object.criteria = map(callback, function(key) { return value[key]; });
        } else {
          (object.criteria = getArray())[0] = callback(value, key, collection);
        }
        object.index = index;
        object.value = value;
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        if (!isArr) {
          releaseArray(object.criteria);
        }
        releaseObject(object);
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return slice(collection);
      }
      return values(collection);
    }

    /**
     * Performs a deep comparison of each element in a `collection` to the given
     * `properties` object, returning an array of all elements that have equivalent
     * property values.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Object} props The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given properties.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.where(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
     *
     * _.where(characters, { 'pets': ['dino'] });
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using strict
     * equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      return baseDifference(array, baseFlatten(arguments, true, true, 1));
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
     * // => 2
     *
     * // using "_.where" callback shorthand
     * _.findIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findIndex(characters, 'blocked');
     * // => 1
     */
    function findIndex(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': true },
     *   { 'name': 'fred',    'age': 40, 'blocked': false },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
     * ];
     *
     * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
     * // => 1
     *
     * // using "_.where" callback shorthand
     * _.findLastIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findLastIndex(characters, 'blocked');
     * // => 2
     */
    function findLastIndex(array, callback, thisArg) {
      var length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(array[length], length, array)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Gets the first element or first `n` elements of an array. If a callback
     * is provided elements at the beginning of the array are returned as long
     * as the callback returns truey. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(characters, 'blocked');
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
     * // => ['barney', 'fred']
     */
    function first(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = -1;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[0] : undefined;
        }
      }
      return slice(array, 0, nativeMin(nativeMax(0, n), length));
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truey, the array will only be flattened a single level. If a callback
     * is provided each element of the array is passed through the callback before
     * flattening. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(characters, 'pets');
     * // => ['hoppy', 'baby puss', 'dino']
     */
    function flatten(array, isShallow, callback, thisArg) {
      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
        isShallow = false;
      }
      if (callback != null) {
        array = map(array, callback, thisArg);
      }
      return baseFlatten(array, isShallow);
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the array is already sorted
     * providing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return baseIndexOf(array, value, fromIndex);
    }

    /**
     * Gets all but the last element or last `n` elements of an array. If a
     * callback is provided elements at the end of the array are excluded from
     * the result as long as the callback returns truey. The callback is bound
     * to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(characters, 'blocked');
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
     * // => ['barney', 'fred']
     */
    function initial(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Creates an array of unique values present in all provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of shared values.
     * @example
     *
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2]
     */
    function intersection() {
      var args = [],
          argsIndex = -1,
          argsLength = arguments.length,
          caches = getArray(),
          indexOf = getIndexOf(),
          trustIndexOf = indexOf === baseIndexOf,
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = arguments[argsIndex];
        if (isArray(value) || isArguments(value)) {
          args.push(value);
          caches.push(trustIndexOf && value.length >= largeArraySize &&
            createCache(argsIndex ? args[argsIndex] : seen));
        }
      }
      var array = args[0],
          index = -1,
          length = array ? array.length : 0,
          result = [];

      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }

    /**
     * Gets the last element or last `n` elements of an array. If a callback is
     * provided elements at the end of the array are returned as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.last(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.last(characters, { 'employer': 'na' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function last(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[length - 1] : undefined;
        }
      }
      return slice(array, nativeMax(0, length - n));
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from the given array using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {...*} [value] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull(array) {
      var args = arguments,
          argsIndex = 0,
          argsLength = args.length,
          length = array ? array.length : 0;

      while (++argsIndex < argsLength) {
        var index = -1,
            value = args[argsIndex];
        while (++index < length) {
          if (array[index] === value) {
            splice.call(array, index--, 1);
            length--;
          }
        }
      }
      return array;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`. If `start` is less than `stop` a
     * zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      start = +start || 0;
      step = typeof step == 'number' ? step : (+step || 1);

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / (step || 1))),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Removes all elements from an array that the callback returns truey for
     * and returns an array of removed elements. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4, 5, 6];
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
     *
     * console.log(array);
     * // => [1, 3, 5]
     *
     * console.log(evens);
     * // => [2, 4, 6]
     */
    function remove(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (callback(value, index, array)) {
          result.push(value);
          splice.call(array, index--, 1);
          length--;
        }
      }
      return result;
    }

    /**
     * The opposite of `_.initial` this method gets all but the first element or
     * first `n` elements of an array. If a callback function is provided elements
     * at the beginning of the array are excluded from the result as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.rest(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.rest(characters, { 'employer': 'slate' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which a value
     * should be inserted into a given sorted array in order to maintain the sort
     * order of the array. If a callback is provided it will be executed for
     * `value` and each element of `array` to compute their sort ranking. The
     * callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of combined values.
     * @example
     *
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2, 3, 5, 4]
     */
    function union() {
      return baseUniq(baseFlatten(arguments, true, true));
    }

    /**
     * Creates a duplicate-value-free version of an array using strict equality
     * for comparisons, i.e. `===`. If the array is sorted, providing
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
     * each element of `array` is passed through the callback before uniqueness
     * is computed. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
     * // => ['A', 'b', 'C']
     *
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2.5, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
        isSorted = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      return baseUniq(array, isSorted, callback);
    }

    /**
     * Creates an array excluding all provided values using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {...*} [value] The values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      return baseDifference(array, slice(arguments, 1));
    }

    /**
     * Creates an array that is the symmetric difference of the provided arrays.
     * See http://en.wikipedia.org/wiki/Symmetric_difference.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of values.
     * @example
     *
     * _.xor([1, 2, 3], [5, 2, 1, 4]);
     * // => [3, 5, 4]
     *
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
     * // => [1, 4, 5]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArray(array) || isArguments(array)) {
          var result = result
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
            : array;
        }
      }
      return result || [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second
     * elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @alias unzip
     * @category Arrays
     * @param {...Array} [array] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    function zip() {
      var array = arguments.length > 1 ? arguments : arguments[0],
          index = -1,
          length = array ? max(pluck(array, 'length')) : 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Provide
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
     * or two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      if (!values && length && !isArray(keys[0])) {
        values = [];
      }
      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that executes `func`, with  the `this` binding and
     * arguments of the created function, only after being called `n` times.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {number} n The number of times the function must be called before
     *  `func` is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'Done saving!', after all saves have completed
     */
    function after(n, func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * provided to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'fred' }, 'hi');
     * func();
     * // => 'hi fred'
     */
    function bind(func, thisArg) {
      return arguments.length > 2
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
        : createWrapper(func, 1, null, null, thisArg);
    }

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all the function properties
     * of `object` will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...string} [methodName] The object method names to
     *  bind, specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() { console.log('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
          index = -1,
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = createWrapper(object[key], 1, null, null, object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those provided to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi fred'
     *
     * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hiya fred!'
     */
    function bindKey(object, key) {
      return arguments.length > 2
        ? createWrapper(key, 19, slice(arguments, 2), null, object)
        : createWrapper(key, 3, null, null, object);
    }

    /**
     * Creates a function that is the composition of the provided functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {...Function} [func] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
     *
     * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
     *
     * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
     *
     * var welcome = _.compose(greet, format);
     * welcome('pebbles');
     * // => 'Hiya Penelope!'
     */
    function compose() {
      var funcs = arguments,
          length = funcs.length;

      while (length--) {
        if (!isFunction(funcs[length])) {
          throw new TypeError;
        }
      }
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Creates a function which accepts one or more arguments of `func` that when
     * invoked either executes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` can be specified
     * if `func.length` is not sufficient.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
     *
     * curried(1)(2)(3);
     * // => 6
     *
     * curried(1, 2)(3);
     * // => 6
     *
     * curried(1, 2, 3);
     * // => 6
     */
    function curry(func, arity) {
      arity = typeof arity == 'number' ? arity : (+arity || func.length);
      return createWrapper(func, 4, null, null, null, arity);
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked.
     * Provide an options object to indicate that `func` should be invoked on
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
     * to the debounced function will return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * var lazyLayout = _.debounce(calculateLayout, 150);
     * jQuery(window).on('resize', lazyLayout);
     *
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
     *
     * // ensure `batchLog` is executed once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      wait = nativeMax(0, wait) || 0;
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      var delayed = function() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0) {
          if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
          }
          var isCalled = trailingCall;
          maxTimeoutId = timeoutId = trailingCall = undefined;
          if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
          }
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      };

      var maxDelayed = function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (trailing || (maxWait !== wait)) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      };

      return function() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
        return result;
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) { console.log(text); }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    function defer(func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay execution.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) { console.log(text); }, 1000, 'later');
     * // => logs 'later' after one second
     */
    function delay(func, wait) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it will be used to determine the cache key for storing the result
     * based on the arguments provided to the memoized function. By default, the
     * first argument provided to the memoized function is used as the cache key.
     * The `func` is executed with the `this` binding of the memoized function.
     * The result cache is exposed as the `cache` property on the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     *
     * fibonacci(9)
     * // => 34
     *
     * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // modifying the result cache
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
     * get('pebbles');
     * // => { 'name': 'pebbles', 'age': 1 }
     *
     * get.cache.pebbles.name = 'penelope';
     * get('pebbles');
     * // => { 'name': 'penelope', 'age': 1 }
     */
    function memoize(func, resolver) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var memoized = function() {
        var cache = memoized.cache,
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      }
      memoized.cache = {};
      return memoized;
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those provided to the new function. This
     * method is similar to `_.bind` except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('fred');
     * // => 'hi fred'
     */
    function partial(func) {
      return createWrapper(func, 16, slice(arguments, 1));
    }

    /**
     * This method is like `_.partial` except that `partial` arguments are
     * appended to those provided to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createWrapper(func, 32, null, slice(arguments, 1));
    }

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. Provide an options object to
     * indicate that `func` should be invoked on the leading and/or trailing edge
     * of the `wait` timeout. Subsequent calls to the throttled function will
     * return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {number} wait The number of milliseconds to throttle executions to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     *
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = wait;
      debounceOptions.trailing = trailing;

      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Additional arguments provided to the function are appended
     * to those provided to the wrapper function. The wrapper is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('Fred, Wilma, & Pebbles');
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
     */
    function wrap(value, wrapper) {
      return createWrapper(wrapper, 16, [value]);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var getter = _.constant(object);
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name the created callback will return the property value for a given element.
     * If `func` is an object the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(characters, 'age__gt38');
     * // => [{ 'name': 'fred', 'age': 40 }]
     */
    function createCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
      }
      // handle "_.pluck" style callback shorthands
      if (type != 'object') {
        return property(func);
      }
      var props = keys(func),
          key = props[0],
          a = func[key];

      // handle "_.where" style callback shorthands
      if (props.length == 1 && a === a && !isObject(a)) {
        // fast path the common case of providing an object with a single
        // property containing a primitive value
        return function(object) {
          var b = object[key];
          return a === b && (a !== 0 || (1 / a == 1 / b));
        };
      }
      return function(object) {
        var length = props.length,
            result = false;

        while (length--) {
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
            break;
          }
        }
        return result;
      };
    }

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('Fred, Wilma, & Pebbles');
     * // => 'Fred, Wilma, &amp; Pebbles'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds function properties of a source object to the destination object.
     * If `object` is a function methods will be added to its prototype as well.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Function|Object} [object=lodash] object The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
     * @example
     *
     * function capitalize(string) {
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     * }
     *
     * _.mixin({ 'capitalize': capitalize });
     * _.capitalize('fred');
     * // => 'Fred'
     *
     * _('fred').capitalize().value();
     * // => 'Fred'
     *
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
     * _('fred').capitalize();
     * // => 'Fred'
     */
    function mixin(object, source, options) {
      var chain = true,
          methodNames = source && functions(source);

      if (!source || (!options && !methodNames.length)) {
        if (options == null) {
          options = source;
        }
        ctor = lodashWrapper;
        source = object;
        object = lodash;
        methodNames = functions(source);
      }
      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      var ctor = object,
          isFunc = isFunction(ctor);

      forEach(methodNames, function(methodName) {
        var func = object[methodName] = source[methodName];
        if (isFunc) {
          ctor.prototype[methodName] = function() {
            var chainAll = this.__chain__,
                value = this.__wrapped__,
                args = [value];

            push.apply(args, arguments);
            var result = func.apply(object, args);
            if (chain || chainAll) {
              if (value === result && isObject(result)) {
                return this;
              }
              result = new ctor(result);
              result.__chain__ = chainAll;
            }
            return result;
          };
        }
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * A no-operation function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // no operation performed
    }

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var stamp = _.now();
     * _.defer(function() { console.log(_.now() - stamp); });
     * // => logs the number of milliseconds it took for the deferred function to be called
     */
    var now = isNative(now = Date.now) && now || function() {
      return new Date().getTime();
    };

    /**
     * Converts the given value into an integer of the specified radix.
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.io/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} value The value to parse.
     * @param {number} [radix] The radix used to interpret the value to parse.
     * @returns {number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
    };

    /**
     * Creates a "_.pluck" style function, which returns the `key` value of a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} key The name of the property to retrieve.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var characters = [
     *   { 'name': 'fred',   'age': 40 },
     *   { 'name': 'barney', 'age': 36 }
     * ];
     *
     * var getName = _.property('name');
     *
     * _.map(characters, getName);
     * // => ['barney', 'fred']
     *
     * _.sortBy(characters, getName);
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
     */
    function property(key) {
      return function(object) {
        return object[key];
      };
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number will be
     * returned. If `floating` is truey or either `min` or `max` are floats a
     * floating-point number will be returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating=false] Specify returning a floating-point number.
     * @returns {number} Returns a random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (typeof min == 'boolean' && noMax) {
          floating = min;
          min = 1;
        }
        else if (!noMax && typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /**
     * Resolves the value of property `key` on `object`. If `key` is a function
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to resolve.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, key) {
      if (object) {
        var value = object[key];
        return isFunction(value) ? object[key]() : value;
      }
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * For more information on precompiling templates see:
     * http://lodash.com/custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} text The template text.
     * @param {Object} data The data object used to populate the text.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as local variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [variable] The data object variable name.
     * @returns {Function|string} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'fred' });
     * // => 'hello fred'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to generate HTML
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'pebbles' });
     * // => 'hello pebbles'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
     * // => 'hello barney!'
     *
     * // using a custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `imports` option to import jQuery
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text = String(text || '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source by its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the callback `n` times, returning an array of the results
     * of each callback execution. The callback is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns an array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = baseCreateCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The inverse of `_.escape` this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('Fred, Barney &amp; Pebbles');
     * // => 'Fred, Barney & Pebbles'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps the given value with explicit
     * method chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(characters)
     *     .sortBy('age')
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
     *     .first()
     *     .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      value = new lodashWrapper(value);
      value.__chain__ = true;
      return value;
    }

    /**
     * Invokes `interceptor` with the `value` as the first argument and then
     * returns `value`. The purpose of this method is to "tap into" a method
     * chain in order to perform operations on intermediate results within
     * the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .tap(function(array) { array.pop(); })
     *  .reverse()
     *  .value();
     * // => [3, 2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chaining
     * @returns {*} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(characters).first();
     * // => { 'name': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(characters).chain()
     *   .first()
     *   .pick('age')
     *   .value();
     * // => { 'age': 36 }
     */
    function wrapperChain() {
      this.__chain__ = true;
      return this;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {string} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {*} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.createCallback = createCallback;
    lodash.curry = curry;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.mapValues = mapValues;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.pull = pull;
    lodash.range = range;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    lodash.unzip = zip;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    mixin(function() {
      var source = {}
      forOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }(), false);

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;
    lodash.sample = sample;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      var callbackable = methodName !== 'sample';
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(n, guard) {
          var chainAll = this.__chain__,
              result = func(this.__wrapped__, n, guard);

          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
            ? result
            : new lodashWrapper(result, chainAll);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = '2.4.1';

    // add "Chaining" functions to the wrapper
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    forEach(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            result = func.apply(this.__wrapped__, arguments);

        return chainAll
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });

    // add `Array` functions that return the existing wrapped value
    forEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    forEach(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
      };
    });

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
    root._ = _;
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
(function (global){
//! moment.js
//! version : 2.8.4
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (undefined) {
    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = '2.8.4',
        // the global-scope this is NOT the global object in Node.js
        globalScope = typeof global !== 'undefined' ? global : this,
        oldGlobalMoment,
        round = Math.round,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        i,

        YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,

        // internal storage for locale config files
        locales = {},

        // extra moment internal properties (plugins register props here)
        momentProperties = [],

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module && module.exports),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenDigits = /\d+/, // nonzero number of digits
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO separator)
        parseTokenOffsetMs = /[\+\-]?\d+/, // 1234567890123
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

        //strict parsing regexes
        parseTokenOneDigit = /\d/, // 0 - 9
        parseTokenTwoDigits = /\d\d/, // 00 - 99
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{4}/, // 0000 - 9999
        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d{2}/],
            ['YYYY-DDD', /\d{4}-\d{3}/]
        ],

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

        // timezone chunker '+10:00' > ['10', '00'] or '-1530' > ['-15', '30']
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        unitAliases = {
            ms : 'millisecond',
            s : 'second',
            m : 'minute',
            h : 'hour',
            d : 'day',
            D : 'date',
            w : 'week',
            W : 'isoWeek',
            M : 'month',
            Q : 'quarter',
            y : 'year',
            DDD : 'dayOfYear',
            e : 'weekday',
            E : 'isoWeekday',
            gg: 'weekYear',
            GG: 'isoWeekYear'
        },

        camelFunctions = {
            dayofyear : 'dayOfYear',
            isoweekday : 'isoWeekday',
            isoweek : 'isoWeek',
            weekyear : 'weekYear',
            isoweekyear : 'isoWeekYear'
        },

        // format function strings
        formatFunctions = {},

        // default relative time thresholds
        relativeTimeThresholds = {
            s: 45,  // seconds to minute
            m: 45,  // minutes to hour
            h: 22,  // hours to day
            d: 26,  // days to month
            M: 11   // months to year
        },

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.localeData().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.localeData().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.localeData().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.localeData().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.localeData().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            YYYYYY : function () {
                var y = this.year(), sign = y >= 0 ? '+' : '-';
                return sign + leftZeroFill(Math.abs(y), 6);
            },
            gg   : function () {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg : function () {
                return leftZeroFill(this.weekYear(), 4);
            },
            ggggg : function () {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG   : function () {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 4);
            },
            GGGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e : function () {
                return this.weekday();
            },
            E : function () {
                return this.isoWeekday();
            },
            a    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return toInt(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            SSSS : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = -this.zone(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
            },
            ZZ   : function () {
                var a = -this.zone(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
            },
            z : function () {
                return this.zoneAbbr();
            },
            zz : function () {
                return this.zoneName();
            },
            x    : function () {
                return this.valueOf();
            },
            X    : function () {
                return this.unix();
            },
            Q : function () {
                return this.quarter();
            }
        },

        deprecations = {},

        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'];

    // Pick the first defined of two or three arguments. dfl comes from
    // default.
    function dfl(a, b, c) {
        switch (arguments.length) {
            case 2: return a != null ? a : b;
            case 3: return a != null ? a : b != null ? b : c;
            default: throw new Error('Implement me');
        }
    }

    function hasOwnProp(a, b) {
        return hasOwnProperty.call(a, b);
    }

    function defaultParsingFlags() {
        // We need to deep clone this object, and es5 standard is not very
        // helpful.
        return {
            empty : false,
            unusedTokens : [],
            unusedInput : [],
            overflow : -2,
            charsLeftOver : 0,
            nullInput : false,
            invalidMonth : null,
            invalidFormat : false,
            userInvalidated : false,
            iso: false
        };
    }

    function printMsg(msg) {
        if (moment.suppressDeprecationWarnings === false &&
                typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;
        return extend(function () {
            if (firstTime) {
                printMsg(msg);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            printMsg(msg);
            deprecations[name] = true;
        }
    }

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function (a) {
            return this.localeData().ordinal(func.call(this, a), period);
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
        Constructors
    ************************************/

    function Locale() {
    }

    // Moment prototype object
    function Moment(config, skipOverflow) {
        if (skipOverflow !== false) {
            checkOverflow(config);
        }
        copyConfig(this, config);
        this._d = new Date(+config._d);
    }

    // Duration Constructor
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = moment.localeData();

        this._bubble();
    }

    /************************************
        Helpers
    ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function copyConfig(to, from) {
        var i, prop, val;

        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = from._pf;
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),
            sign = number >= 0;

        while (output.length < targetLength) {
            output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        other = makeAs(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = moment.duration(val, period);
            addOrSubtractDurationFromMoment(this, dur, direction);
            return this;
        };
    }

    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
        }
        if (months) {
            rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            moment.updateOffset(mom, days || months);
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return Object.prototype.toString.call(input) === '[object Date]' ||
            input instanceof Date;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeList(field) {
        var count, setter;

        if (field.indexOf('week') === 0) {
            count = 7;
            setter = 'day';
        }
        else if (field.indexOf('month') === 0) {
            count = 12;
            setter = 'month';
        }
        else {
            return;
        }

        moment[field] = function (format, index) {
            var i, getter,
                method = moment._locale[field],
                results = [];

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            getter = function (i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment._locale, m, format || '');
            };

            if (index != null) {
                return getter(index);
            }
            else {
                for (i = 0; i < count; i++) {
                    results.push(getter(i));
                }
                return results;
            }
        };
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            if (coercedNumber >= 0) {
                value = Math.floor(coercedNumber);
            } else {
                value = Math.ceil(coercedNumber);
            }
        }

        return value;
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    function weeksInYear(year, dow, doy) {
        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function checkOverflow(m) {
        var overflow;
        if (m._a && m._pf.overflow === -2) {
            overflow =
                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
                m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
                m._a[HOUR] < 0 || m._a[HOUR] > 24 ||
                    (m._a[HOUR] === 24 && (m._a[MINUTE] !== 0 ||
                                           m._a[SECOND] !== 0 ||
                                           m._a[MILLISECOND] !== 0)) ? HOUR :
                m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
                m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            m._pf.overflow = overflow;
        }
    }

    function isValid(m) {
        if (m._isValid == null) {
            m._isValid = !isNaN(m._d.getTime()) &&
                m._pf.overflow < 0 &&
                !m._pf.empty &&
                !m._pf.invalidMonth &&
                !m._pf.nullInput &&
                !m._pf.invalidFormat &&
                !m._pf.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    m._pf.charsLeftOver === 0 &&
                    m._pf.unusedTokens.length === 0 &&
                    m._pf.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        if (!locales[name] && hasModule) {
            try {
                oldLocale = moment.locale();
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we want to undo that for lazy loaded locales
                moment.locale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function makeAs(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (moment.isMoment(input) || isDate(input) ?
                    +input : +moment(input)) - (+res);
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(+res._d + diff);
            moment.updateOffset(res, false);
            return res;
        } else {
            return moment(input).local();
        }
    }

    /************************************
        Locale
    ************************************/


    extend(Locale.prototype, {

        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
            // Lenient ordinal parsing accepts just a number in addition to
            // number + (possibly) stuff coming from _ordinalParseLenient.
            this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + /\d{1,2}/.source);
        },

        _months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName, format, strict) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = moment.utc([2000, i]);
                if (strict && !this._longMonthsParse[i]) {
                    this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                    this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
                }
                if (!strict && !this._monthsParse[i]) {
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                    return i;
                } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                    return i;
                } else if (!strict && this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        weekdaysParse : function (weekdayName) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                if (!this._weekdaysParse[i]) {
                    mom = moment([2000, 1]).day(i);
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },

        _longDateFormat : {
            LTS : 'h:mm:ss A',
            LT : 'h:mm A',
            L : 'MM/DD/YYYY',
            LL : 'MMMM D, YYYY',
            LLL : 'MMMM D, YYYY LT',
            LLLL : 'dddd, MMMM D, YYYY LT'
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        isPM : function (input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return ((input + '').toLowerCase().charAt(0) === 'p');
        },

        _meridiemParse : /[ap]\.?m?\.?/i,
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },

        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom, now) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom, [now]) : output;
        },

        _relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },

        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },

        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace('%d', number);
        },
        _ordinal : '%d',
        _ordinalParse : /\d{1,2}/,

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },

        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        },

        _invalidDate: 'Invalid date',
        invalidDate: function () {
            return this._invalidDate;
        }
    });

    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
        case 'Q':
            return parseTokenOneDigit;
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
        case 'GGGG':
        case 'gggg':
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
        case 'Y':
        case 'G':
        case 'g':
            return parseTokenSignedNumber;
        case 'YYYYYY':
        case 'YYYYY':
        case 'GGGGG':
        case 'ggggg':
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
        case 'S':
            if (strict) {
                return parseTokenOneDigit;
            }
            /* falls through */
        case 'SS':
            if (strict) {
                return parseTokenTwoDigits;
            }
            /* falls through */
        case 'SSS':
            if (strict) {
                return parseTokenThreeDigits;
            }
            /* falls through */
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
            return parseTokenWord;
        case 'a':
        case 'A':
            return config._locale._meridiemParse;
        case 'x':
            return parseTokenOffsetMs;
        case 'X':
            return parseTokenTimestampMs;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'SSSS':
            return parseTokenDigits;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'GG':
        case 'gg':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'ww':
        case 'WW':
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
        case 'w':
        case 'W':
        case 'e':
        case 'E':
            return parseTokenOneOrTwoDigits;
        case 'Do':
            return strict ? config._locale._ordinalParse : config._locale._ordinalParseLenient;
        default :
            a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
            return a;
        }
    }

    function timezoneMinutesFromString(string) {
        string = string || '';
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? -minutes : minutes;
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;

        switch (token) {
        // QUARTER
        case 'Q':
            if (input != null) {
                datePartArray[MONTH] = (toInt(input) - 1) * 3;
            }
            break;
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            if (input != null) {
                datePartArray[MONTH] = toInt(input) - 1;
            }
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            a = config._locale.monthsParse(input, token, config._strict);
            // if we didn't find a month name, mark the date as invalid.
            if (a != null) {
                datePartArray[MONTH] = a;
            } else {
                config._pf.invalidMonth = input;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DD
        case 'DD' :
            if (input != null) {
                datePartArray[DATE] = toInt(input);
            }
            break;
        case 'Do' :
            if (input != null) {
                datePartArray[DATE] = toInt(parseInt(
                            input.match(/\d{1,2}/)[0], 10));
            }
            break;
        // DAY OF YEAR
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                config._dayOfYear = toInt(input);
            }

            break;
        // YEAR
        case 'YY' :
            datePartArray[YEAR] = moment.parseTwoDigitYear(input);
            break;
        case 'YYYY' :
        case 'YYYYY' :
        case 'YYYYYY' :
            datePartArray[YEAR] = toInt(input);
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config._isPm = config._locale.isPM(input);
            break;
        // HOUR
        case 'h' : // fall through to hh
        case 'hh' :
            config._pf.bigHour = true;
            /* falls through */
        case 'H' : // fall through to HH
        case 'HH' :
            datePartArray[HOUR] = toInt(input);
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[MINUTE] = toInt(input);
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[SECOND] = toInt(input);
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
        case 'SSSS' :
            datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
            break;
        // UNIX OFFSET (MILLISECONDS)
        case 'x':
            config._d = new Date(toInt(input));
            break;
        // UNIX TIMESTAMP WITH MS
        case 'X':
            config._d = new Date(parseFloat(input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config._useUTC = true;
            config._tzm = timezoneMinutesFromString(input);
            break;
        // WEEKDAY - human
        case 'dd':
        case 'ddd':
        case 'dddd':
            a = config._locale.weekdaysParse(input);
            // if we didn't get a weekday name, mark the date as invalid
            if (a != null) {
                config._w = config._w || {};
                config._w['d'] = a;
            } else {
                config._pf.invalidWeekday = input;
            }
            break;
        // WEEK, WEEK DAY - numeric
        case 'w':
        case 'ww':
        case 'W':
        case 'WW':
        case 'd':
        case 'e':
        case 'E':
            token = token.substr(0, 1);
            /* falls through */
        case 'gggg':
        case 'GGGG':
        case 'GGGGG':
            token = token.substr(0, 2);
            if (input) {
                config._w = config._w || {};
                config._w[token] = toInt(input);
            }
            break;
        case 'gg':
        case 'GG':
            config._w = config._w || {};
            config._w[token] = moment.parseTwoDigitYear(input);
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
            week = dfl(w.W, 1);
            weekday = dfl(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
            week = dfl(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromConfig(config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                config._pf._overflowDayOfYear = true;
            }

            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
        // Apply timezone offset from input. The actual zone can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() + config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dateFromObject(config) {
        var normalizedInput;

        if (config._d) {
            return;
        }

        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [
            normalizedInput.year,
            normalizedInput.month,
            normalizedInput.day || normalizedInput.date,
            normalizedInput.hour,
            normalizedInput.minute,
            normalizedInput.second,
            normalizedInput.millisecond
        ];

        dateFromConfig(config);
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            ];
        } else {
            return [now.getFullYear(), now.getMonth(), now.getDate()];
        }
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {
        if (config._f === moment.ISO_8601) {
            parseISO(config);
            return;
        }

        config._a = [];
        config._pf.empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    config._pf.unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    config._pf.empty = false;
                }
                else {
                    config._pf.unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                config._pf.unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            config._pf.unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._pf.bigHour === true && config._a[HOUR] <= 12) {
            config._pf.bigHour = undefined;
        }
        // handle am pm
        if (config._isPm && config._a[HOUR] < 12) {
            config._a[HOUR] += 12;
        }
        // if is 12 am, change hours to 0
        if (config._isPm === false && config._a[HOUR] === 12) {
            config._a[HOUR] = 0;
        }
        dateFromConfig(config);
        checkOverflow(config);
    }

    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            config._pf.invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += tempConfig._pf.charsLeftOver;

            //or tokens
            currentScore += tempConfig._pf.unusedTokens.length * 10;

            tempConfig._pf.score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    // date from iso format
    function parseISO(config) {
        var i, l,
            string = config._i,
            match = isoRegex.exec(string);

        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    // match[5] should be 'T' or undefined
                    config._f = isoDates[i][0] + (match[6] || ' ');
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (string.match(parseTokenTimezone)) {
                config._f += 'Z';
            }
            makeDateFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function makeDateFromString(config) {
        parseISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            moment.createFromInputFallback(config);
        }
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function makeDateFromInput(config) {
        var input = config._i, matched;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if ((matched = aspNetJsonRegex.exec(input)) !== null) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            dateFromConfig(config);
        } else if (typeof(input) === 'object') {
            dateFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            moment.createFromInputFallback(config);
        }
    }

    function makeDate(y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    function parseWeekday(input, locale) {
        if (typeof input === 'string') {
            if (!isNaN(input)) {
                input = parseInt(input, 10);
            }
            else {
                input = locale.weekdaysParse(input);
                if (typeof input !== 'number') {
                    return null;
                }
            }
        }
        return input;
    }

    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(posNegDuration, withoutSuffix, locale) {
        var duration = moment.duration(posNegDuration).abs(),
            seconds = round(duration.as('s')),
            minutes = round(duration.as('m')),
            hours = round(duration.as('h')),
            days = round(duration.as('d')),
            months = round(duration.as('M')),
            years = round(duration.as('y')),

            args = seconds < relativeTimeThresholds.s && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < relativeTimeThresholds.m && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < relativeTimeThresholds.h && ['hh', hours] ||
                days === 1 && ['d'] ||
                days < relativeTimeThresholds.d && ['dd', days] ||
                months === 1 && ['M'] ||
                months < relativeTimeThresholds.M && ['MM', months] ||
                years === 1 && ['y'] || ['yy', years];

        args[2] = withoutSuffix;
        args[3] = +posNegDuration > 0;
        args[4] = locale;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Week of Year
    ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = moment(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;

        d = d === 0 ? 7 : d;
        weekday = weekday != null ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    /************************************
        Top Level Functions
    ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f,
            res;

        config._locale = config._locale || moment.localeData(config._l);

        if (input === null || (format === undefined && input === '')) {
            return moment.invalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (moment.isMoment(input)) {
            return new Moment(input, true);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        res = new Moment(config);
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    moment = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = locale;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();

        return makeMoment(c);
    };

    moment.suppressDeprecationWarnings = false;

    moment.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return moment();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    moment.min = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    };

    moment.max = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    };

    // creating with utc
    moment.utc = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();

        return makeMoment(c).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            parseIso,
            diffRes;

        if (moment.isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoDurationRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            parseIso = function (inp) {
                // We'd normally use ~~inp for this, but unfortunately it also
                // converts floats to ints.
                // inp may be undefined, so careful calling replace on it.
                var res = inp && parseFloat(inp.replace(',', '.'));
                // apply sign while we're at it
                return (isNaN(res) ? 0 : res) * sign;
            };
            duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            };
        } else if (typeof duration === 'object' &&
                ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(moment(duration.from), moment(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (moment.isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // constant that refers to the ISO standard
    moment.ISO_8601 = function () {};

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    moment.momentProperties = momentProperties;

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    moment.updateOffset = function () {};

    // This function allows you to set a threshold for relative time strings
    moment.relativeTimeThreshold = function (threshold, limit) {
        if (relativeTimeThresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return relativeTimeThresholds[threshold];
        }
        relativeTimeThresholds[threshold] = limit;
        return true;
    };

    moment.lang = deprecate(
        'moment.lang is deprecated. Use moment.locale instead.',
        function (key, value) {
            return moment.locale(key, value);
        }
    );

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    moment.locale = function (key, values) {
        var data;
        if (key) {
            if (typeof(values) !== 'undefined') {
                data = moment.defineLocale(key, values);
            }
            else {
                data = moment.localeData(key);
            }

            if (data) {
                moment.duration._locale = moment._locale = data;
            }
        }

        return moment._locale._abbr;
    };

    moment.defineLocale = function (name, values) {
        if (values !== null) {
            values.abbr = name;
            if (!locales[name]) {
                locales[name] = new Locale();
            }
            locales[name].set(values);

            // backwards compat for now: also set the locale
            moment.locale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    };

    moment.langData = deprecate(
        'moment.langData is deprecated. Use moment.localeData instead.',
        function (key) {
            return moment.localeData(key);
        }
    );

    // returns locale data
    moment.localeData = function (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return moment._locale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment ||
            (obj != null && hasOwnProp(obj, '_isAMomentObject'));
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    for (i = lists.length - 1; i >= 0; --i) {
        makeList(lists[i]);
    }

    moment.normalizeUnits = function (units) {
        return normalizeUnits(units);
    };

    moment.invalid = function (flags) {
        var m = moment.utc(NaN);
        if (flags != null) {
            extend(m._pf, flags);
        }
        else {
            m._pf.userInvalidated = true;
        }

        return m;
    };

    moment.parseZone = function () {
        return moment.apply(null, arguments).parseZone();
    };

    moment.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    /************************************
        Moment Prototype
    ************************************/


    extend(moment.fn = Moment.prototype, {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d + ((this._offset || 0) * 60000);
        },

        unix : function () {
            return Math.floor(+this / 1000);
        },

        toString : function () {
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
        },

        toDate : function () {
            return this._offset ? new Date(+this) : this._d;
        },

        toISOString : function () {
            var m = moment(this).utc();
            if (0 < m.year() && m.year() <= 9999) {
                if ('function' === typeof Date.prototype.toISOString) {
                    // native implementation is ~50x faster, use it when we can
                    return this.toDate().toISOString();
                } else {
                    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
                }
            } else {
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            return isValid(this);
        },

        isDSTShifted : function () {
            if (this._a) {
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }

            return false;
        },

        parsingFlags : function () {
            return extend({}, this._pf);
        },

        invalidAt: function () {
            return this._pf.overflow;
        },

        utc : function (keepLocalTime) {
            return this.zone(0, keepLocalTime);
        },

        local : function (keepLocalTime) {
            if (this._isUTC) {
                this.zone(0, keepLocalTime);
                this._isUTC = false;

                if (keepLocalTime) {
                    this.add(this._dateTzOffset(), 'm');
                }
            }
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.localeData().postformat(output);
        },

        add : createAdder(1, 'add'),

        subtract : createAdder(-1, 'subtract'),

        diff : function (input, units, asFloat) {
            var that = makeAs(input, this),
                zoneDiff = (this.zone() - that.zone()) * 6e4,
                diff, output, daysAdjust;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month') {
                // average number of days in the months in the given dates
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
                // difference in months
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                // adjust by taking difference in days, average number of days
                // and dst in the given months.
                daysAdjust = (this - moment(this).startOf('month')) -
                    (that - moment(that).startOf('month'));
                // same as above but with zones, to negate all dst
                daysAdjust -= ((this.zone() - moment(this).startOf('month').zone()) -
                        (that.zone() - moment(that).startOf('month').zone())) * 6e4;
                output += daysAdjust / diff;
                if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = (this - that);
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function (time) {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're zone'd or not.
            var now = time || moment(),
                sod = makeAs(now, this).startOf('day'),
                diff = this.diff(sod, 'days', true),
                format = diff < -6 ? 'sameElse' :
                    diff < -1 ? 'lastWeek' :
                    diff < 0 ? 'lastDay' :
                    diff < 1 ? 'sameDay' :
                    diff < 2 ? 'nextDay' :
                    diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.localeData().calendar(format, this, moment(now)));
        },

        isLeapYear : function () {
            return isLeapYear(this.year());
        },

        isDST : function () {
            return (this.zone() < this.clone().month(0).zone() ||
                this.zone() < this.clone().month(5).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.localeData());
                return this.add(input - day, 'd');
            } else {
                return day;
            }
        },

        month : makeAccessor('Month', true),

        startOf : function (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            } else if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            // quarters are also special
            if (units === 'quarter') {
                this.month(Math.floor(this.month() / 3) * 3);
            }

            return this;
        },

        endOf: function (units) {
            units = normalizeUnits(units);
            if (units === undefined || units === 'millisecond') {
                return this;
            }
            return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
        },

        isAfter: function (input, units) {
            var inputMs;
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this > +input;
            } else {
                inputMs = moment.isMoment(input) ? +input : +moment(input);
                return inputMs < +this.clone().startOf(units);
            }
        },

        isBefore: function (input, units) {
            var inputMs;
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this < +input;
            } else {
                inputMs = moment.isMoment(input) ? +input : +moment(input);
                return +this.clone().endOf(units) < inputMs;
            }
        },

        isSame: function (input, units) {
            var inputMs;
            units = normalizeUnits(units || 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this === +input;
            } else {
                inputMs = +moment(input);
                return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
            }
        },

        min: deprecate(
                 'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
                 function (other) {
                     other = moment.apply(null, arguments);
                     return other < this ? this : other;
                 }
         ),

        max: deprecate(
                'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
                function (other) {
                    other = moment.apply(null, arguments);
                    return other > this ? this : other;
                }
        ),

        // keepLocalTime = true means only change the timezone, without
        // affecting the local hour. So 5:31:26 +0300 --[zone(2, true)]-->
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist int zone
        // +0200, so we adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        zone : function (input, keepLocalTime) {
            var offset = this._offset || 0,
                localAdjust;
            if (input != null) {
                if (typeof input === 'string') {
                    input = timezoneMinutesFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                if (!this._isUTC && keepLocalTime) {
                    localAdjust = this._dateTzOffset();
                }
                this._offset = input;
                this._isUTC = true;
                if (localAdjust != null) {
                    this.subtract(localAdjust, 'm');
                }
                if (offset !== input) {
                    if (!keepLocalTime || this._changeInProgress) {
                        addOrSubtractDurationFromMoment(this,
                                moment.duration(offset - input, 'm'), 1, false);
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        moment.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }
            } else {
                return this._isUTC ? offset : this._dateTzOffset();
            }
            return this;
        },

        zoneAbbr : function () {
            return this._isUTC ? 'UTC' : '';
        },

        zoneName : function () {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        },

        parseZone : function () {
            if (this._tzm) {
                this.zone(this._tzm);
            } else if (typeof this._i === 'string') {
                this.zone(this._i);
            }
            return this;
        },

        hasAlignedHourOffset : function (input) {
            if (!input) {
                input = 0;
            }
            else {
                input = moment(input).zone();
            }

            return (this.zone() - input) % 60 === 0;
        },

        daysInMonth : function () {
            return daysInMonth(this.year(), this.month());
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
        },

        quarter : function (input) {
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
        },

        weekYear : function (input) {
            var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        isoWeekYear : function (input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        week : function (input) {
            var week = this.localeData().week(this);
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        weekday : function (input) {
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return input == null ? weekday : this.add(input - weekday, 'd');
        },

        isoWeekday : function (input) {
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },

        isoWeeksInYear : function () {
            return weeksInYear(this.year(), 1, 4);
        },

        weeksInYear : function () {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units]();
        },

        set : function (units, value) {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                this[units](value);
            }
            return this;
        },

        // If passed a locale key, it will set the locale for this
        // instance.  Otherwise, it will return the locale configuration
        // variables for this instance.
        locale : function (key) {
            var newLocaleData;

            if (key === undefined) {
                return this._locale._abbr;
            } else {
                newLocaleData = moment.localeData(key);
                if (newLocaleData != null) {
                    this._locale = newLocaleData;
                }
                return this;
            }
        },

        lang : deprecate(
            'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
            function (key) {
                if (key === undefined) {
                    return this.localeData();
                } else {
                    return this.locale(key);
                }
            }
        ),

        localeData : function () {
            return this._locale;
        },

        _dateTzOffset : function () {
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
            // https://github.com/moment/moment/pull/1871
            return Math.round(this._d.getTimezoneOffset() / 15) * 15;
        }
    });

    function rawMonthSetter(mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(),
                daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function rawGetter(mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function rawSetter(mom, unit, value) {
        if (unit === 'Month') {
            return rawMonthSetter(mom, value);
        } else {
            return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    function makeAccessor(unit, keepTime) {
        return function (value) {
            if (value != null) {
                rawSetter(this, unit, value);
                moment.updateOffset(this, keepTime);
                return this;
            } else {
                return rawGetter(this, unit);
            }
        };
    }

    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
    moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
    moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
    // moment.fn.month is defined separately
    moment.fn.date = makeAccessor('Date', true);
    moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));
    moment.fn.year = makeAccessor('FullYear', true);
    moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;
    moment.fn.quarters = moment.fn.quarter;

    // add aliased format methods
    moment.fn.toJSON = moment.fn.toISOString;

    /************************************
        Duration Prototype
    ************************************/


    function daysToYears (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        return days * 400 / 146097;
    }

    function yearsToDays (years) {
        // years * 365 + absRound(years / 4) -
        //     absRound(years / 100) + absRound(years / 400);
        return years * 146097 / 400;
    }

    extend(moment.duration.fn = Duration.prototype, {

        _bubble : function () {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds, minutes, hours, years = 0;

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;

            hours = absRound(minutes / 60);
            data.hours = hours % 24;

            days += absRound(hours / 24);

            // Accurately convert days to years, assume start from year 0.
            years = absRound(daysToYears(days));
            days -= absRound(yearsToDays(years));

            // 30 days to a month
            // TODO (iskren): Use anchor date (like 1st Jan) to compute this.
            months += absRound(days / 30);
            days %= 30;

            // 12 months -> 1 year
            years += absRound(months / 12);
            months %= 12;

            data.days = days;
            data.months = months;
            data.years = years;
        },

        abs : function () {
            this._milliseconds = Math.abs(this._milliseconds);
            this._days = Math.abs(this._days);
            this._months = Math.abs(this._months);

            this._data.milliseconds = Math.abs(this._data.milliseconds);
            this._data.seconds = Math.abs(this._data.seconds);
            this._data.minutes = Math.abs(this._data.minutes);
            this._data.hours = Math.abs(this._data.hours);
            this._data.months = Math.abs(this._data.months);
            this._data.years = Math.abs(this._data.years);

            return this;
        },

        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              (this._months % 12) * 2592e6 +
              toInt(this._months / 12) * 31536e6;
        },

        humanize : function (withSuffix) {
            var output = relativeTime(this, !withSuffix, this.localeData());

            if (withSuffix) {
                output = this.localeData().pastFuture(+this, output);
            }

            return this.localeData().postformat(output);
        },

        add : function (input, val) {
            // supports only 2.0-style add(1, 's') or add(moment)
            var dur = moment.duration(input, val);

            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;

            this._bubble();

            return this;
        },

        subtract : function (input, val) {
            var dur = moment.duration(input, val);

            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;

            this._bubble();

            return this;
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + 's']();
        },

        as : function (units) {
            var days, months;
            units = normalizeUnits(units);

            if (units === 'month' || units === 'year') {
                days = this._days + this._milliseconds / 864e5;
                months = this._months + daysToYears(days) * 12;
                return units === 'month' ? months : months / 12;
            } else {
                // handle milliseconds separately because of floating point math errors (issue #1867)
                days = this._days + Math.round(yearsToDays(this._months / 12));
                switch (units) {
                    case 'week': return days / 7 + this._milliseconds / 6048e5;
                    case 'day': return days + this._milliseconds / 864e5;
                    case 'hour': return days * 24 + this._milliseconds / 36e5;
                    case 'minute': return days * 24 * 60 + this._milliseconds / 6e4;
                    case 'second': return days * 24 * 60 * 60 + this._milliseconds / 1000;
                    // Math.floor prevents floating point math errors here
                    case 'millisecond': return Math.floor(days * 24 * 60 * 60 * 1000) + this._milliseconds;
                    default: throw new Error('Unknown unit ' + units);
                }
            }
        },

        lang : moment.fn.lang,
        locale : moment.fn.locale,

        toIsoString : deprecate(
            'toIsoString() is deprecated. Please use toISOString() instead ' +
            '(notice the capitals)',
            function () {
                return this.toISOString();
            }
        ),

        toISOString : function () {
            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var years = Math.abs(this.years()),
                months = Math.abs(this.months()),
                days = Math.abs(this.days()),
                hours = Math.abs(this.hours()),
                minutes = Math.abs(this.minutes()),
                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

            if (!this.asSeconds()) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            return (this.asSeconds() < 0 ? '-' : '') +
                'P' +
                (years ? years + 'Y' : '') +
                (months ? months + 'M' : '') +
                (days ? days + 'D' : '') +
                ((hours || minutes || seconds) ? 'T' : '') +
                (hours ? hours + 'H' : '') +
                (minutes ? minutes + 'M' : '') +
                (seconds ? seconds + 'S' : '');
        },

        localeData : function () {
            return this._locale;
        }
    });

    moment.duration.fn.toString = moment.duration.fn.toISOString;

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    for (i in unitMillisecondFactors) {
        if (hasOwnProp(unitMillisecondFactors, i)) {
            makeDurationGetter(i.toLowerCase());
        }
    }

    moment.duration.fn.asMilliseconds = function () {
        return this.as('ms');
    };
    moment.duration.fn.asSeconds = function () {
        return this.as('s');
    };
    moment.duration.fn.asMinutes = function () {
        return this.as('m');
    };
    moment.duration.fn.asHours = function () {
        return this.as('h');
    };
    moment.duration.fn.asDays = function () {
        return this.as('d');
    };
    moment.duration.fn.asWeeks = function () {
        return this.as('weeks');
    };
    moment.duration.fn.asMonths = function () {
        return this.as('M');
    };
    moment.duration.fn.asYears = function () {
        return this.as('y');
    };

    /************************************
        Default Locale
    ************************************/


    // Set default locale, other locale will inherit from English.
    moment.locale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    /* EMBED_LOCALES */

    /************************************
        Exposing Moment
    ************************************/

    function makeGlobal(shouldDeprecate) {
        /*global ender:false */
        if (typeof ender !== 'undefined') {
            return;
        }
        oldGlobalMoment = globalScope.moment;
        if (shouldDeprecate) {
            globalScope.moment = deprecate(
                    'Accessing Moment through the global scope is ' +
                    'deprecated, and will be removed in an upcoming ' +
                    'release.',
                    moment);
        } else {
            globalScope.moment = moment;
        }
    }

    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    } else if (typeof define === 'function' && define.amd) {
        define('moment', function (require, exports, module) {
            if (module.config && module.config() && module.config().noGlobal === true) {
                // release the global variable
                globalScope.moment = oldGlobalMoment;
            }

            return moment;
        });
        makeGlobal(true);
    } else {
        makeGlobal();
    }
}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
