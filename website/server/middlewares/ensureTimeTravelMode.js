import nconf from 'nconf';
import {
  NotFound,
} from '../libs/errors';

export default function ensureTimeTravelMode (req, res, next) {
  if (nconf.get('TIME_TRAVEL_ENABLED') && nconf.get('BASE_URL') !== 'https://habitica.com') {
    next();
  } else {
    next(new NotFound());
  }
}
