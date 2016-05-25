// API v1 middlewares and routes
// DEPRECATED AND INACTIVE

import express from 'express';
import nconf from 'nconf';
import {
  NotFound,
} from '../../libs/api-v3/errors';

const router = express.Router(); // eslint-disable-line babel/new-cap

const BASE_URL = nconf.get('BASE_URL');

router.all('*', function deprecatedV1 (req, res, next) {
  let error = new NotFound(`API v1 is no longer supported, please use API v3 instead (${BASE_URL}/static/api).`);
  return next(error);
});

module.exports = router;
