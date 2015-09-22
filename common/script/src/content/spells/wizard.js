import {
  translator as t,
  diminishingReturns,
  calculateBonus,
  setSpellDefaults
} from '../helpers';
import {each} from 'lodash';

let fireball = {
  mana: 10,
  lvl: 11,
  target: 'task',
  cast: (user, target) => {
    let base;

    let bonus = user._statsComputed.int * user.fns.crit('per');
    bonus *= Math.ceil((target.value < 0 ? 1 : target.value + 1) * .075);

    user.stats.exp += diminishingReturns(bonus, 75);

    if ((base = user.party.quest.progress).up == null) {
      base.up = 0;
    }
    user.party.quest.progress.up += Math.ceil(user._statsComputed.int * .1);
    let req = {
      language: user.preferences.language
    };
    return user.fns.updateStats(user.stats, req);
  }
};

let mpheal = {
  text: t('spellWizardMPHealText'),
  mana: 30,
  lvl: 12,
  target: 'party',
  notes: t('spellWizardMPHealNotes'),
  cast: (user, target) => {
    return each(target, (member) => {
      let bonus = user._statsComputed.int;
      if (user._id !== member._id) {
        return member.stats.mp += Math.ceil(diminishingReturns(bonus, 25, 125));
      }
    });
  }
};

let earth = {
  mana: 35,
  lvl: 13,
  target: 'party',
  cast: (user, target) => {
    return each(target, (member) => {
      var base, bonus;
      bonus = user._statsComputed.int - user.stats.buffs.int;
      if ((base = member.stats.buffs).int == null) {
        base.int = 0;
      }
      return member.stats.buffs.int += Math.ceil(diminishingReturns(bonus, 30, 200));
    });
  }
};

let frost = {
  mana: 40,
  lvl: 14,
  target: 'self',
  cast: (user, target) => {
    return user.stats.buffs.streaks = true;
  }
};

let wizard = {
  fireball: fireball,
  mpheal: mpheal,
  earth: earth,
  frost: frost,
};

setSpellDefaults('wizard', wizard);

export default wizard;
