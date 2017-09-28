// This module is only used to attach middlewares to the express app
import errorHandler from './errorHandler';
import bodyParser from 'body-parser';
import notFoundHandler from './notFound';
import nconf from 'nconf';
import morgan from 'morgan';
import cookieSession from 'cookie-session';
import cors from './cors';
import staticMiddleware from './static';
import domainMiddleware from './domain';
import mongoose from 'mongoose';
import compression from 'compression';
// import favicon from 'serve-favicon';
import methodOverride from 'method-override';
import passport from 'passport';
// import path from 'path';
import maintenanceMode from './maintenanceMode';
import {
  forceSSL,
  forceHabitica,
} from './redirects';
import v1 from './v1';
import v2 from './v2';
import v3 from './v3';
import responseHandler from './response';
import {
  attachTranslateFunction,
} from './language';
import basicAuth from 'express-basic-auth';

const IS_PROD = nconf.get('IS_PROD');
const DISABLE_LOGGING = nconf.get('DISABLE_REQUEST_LOGGING') === 'true';
const ENABLE_HTTP_AUTH = nconf.get('SITE_HTTP_AUTH:ENABLED') === 'true';
// const PUBLIC_DIR = path.join(__dirname, '/../../client');

const SESSION_SECRET = nconf.get('SESSION_SECRET');
const TEN_YEARS = 1000 * 60 * 60 * 24 * 365 * 10;

module.exports = function attachMiddlewares (app, server) {
  app.set('view engine', 'jade');
  app.set('views', `${__dirname}/../../views`);

  app.use(domainMiddleware(server, mongoose));

  if (!IS_PROD && !DISABLE_LOGGING) app.use(morgan('dev'));

  // add res.respond and res.t
  app.use(responseHandler);
  app.use(attachTranslateFunction);

  app.use(compression());
  // app.use(favicon(`${PUBLIC_DIR}/favicon.ico`));

  app.use(maintenanceMode);

  app.use(cors);
  app.use(forceSSL);
  app.use(forceHabitica);

  app.use(bodyParser.urlencoded({
    extended: true, // Uses 'qs' library as old connect middleware
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  app.use(cookieSession({
    name: 'connect:sess', // Used to keep backward compatibility with Express 3 cookies
    secret: SESSION_SECRET,
    httpOnly: true, // so cookies are not accessible with browser JS
    // TODO what about https only (secure) ?
    maxAge: TEN_YEARS,
  }));

  // Initialize Passport! Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());

  // The site can require basic HTTP authentication to be accessed
  if (ENABLE_HTTP_AUTH) {
    const httpBasicAuthUsers = {};
    httpBasicAuthUsers[nconf.get('SITE_HTTP_AUTH:USERNAME')] = nconf.get('SITE_HTTP_AUTH:PASSWORD');

    app.use(basicAuth({
      users: httpBasicAuthUsers,
      challenge: true,
      realm: 'Habitica',
    }));
  }
  app.use('/api/v2', v2);
  app.use('/api/v1', v1);
  app.use(v3); // the main app, also setup top-level routes
  staticMiddleware(app);

  app.use(notFoundHandler);

  // Error handler middleware, define as the last one.
  // Used for v3 and v1, v2 will keep using its own error handler
  app.use(errorHandler);
};
