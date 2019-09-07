import spells from '../content/spells';


module.exports = function getDebuffSpellItems (user) {
  const items = [];
  const userBuffs = user.stats.buffs;

  // Add season rewards if user is affected
  // @TODO: Add buff conditional
  const seasonalSkills = {
    snowball: 'salt',
    spookySparkles: 'opaquePotion',
    shinySeed: 'petalFreePotion',
    seafoam: 'sand',
  };

  for (let key in seasonalSkills) {
    if (userBuffs[key]) {
      let debuff = seasonalSkills[key];
      let item = Object.assign({}, spells.special[debuff]);
      item.text = item.text();
      item.notes = item.notes();
      item.class = `shop_${key}`;
      items.push(item);
    }
  }


  return items;
};
