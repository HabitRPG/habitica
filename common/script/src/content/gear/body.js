import {translator as t} from '../helpers';
import events from '../events';

import {back as baseBody} from './sets/base';

import {back as specialBody} from './sets/special';

let body = {
  base: baseBody,
  special: specialBody,
};

export default body;

