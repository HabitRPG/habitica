import {headAccessory as baseHeadAccessory} from './sets/base';

import {headAccessory as specialHeadAccessory} from './sets/special';
import {headAccessory as mysteryHeadAccessory} from './sets/mystery';
import {headAccessory as armoireHeadAccessory} from './sets/armoire';

let headAccessory = {
  base: baseHeadAccessory,
  special: specialHeadAccessory,
  mystery: mysteryHeadAccessory,
  armoire: armoireHeadAccessory,
};

module.exports = headAccessory;

