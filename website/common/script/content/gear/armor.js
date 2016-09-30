import {armor as baseArmor} from './sets/base';

import {armor as warriorArmor} from './sets/warrior';
import {armor as rogueArmor} from './sets/rogue';
import {armor as healerArmor} from './sets/healer';
import {armor as wizardArmor} from './sets/wizard';

import {armor as specialArmor} from './sets/special';
import {armor as mysteryArmor} from './sets/mystery';
import {armor as armoireArmor} from './sets/armoire';

let armor = {
  base: baseArmor,

  warrior: warriorArmor,
  rogue: rogueArmor,
  wizard: wizardArmor,
  healer: healerArmor,

  special: specialArmor,
  mystery: mysteryArmor,
  armoire: armoireArmor,
};

module.exports = armor;
