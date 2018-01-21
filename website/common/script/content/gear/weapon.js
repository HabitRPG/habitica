import t from '../translation';

import {weapon as baseWeapon} from './sets/base';

import {weapon as healerWeapon} from './sets/healer';
import {weapon as rogueWeapon} from './sets/rogue';
import {weapon as warriorWeapon} from './sets/warrior';
import {weapon as wizardWeapon} from './sets/wizard';

import {weapon as armoireWeapon} from './sets/armoire';
import {weapon as mysteryWeapon} from './sets/mystery';
import {weapon as specialWeapon} from './sets/special';

let weapon = {
  base: baseWeapon,

  warrior: warriorWeapon,
  rogue: rogueWeapon,
  wizard: wizardWeapon,
  healer: healerWeapon,

  special: specialWeapon,
  mystery: mysteryWeapon,
  armoire: armoireWeapon,
};

// Add Two Handed message to all weapons
for (let key in weapon) {
  const set = weapon[key];
  for (let weaponKey in set) {
    const item = set[weaponKey];
    item.notes = (lang) => {
      const twoHandedText = item.twoHanded ? t('twoHandedItem')(lang) : '';
      return `${t('armorHealer2Notes', { con: 9 })(lang)} ${twoHandedText}`;
    };
  }
}

module.exports = weapon;
