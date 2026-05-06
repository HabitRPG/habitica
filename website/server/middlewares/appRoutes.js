import nconf from 'nconf';
import express from 'express';
import expressValidator from 'express-validator';
import path from 'path';
import setupBody from './setupBody';
import setupRateLimiter from './rateLimiter';
import setupExpress from '../libs/setupExpress';
import * as routes from '../libs/routes';

const API_V3_CONTROLLERS_PATH = path.join(__dirname, '/../controllers/api-v3/');
const API_V4_CONTROLLERS_PATH = path.join(__dirname, '/../controllers/api-v4/');
const TOP_LEVEL_CONTROLLERS_PATH = path.join(__dirname, '/../controllers/top-level/');

const RATE_LIMITER_V4_POINTS = nconf.get('RATE_LIMITER_V4_POINTS') || 100;
const RATE_LIMITER_V4_REGISTRATION_COST = nconf.get('RATE_LIMITER_V4_REGISTRATION_COST') || 10;

const app = express();

// re-set the view options because they are not inherited from the top level app
setupExpress(app);

app.use(expressValidator());
app.use(setupBody);

const topLevelRouter = express.Router(); // eslint-disable-line new-cap

routes.walkControllers(topLevelRouter, TOP_LEVEL_CONTROLLERS_PATH);
app.use('/', topLevelRouter);

const v3Router = express.Router(); // eslint-disable-line new-cap
routes.walkControllers(v3Router, API_V3_CONTROLLERS_PATH);
const v3RateLimiter = setupRateLimiter({
  keyPrefix: 'api-v3',
});
app.use('/api/v3', v3RateLimiter, v3Router);

// API v4 proxies API v3 routes by default.
// It can also disable or override v3 routes

// A list of v3 routes in the format METHOD-URL to skip
const v4RouterOverrides = [
  // 'GET-/status', Example to override the GET /status api call
  'POST-/user/auth/local/register',
  'GET-/news',
  'GET-/user',
  'PUT-/user',
  'POST-/user/class/cast/:spellId',
  'POST-/user/rebirth',
  'POST-/user/reset',
  'POST-/user/reroll',
  'DELETE-/user/messages/:id',
  'DELETE-/user/messages',
  'POST-/coupons/enter/:code',
];

const v4Router = express.Router(); // eslint-disable-line new-cap
routes.walkControllers(v4Router, API_V3_CONTROLLERS_PATH, v4RouterOverrides);
routes.walkControllers(v4Router, API_V4_CONTROLLERS_PATH);
const v4RateLimiter = setupRateLimiter({
  keyPrefix: 'api-v4',
  points: RATE_LIMITER_V4_POINTS,
  registrationCost: RATE_LIMITER_V4_REGISTRATION_COST,
});
app.use('/api/v4', v4RateLimiter, v4Router);

export default app;
