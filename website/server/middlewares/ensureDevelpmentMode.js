import nconf from 'nconf';
import {
  NotFound,
} from '../libs/errors';

export default function ensureDevelpmentMode (req, res, next) {
  if (!nconf.get('ENABLE_TIME_TRAVEL')) {
    next(new NotFound());
  } else {
    next();
  }
}
