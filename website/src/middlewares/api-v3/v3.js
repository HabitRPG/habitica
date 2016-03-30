import express from 'express';
import expressValidator from 'express-validator';
import getUserLanguage from './getUserLanguage';
import responseHandler from './response';
import analytics from './analytics';
import setupBody from './setupBody';
import routes from '../../libs/api-v3/routes';
import path from 'path';

const v3app = express();

// re-set the view options because they are not inherited from the top level app
v3app.set('view engine', 'jade');
v3app.set('views', `${__dirname}/../../../views`);

v3app.use(expressValidator());
v3app.use(analytics);
v3app.use(setupBody);
v3app.use(responseHandler);
v3app.use(getUserLanguage); // TODO move to after auth for authenticated routes

const CONTROLLERS_PATH = path.join(__dirname, '/../../controllers/api-v3/');
const router = express.Router(); // eslint-disable-line babel/new-cap
routes.walkControllers(router, CONTROLLERS_PATH);
v3app.use(router);

module.exports = v3app;
