import {
  translator as t,
  diminishingReturns,
  calculateBonus,
  setSpellDefaults
} from '../helpers';

import {each} from 'lodash';

let heal = {
  mana: 15,
  lvl: 11,
  target: 'self',
  cast: (user, target) => {
    user.stats.hp += (user._statsComputed.con + user._statsComputed.int + 5) * .075;
    if (user.stats.hp > 50) {
      return user.stats.hp = 50;
    }
  }
};

let brightness = {
  mana: 15,
  lvl: 12,
  target: 'self',
  cast: (user, target) => {
    return each(user.tasks, (target) => {
      if (target.type === 'reward') {
        return;
      }
      return target.value += 4 * (user._statsComputed.int / (user._statsComputed.int + 40));
    });
  }
};

let protectAura = {
  mana: 30,
  lvl: 13,
  target: 'party',
  cast: (user, target) => {
    return each(target, (member) => {
      var base, bonus;
      bonus = user._statsComputed.con - user.stats.buffs.con;
      if ((base = member.stats.buffs).con == null) {
        base.con = 0;
      }
      return member.stats.buffs.con += Math.ceil(diminishingReturns(bonus, 200, 200));
    });
  }
};

let healAll = {
  mana: 25,
  lvl: 14,
  text: t('spellHealerHealAllText'),
  notes: t('spellHealerHealAllNotes'),
  target: 'party',
  cast: (user, target) => {
    return each(target, (member) => {
      member.stats.hp += (user._statsComputed.con + user._statsComputed.int + 5) * .04;
      if (member.stats.hp > 50) {
        return member.stats.hp = 50;
      }
    });
  }
};

let healer = {
  heal: heal,
  brightness: brightness,
  protectAura: protectAura,
  // @TODO APIv3 - correct to healAll
  heallAll: healAll,
};

setSpellDefaults('healer', healer);

export default healer;
