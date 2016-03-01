import {
  translator as t,
  diminishingReturns,
  calculateBonus,
  setSpellDefaults
} from '../helpers';
import {each} from 'lodash';

let smash= {
  mana: 10,
  lvl: 11,
  target: 'task',
  cast: (user, target) => {
    var base, bonus;
    bonus = user._statsComputed.str * user.fns.crit('con');
    target.value += diminishingReturns(bonus, 2.5, 35);
    if ((base = user.party.quest.progress).up == null) {
      base.up = 0;
    }
    return user.party.quest.progress.up += diminishingReturns(bonus, 55, 70);
  }
};

let defensiveStance = {
  mana: 25,
  lvl: 12,
  target: 'self',
  cast: (user, target) => {
    var base, bonus;
    bonus = user._statsComputed.con - user.stats.buffs.con;
    if ((base = user.stats.buffs).con == null) {
      base.con = 0;
    }
    return user.stats.buffs.con += Math.ceil(diminishingReturns(bonus, 40, 200));
  }
};

let valorousPresence = {
  mana: 20,
  lvl: 13,
  target: 'party',
  cast: (user, target) => {
    return each(target, (member) => {
      var base, bonus;
      bonus = user._statsComputed.str - user.stats.buffs.str;
      if ((base = member.stats.buffs).str == null) {
        base.str = 0;
      }
      return member.stats.buffs.str += Math.ceil(diminishingReturns(bonus, 20, 200));
    });
  }
};

let intimidate = {
  mana: 15,
  lvl: 14,
  target: 'party',
  cast: (user, target) => {
    return each(target, (member) => {
      var base, bonus;
      bonus = user._statsComputed.con - user.stats.buffs.con;
      if ((base = member.stats.buffs).con == null) {
        base.con = 0;
      }
      return member.stats.buffs.con += Math.ceil(diminishingReturns(bonus, 24, 200));
    });
  }
};

let warrior = {
  smash: smash,
  defensiveStance: defensiveStance,
  valorousPresence: valorousPresence,
  intimidate: intimidate,
};

setSpellDefaults('warrior', warrior);

export default warrior;
