import each from 'lodash/each';
import get from 'lodash/get';
import values from 'lodash/values';
import content from '../content/index';
import * as statHelpers from '../statHelpers';

function equipmentStatBonusComputed (stat, user) {
  let gear = content.gear.flat;
  let gearBonus = 0;
  let classBonus = 0;

  // toObject is required here due to lodash values not working well with mongoose doc objects.
  // if toObject doesn't exist, we're on the client side and can assume the object is already plain JSON
  // see http://stackoverflow.com/questions/25767334/underscore-js-keys-and-omit-not-working-as-expected
  let equipped = user.items.gear.equipped;
  let equippedKeys = values(!equipped.toObject ? equipped : equipped.toObject());

  each(equippedKeys, (equippedItem) => {
    let item = gear[equippedItem];

    if (item) {
      let equipmentStat = item[stat];
      let classBonusMultiplier = item.klass === user.stats.class ||
        item.specialClass === user.stats.class ? 0.5 : 0;
      gearBonus += equipmentStat;
      classBonus += equipmentStat * classBonusMultiplier;
    }
  });

  return {
    gearBonus,
    classBonus,
  };
}

module.exports = function statsComputed (user) {
  let statBreakdown = {
    gearBonus: {},
    classBonus: {},
    baseStat: {},
    buff: {},
    levelBonus: {},
  };
  each(['per', 'con', 'str', 'int'], (stat) => {
    let baseStat = get(user, 'stats')[stat];
    let buff = get(user, 'stats.buffs')[stat];
    let equipmentBonus = equipmentStatBonusComputed(stat, user);

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
};
