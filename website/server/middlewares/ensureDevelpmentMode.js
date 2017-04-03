import nconf from 'nconf';
import {
  NotFound,
} from '../libs/errors';

module.exports = function ensureDevelpmentMode (req, res, next) {
  if (nconf.get('IS_PROD')) {
    next(new NotFound());
  } else {
    next();
  }
};
