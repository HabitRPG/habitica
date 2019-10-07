import { TRANSFORMATION_DEBUFFS_LIST } from '../constants';

module.exports = function getDebuffPotionItems (user) {
  const items = [];
  const userBuffs = user.stats.buffs;

  if (user) {
    for (let key in TRANSFORMATION_DEBUFFS_LIST) {
      if (userBuffs[key]) {
        let debuff = TRANSFORMATION_DEBUFFS_LIST[key];
        const item = {
          path: `spells.special.${debuff}`,
          type: 'debuffPotion',
        };
        items.push(item);
      }
    }


    return items;
  }
};
