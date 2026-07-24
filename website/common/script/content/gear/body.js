import { body as baseBody } from './sets/base';

import { body as mysteryBody } from './sets/mystery';
import { body as specialBody } from './sets/special';
import armoire from './sets/armoire';

const body = {
  base: baseBody,
  mystery: mysteryBody,
  special: specialBody,
  get armoire () {
    return armoire.body;
  },
};

export default body;
