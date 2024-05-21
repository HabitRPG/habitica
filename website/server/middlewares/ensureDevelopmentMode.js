import nconf from 'nconf';
import {
  NotFound,
} from '../libs/errors';

export default function ensureDevelopmentMode (req, res, next) {
  if (nconf.get('DEBUG_ENABLED') && nconf.get('BASE_URL') !== 'https://habitica.com') {
    next();
  } else {
    next(new NotFound());
  }
}
