import {translator as t} from '../helpers';
import events from '../events';

import {body as baseBody} from './sets/base';

import {body as specialBody} from './sets/special';

let body = {
  base: baseBody,
  special: specialBody,
};

export default body;

