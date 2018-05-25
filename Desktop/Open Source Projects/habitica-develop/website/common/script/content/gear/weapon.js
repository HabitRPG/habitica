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

module.exports = weapon;
