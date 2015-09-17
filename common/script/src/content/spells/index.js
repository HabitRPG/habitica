'use strict';

var t = require('../helpers/translator.js');

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

function diminishingReturns(bonus, max, halfway) {
  if (halfway == null) {
    halfway = max / 2;
  }
  return max * (bonus / (bonus + halfway));
};

function calculateBonus(value, stat, crit, stat_scale) {
  if (crit == null) {
    crit = 1;
  }
  if (stat_scale == null) {
    stat_scale = 0.5;
  }
  return (value < 0 ? 1 : value + 1) + (stat * stat_scale * crit);
};

var spells = {
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

module.exports = spells;
