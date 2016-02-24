var _, api, calculateBonus, diminishingReturns, moment, t;

api = module.exports;

_ = require('lodash');

moment = require('moment');

t = require('./translation.js');

import {
  CLASSES,
  EVENTS,
  GEAR_TYPES,
  ITEM_LIST,
  USER_CAN_OWN_QUEST_CATEGORIES,
} from './constants';

import mysterySets from './mystery-sets';

import gear from './gear';

import appearances from './appearance';
import backgrounds from './appearance/backgrounds.js'

api.mystery = mysterySets;

api.itemList = ITEM_LIST;

api.gear = gear;

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
    },
    birthday: {
      text: t('birthdayCard'),
      mana: 0,
      value: 10,
      immediateUse: true,
      silent: true,
      target: 'user',
      notes: t('birthdayCardNotes'),
      cast: function(user, target) {
        var base;
        if (user === target) {
          if ((base = user.achievements).birthday == null) {
            base.birthday = 0;
          }
          user.achievements.birthday++;
        } else {
          _.each([user, target], function(t) {
            var base1;
            if ((base1 = t.achievements).birthday == null) {
              base1.birthday = 0;
            }
            return t.achievements.birthday++;
          });
        }
        if (!target.items.special.birthdayReceived) {
          target.items.special.birthdayReceived = [];
        }
        target.items.special.birthdayReceived.push(user.profile.name);
        target.flags.cardReceived = true;
        if (typeof target.markModified === "function") {
          target.markModified('items.special.birthdayReceived');
        }
        return user.stats.gp -= 10;
      }
    },
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
  },
  birthday: {
    key: 'birthday',
    messageOptions: 1,
    yearRound: true,
  },
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
  },
  Unicorn: {
    text: t('questEggUnicornText'),
    mountText: t('questEggUnicornMountText'),
    adjective: t('questEggUnicornAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.unicorn != null) > 0;
    })
  },
  Sabretooth: {
    text: t('questEggSabretoothText'),
    adjective: t('questEggSabretoothAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.sabretooth != null) > 0;
    })
  },
  Monkey: {
    text: t('questEggMonkeyText'),
    adjective: t('questEggMonkeyAdjective'),
    canBuy: (function(u) {
      return u.achievements.quests && (u.achievements.quests.monkey != null) > 0;
    })
  },
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
  'Phoenix-Base': 'phoenix',
  'Turkey-Gilded': 'gildedTurkey',
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
    'MantisShrimp-Base': t('mantisShrimp'),
    'Phoenix-Base': t('phoenix'),
  },
  mounts: {
    'Mammoth-Base': t('mammoth'),
    'MantisShrimp-Base': t('mantisShrimp'),
    'Phoenix-Base': t('phoenix'),
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
  },
  Peppermint: {
    value: 2,
    text: t('hatchingPotionPeppermint'),
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
    target: 'Base',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  Milk: {
    text: t('foodMilk'),
    target: 'White',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  Potatoe: {
    text: t('foodPotatoe'),
    target: 'Desert',
    article: 'a ',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  Strawberry: {
    text: t('foodStrawberry'),
    target: 'Red',
    article: 'a ',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  Chocolate: {
    text: t('foodChocolate'),
    target: 'Shade',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  Fish: {
    text: t('foodFish'),
    target: 'Skeleton',
    article: 'a ',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  RottenMeat: {
    text: t('foodRottenMeat'),
    target: 'Zombie',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  CottonCandyPink: {
    text: t('foodCottonCandyPink'),
    target: 'CottonCandyPink',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  CottonCandyBlue: {
    text: t('foodCottonCandyBlue'),
    target: 'CottonCandyBlue',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  Honey: {
    text: t('foodHoney'),
    target: 'Golden',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
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

api.userCanOwnQuestCategories = USER_CAN_OWN_QUEST_CATEGORIES;

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
      return true;
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
      return true;
    }),
    text: t('questEvilSanta2Text'),
    notes: t('questEvilSanta2Notes'),
    completion: t('questEvilSanta2Completion'),
    value: 4,
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
  },
  unicorn: {
    text: t('questUnicornText'),
    notes: t('questUnicornNotes'),
    completion: t('questUnicornCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questUnicornBoss'),
      hp: 600,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Unicorn',
          text: t('questUnicornDropUnicornEgg')
        }, {
          type: 'eggs',
          key: 'Unicorn',
          text: t('questUnicornDropUnicornEgg')
        }, {
          type: 'eggs',
          key: 'Unicorn',
          text: t('questUnicornDropUnicornEgg')
        }
      ],
      gp: 43,
      exp: 350,
      unlock: t('questUnicornUnlockText')
    }
  },
  sabretooth: {
    text: t('questSabretoothText'),
    notes: t('questSabretoothNotes'),
    completion: t('questSabretoothCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSabretoothBoss'),
      hp: 1000,
      str: 2
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Sabretooth',
          text: t('questSabretoothDropSabretoothEgg')
        }, {
          type: 'eggs',
          key: 'Sabretooth',
          text: t('questSabretoothDropSabretoothEgg')
        }, {
          type: 'eggs',
          key: 'Sabretooth',
          text: t('questSabretoothDropSabretoothEgg')
        }
      ],
      gp: 67,
      exp: 650,
      unlock: t('questSabretoothUnlockText')
    }
  },
  monkey: {
    text: t('questMonkeyText'),
    notes: t('questMonkeyNotes'),
    completion: t('questMonkeyCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questMonkeyBoss'),
      hp: 400,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Monkey',
          text: t('questMonkeyDropMonkeyEgg')
        }, {
          type: 'eggs',
          key: 'Monkey',
          text: t('questMonkeyDropMonkeyEgg')
        }, {
          type: 'eggs',
          key: 'Monkey',
          text: t('questMonkeyDropMonkeyEgg')
        }
      ],
      gp: 31,
      exp: 200,
      unlock: t('questMonkeyUnlockText')
    }
  },
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

api.appearances = appearances;

api.backgrounds = backgrounds;

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
