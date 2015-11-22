// This module is only used to attach middlewares to the express app
import expressValidator from 'express-validator';
import getUserLanguage from './getUserLanguage';
import analytics from './analytics';
import errorHandler from './errorHandler';
import bodyParser from 'body-parser';
import routes from '../../libs/api-v3/setupRoutes';
import * as customExpressValidators from '../../libs/api-v3/customExpressValidators';
import notFoundHandler from './notFound';
import nconf from 'nconf';
import morgan from 'morgan';

const IS_PROD = nconf.get('IS_PROD');
const DISABLE_LOGGING = nconf.get('DISABLE_REQUEST_LOGGING');

export default function attachMiddlewares (app) {
  if (!IS_PROD && !DISABLE_LOGGING) app.use(morgan('dev'));

  // TODO handle errors
  app.use(bodyParser.urlencoded({
    extended: true, // Uses 'qs' library as old connect middleware
  }));
  app.use(bodyParser.json());
  app.use(expressValidator({
    customValidators: customExpressValidators,
  }));
  app.use(analytics);
  app.use(getUserLanguage);

  app.use('/api/v3', routes);
  app.use(notFoundHandler);

  // Error handler middleware, define as the last one
  app.use(errorHandler);
}
