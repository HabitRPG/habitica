import { headAccessory as baseHeadAccessory } from './sets/base';

import { headAccessory as specialHeadAccessory } from './sets/special';
import { headAccessory as mysteryHeadAccessory } from './sets/mystery';
import armoire from './sets/armoire';

const headAccessory = {
  base: baseHeadAccessory,
  special: specialHeadAccessory,
  mystery: mysteryHeadAccessory,
  get armoire () {
    return armoire.headAccessory;
  },
};

export default headAccessory;
