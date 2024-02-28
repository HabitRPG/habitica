import nconf from 'nconf';
import {
  NotFound,
} from '../libs/errors';

export default function ensureTimeTravelMode (req, res, next) {
  if (nconf.get('ENABLE_TIME_TRAVEL')) {
    next();
  } else {
    next(new NotFound());
  }
}
