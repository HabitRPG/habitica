import nconf from 'nconf';
import {
  NotFound,
} from '../../libs/api-v3/errors';

module.exports = function ensureDevelpmentMode (req, res, next) {
  if (nconf.get('IS_PROD')) {
    next(new NotFound());
  } else {
    next();
  }
};
