import {head as baseHead} from './sets/base';

import {head as healerHead} from './sets/healer';
import {head as rogueHead} from './sets/rogue';
import {head as warriorHead} from './sets/warrior';
import {head as wizardHead} from './sets/wizard';

import {head as armoireHead} from './sets/armoire';
import {head as mysteryHead} from './sets/mystery';
import {head as specialHead} from './sets/special';

let head = {
  base: baseHead,

  warrior: warriorHead,
  rogue: rogueHead,
  wizard: wizardHead,
  healer: healerHead,

  special: specialHead,
  mystery: mysteryHead,
  armoire: armoireHead,
};

module.exports = head;
