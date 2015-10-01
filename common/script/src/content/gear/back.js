import {translator as t} from '../helpers';
import events from '../events';

import {back as baseBack} from './sets/base';

import {back as mysteryBack} from './sets/mystery';
import {back as specialBack} from './sets/special';

let back = {
  base: baseBack,
  mystery: mysteryBack,
  special: specialBack,
};

export default back;

