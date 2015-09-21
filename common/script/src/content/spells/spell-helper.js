import {each, defaults} from 'lodash';
import capitalize from 'lodash.capitalize';
import t from '../helpers/translator';

export function diminishingReturns(bonus, max, halfway=max/2) {
  return max * (bonus / (bonus + halfway));
};

export function calculateBonus(value, stat, crit=1, stat_scale=0.5) {
  return (value < 0 ? 1 : value + 1) + (stat * stat_scale * crit);
};

export function setSpellDefaults (className, spells) {
  let capitalClassName = capitalize(className);

  each(spells, (spell, key) => {
    let capitalSpellKey = capitalize(key);
    let spellDefaults = {
      text: t(`spell${capitalClassName}${capitalSpellKey}Text`),
      notes: t(`spell${capitalClassName}${capitalSpellKey}Notes`),
    };

    defaults(spell, spellDefaults);
  });
};
