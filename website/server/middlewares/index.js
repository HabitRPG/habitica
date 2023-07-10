// This module is only used to attach middlewares to the express app
import bodyParser from 'body-parser';
import nconf from 'nconf';
import morgan from 'morgan';
import cookieSession from 'cookie-session';
import mongoose from 'mongoose';
import compression from 'compression';
import methodOverride from 'method-override';
import passport from 'passport';
import basicAuth from 'express-basic-auth';
import helmet from 'helmet';
import setupExpress from '../libs/setupExpress';
import errorHandler from './errorHandler';
import notFoundHandler from './notFound';
import cors from './cors';
import staticMiddleware from './static';
import domainMiddleware from './domain';
// import favicon from 'serve-favicon';
// import path from 'path';
import maintenanceMode from './maintenanceMode';
import {
  forceSSL,
  forceHabitica,
} from './redirects';
import ipBlocker from './ipBlocker';
import v1 from './v1';
import v2 from './v2';
import appRoutes from './appRoutes';
import responseHandler from './response';
import {
  attachTranslateFunction,
} from './language';

const IS_PROD = nconf.get('IS_PROD');
const DISABLE_LOGGING = nconf.get('DISABLE_REQUEST_LOGGING') === 'true';
const ENABLE_HTTP_AUTH = nconf.get('SITE_HTTP_AUTH_ENABLED') === 'true';
// const PUBLIC_DIR = path.join(__dirname, '/../../client');

const SESSION_SECRET = nconf.get('SESSION_SECRET');
const TEN_YEARS = 1000 * 60 * 60 * 24 * 365 * 10;

export default function attachMiddlewares (app, server) {
  setupExpress(app);

  app.use(domainMiddleware(server, mongoose));

  if (!IS_PROD && !DISABLE_LOGGING) app.use(morgan('dev'));

  // See https://helmetjs.github.io/ for the list of headers enabled by default
  app.use(helmet({
    // New middlewares added by default in Helmet 4 are disabled
    contentSecurityPolicy: false, // @TODO implement
    expectCt: false,
    permittedCrossDomainPolicies: false,
    referrerPolicy: false,
  }));

  // add res.respond and res.t
  app.use(responseHandler);
  app.use(attachTranslateFunction);

  app.use(compression());
  // app.use(favicon(`${PUBLIC_DIR}/favicon.ico`));

  app.use(maintenanceMode);

  app.use(ipBlocker);

  app.use(cors);
  app.use(forceSSL);
  app.use(forceHabitica);

  app.use(bodyParser.urlencoded({
    extended: true, // Uses 'qs' library as old connect middleware
    limit: '10mb',
  }));
  app.use(function bodyMiddleware (req, res, next) { // eslint-disable-line prefer-arrow-callback
    if (req.path === '/stripe/webhooks') {
      // Do not parse the body for `/stripe/webhooks`
      // See https://stripe.com/docs/webhooks/signatures#verify-official-libraries
      bodyParser.raw({ type: 'application/json' })(req, res, next);
    } else {
      bodyParser.json({ limit: '10mb' })(req, res, next);
    }
  });

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
    const usernames = nconf.get('SITE_HTTP_AUTH_USERNAMES').split(',');
    const passwords = nconf.get('SITE_HTTP_AUTH_PASSWORDS').split(',');

    usernames.forEach((user, index) => {
      httpBasicAuthUsers[user] = passwords[index];
    });

    app.use(basicAuth({
      users: httpBasicAuthUsers,
      challenge: true,
      realm: 'Habitica',
    }));
  }
  app.use('/api/v2', v2);
  app.use('/api/v1', v1);
  app.use(appRoutes); // the main app, also setup top-level routes
  staticMiddleware(app);

  app.use(notFoundHandler);

  // Error handler middleware, define as the last one.
  app.use(errorHandler);
}
