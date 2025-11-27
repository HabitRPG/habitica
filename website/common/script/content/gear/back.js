import { back as baseBack } from './sets/base';

import { back as mysteryBack } from './sets/mystery';
import { back as specialBack } from './sets/special';
import armoire from './sets/armoire';

const back = {
  base: baseBack,
  mystery: mysteryBack,
  special: specialBack,
  get armoire () {
    return armoire.back;
  },
};

export default back;
