import {eyewear as baseEyewear} from './sets/base';

import {eyewear as armoireEyewear} from './sets/armoire';
import {eyewear as mysteryEyewear} from './sets/mystery';
import {eyewear as specialEyewear} from './sets/special';

let eyewear = {
  base: baseEyewear,
  special: specialEyewear,
  mystery: mysteryEyewear,
  armoire: armoireEyewear,
};

module.exports = eyewear;
