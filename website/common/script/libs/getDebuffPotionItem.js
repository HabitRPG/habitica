module.exports = function getDebuffPotionItem (user) {
  const items = [];
  const userBuffs = user.stats.buffs;

  if (user) {
    // Add season rewards if user is affected
    const seasonalSkills = {
      snowball: 'salt',
      spookySparkles: 'opaquePotion',
      shinySeed: 'petalFreePotion',
      seafoam: 'sand',
    };

    for (let key in seasonalSkills) {
      if (userBuffs[key]) {
        let debuff = seasonalSkills[key];
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
