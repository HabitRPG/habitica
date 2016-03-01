import {
  translator as t,
  diminishingReturns,
  calculateBonus,
  setSpellDefaults
} from '../helpers';
import {each} from 'lodash';

let pickPocket = {
  mana: 10,
  lvl: 11,
  target: 'task',
  cast: (user, target) => {
    var bonus;
    bonus = calculateBonus(target.value, user._statsComputed.per);
    return user.stats.gp += diminishingReturns(bonus, 25, 75);
  }
};

let backStab = {
  mana: 15,
  lvl: 12,
  target: 'task',
  cast: (user, target) => {
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
};

let toolsOfTrade = {
  mana: 25,
  lvl: 13,
  target: 'party',
  cast: (user, target) => {
    return each(target, (member) => {
      var base, bonus;
      bonus = user._statsComputed.per - user.stats.buffs.per;
      if ((base = member.stats.buffs).per == null) {
        base.per = 0;
      }
      return member.stats.buffs.per += Math.ceil(diminishingReturns(bonus, 100, 50));
    });
  }
};

let stealth = {
  mana: 45,
  lvl: 14,
  target: 'self',
  cast: (user, target) => {
    var base;
    if ((base = user.stats.buffs).stealth == null) {
      base.stealth = 0;
    }
    return user.stats.buffs.stealth += Math.ceil(diminishingReturns(user._statsComputed.per, user.dailys.length * 0.64, 55));
  }
};

let rogue = {
  pickPocket: pickPocket,
  backStab: backStab,
  toolsOfTrade: toolsOfTrade,
  stealth: stealth,
};

setSpellDefaults('rogue', rogue);

export default rogue;
