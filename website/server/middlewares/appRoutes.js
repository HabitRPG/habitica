import express from 'express';
import expressValidator from 'express-validator';
import analytics from './analytics';
import setupBody from './setupBody';
import routes from '../libs/routes';
import path from 'path';

const API_V3_CONTROLLERS_PATH = path.join(__dirname, '/../controllers/api-v3/');
const API_V4_CONTROLLERS_PATH = path.join(__dirname, '/../controllers/api-v4/');
const TOP_LEVEL_CONTROLLERS_PATH = path.join(__dirname, '/../controllers/top-level/');

const app = express();

// re-set the view options because they are not inherited from the top level app
app.set('view engine', 'pug');
app.set('views', `${__dirname}/../../views`);

app.use(expressValidator());
app.use(analytics);
app.use(setupBody);

const topLevelRouter = express.Router(); // eslint-disable-line new-cap

routes.walkControllers(topLevelRouter, TOP_LEVEL_CONTROLLERS_PATH);
app.use('/', topLevelRouter);

const v3Router = express.Router(); // eslint-disable-line new-cap
routes.walkControllers(v3Router, API_V3_CONTROLLERS_PATH);
app.use('/api/v3', v3Router);

// API v4 proxies API v3 routes by default.
// It can also disable or override v3 routes

// A list of v3 routes in the format METHOD-URL to skip
const v4RouterOverrides = [
  // 'GET-/status', Example to override the GET /status api call
  'POST-/user/auth/local/register',
  'GET-/user',
  'PUT-/user',
  'POST-/user/class/cast/:spellId',
  'POST-/user/rebirth',
  'POST-/user/reset',
  'POST-/user/reroll',
  'DELETE-/user/messages/:id',
  'DELETE-/user/messages',
  'POST-/coupons/enter/:code',
  'GET-/inbox/messages',
];

const v4Router = express.Router(); // eslint-disable-line new-cap
routes.walkControllers(v4Router, API_V3_CONTROLLERS_PATH, v4RouterOverrides);
routes.walkControllers(v4Router, API_V4_CONTROLLERS_PATH);
app.use('/api/v4', v4Router);

module.exports = app;
