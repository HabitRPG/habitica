import each from 'lodash/each';
import get from 'lodash/get';
import values from 'lodash/values';
import content from '../content/index'; // eslint-disable-line import/no-cycle
import * as statHelpers from '../statHelpers';

function equipmentStatBonusComputed (stat, user) {
  const gear = content.gear.flat;
  let gearBonus = 0;
  let classBonus = 0;

  // toObject is required here due to lodash values not working well with mongoose doc objects.
  // if toObject doesn't exist, we can assume the object is already plain JSON
  // see https://stackoverflow.com/questions/25767334/underscore-js-keys-and-omit-not-working-as-expected
  const { equipped } = user.items.gear;
  const equippedKeys = values(!equipped.toObject ? equipped : equipped.toObject());

  each(equippedKeys, equippedItem => {
    const item = gear[equippedItem];

    if (item) {
      const equipmentStat = item[stat];
      const classBonusMultiplier = item.klass === user.stats.class
        || item.specialClass === user.stats.class ? 0.5 : 0;
      gearBonus += equipmentStat;
      classBonus += equipmentStat * classBonusMultiplier;
    }
  });

  return {
    gearBonus,
    classBonus,
  };
}

export default function statsComputed (user) {
  const statBreakdown = {
    gearBonus: {},
    classBonus: {},
    baseStat: {},
    buff: {},
    levelBonus: {},
  };
  each(['per', 'con', 'str', 'int'], stat => {
    const baseStat = get(user, 'stats')[stat];
    const buff = get(user, 'stats.buffs')[stat];
    const equipmentBonus = equipmentStatBonusComputed(stat, user);

    statBreakdown[stat] = equipmentBonus.gearBonus + equipmentBonus.classBonus + baseStat + buff;
    statBreakdown[stat] += Math.floor(statHelpers.capByLevel(user.stats.lvl) / 2);

    statBreakdown.levelBonus[stat] = Math.floor(statHelpers.capByLevel(user.stats.lvl) / 2);
    statBreakdown.gearBonus[stat] = equipmentBonus.gearBonus;
    statBreakdown.classBonus[stat] = equipmentBonus.classBonus;
    statBreakdown.baseStat[stat] = baseStat;
    statBreakdown.buff[stat] = buff;
  });

  statBreakdown.maxMP = statBreakdown.int * 2 + 30;

  return statBreakdown;
}
