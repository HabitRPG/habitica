// API v2 middlewares and routes
// DEPRECATED AND INACTIVE

import express from 'express';
import nconf from 'nconf';
import {
  NotFound,
} from '../libs/errors';

const router = express.Router(); // eslint-disable-line new-cap

const BASE_URL = nconf.get('BASE_URL');

router.all('*', function deprecatedV2 (req, res, next) {
  let error = new NotFound(`API v2 is no longer supported, please use API v3 instead (${BASE_URL}/apidoc).`);
  return next(error);
});

module.exports = router;
