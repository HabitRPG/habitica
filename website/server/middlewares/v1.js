// API v1 middlewares and routes
// DEPRECATED AND INACTIVE

import express from 'express';
import {
  NotFound,
} from '../libs/errors';

const router = express.Router(); // eslint-disable-line new-cap

router.all('*', (req, res, next) => {
  const error = new NotFound('API v1 is no longer supported, please use API v3 instead (https://apidoc.habitica.com).');
  return next(error);
});

export default router;
