// This module is only used to attach middlewares to the express app
import expressValidator from 'express-validator';
import getUserLanguage from './getUserLanguage';
import analytics from './analytics';
import errorHandler from './errorHandler';
import bodyParser from 'body-parser';
import routes from '../../libs/api-v3/setupRoutes';
import notFoundHandler from './notFound';
import nconf from 'nconf';
import morgan from 'morgan';
import responseHandler from './response';
import setupBody from './setupBody';
import cookieSession from 'cookie-session';

const IS_PROD = nconf.get('IS_PROD');
const DISABLE_LOGGING = nconf.get('DISABLE_REQUEST_LOGGING');

const SESSION_SECRET = nconf.get('SESSION_SECRET');
const TWO_WEEKS = 1000 * 60 * 60 * 24 * 14;

module.exports = function attachMiddlewares (app) {
  if (!IS_PROD && !DISABLE_LOGGING) app.use(morgan('dev'));

  // TODO handle errors
  app.use(bodyParser.urlencoded({
    extended: true, // Uses 'qs' library as old connect middleware
  }));
  app.use(bodyParser.json());
  app.use(cookieSession({
    name: 'connect:sess', // Used to keep backward compatibility with Express 3 cookies
    secret: SESSION_SECRET,
    httpOnly: false, // TODO this should be true for security, what about https only?
    maxAge: TWO_WEEKS,
  }));
  app.use(expressValidator());
  app.use(analytics);
  app.use(setupBody);
  app.use(responseHandler);
  app.use(getUserLanguage);
  app.set('view engine', 'jade');
  app.set('views', `${__dirname}/../../../views`);

  app.use('/api/v3', routes);
  app.use(notFoundHandler);

  // Error handler middleware, define as the last one
  app.use(errorHandler);
};
