import express from 'express';
import expressValidator from 'express-validator';
import analytics from './analytics';
import setupBody from './setupBody';
import routes from '../libs/routes';
import path from 'path';

const API_CONTROLLERS_PATH = path.join(__dirname, '/../controllers/api-v3/');
const TOP_LEVEL_CONTROLLERS_PATH = path.join(__dirname, '/../controllers/top-level/');

const v3app = express();

// re-set the view options because they are not inherited from the top level app
v3app.set('view engine', 'jade');
v3app.set('views', `${__dirname}/../../views`);

v3app.use(expressValidator());
v3app.use(analytics);
v3app.use(setupBody);

const topLevelRouter = express.Router(); // eslint-disable-line babel/new-cap

routes.walkControllers(topLevelRouter, TOP_LEVEL_CONTROLLERS_PATH);
v3app.use('/', topLevelRouter);

const v3Router = express.Router(); // eslint-disable-line babel/new-cap
routes.walkControllers(v3Router, API_CONTROLLERS_PATH);
v3app.use('/api/v3', v3Router);

module.exports = v3app;
