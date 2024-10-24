import { eyewear as baseEyewear } from './sets/base';

import armoire from './sets/armoire';
import { eyewear as mysteryEyewear } from './sets/mystery';
import { eyewear as specialEyewear } from './sets/special';

const eyewear = {
  base: baseEyewear,
  special: specialEyewear,
  mystery: mysteryEyewear,
  get armoire () {
    return armoire.eyewear;
  },
};

export default eyewear;
