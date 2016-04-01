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
import favicon from 'serve-favicon';
import methodOverride from 'method-override';
import passport from 'passport';
import path from 'path';
import express from 'express';
import routes from '../../libs/api-v3/routes';
import {
  forceSSL,
  forceHabitica,
} from './redirects';
import v1 from './v1';
import v2 from './v2';
import v3 from './v3';
import staticPagesController from '../../controllers/pages';

const IS_PROD = nconf.get('IS_PROD');
const DISABLE_LOGGING = nconf.get('DISABLE_REQUEST_LOGGING');
const PUBLIC_DIR = path.join(__dirname, '/../../../public');

const SESSION_SECRET = nconf.get('SESSION_SECRET');
const TWO_WEEKS = 1000 * 60 * 60 * 24 * 14;

module.exports = function attachMiddlewares (app, server) {
  app.use(domainMiddleware(server, mongoose));

  if (!IS_PROD && !DISABLE_LOGGING) app.use(morgan('dev'));

  app.use(compression());
  app.use(favicon(`${PUBLIC_DIR}/favicon.ico`));

  app.use(cors);
  app.use(forceSSL);
  app.use(forceHabitica);

  // TODO if we don't manage to move the client off $resource the limit for bodyParser.json must be increased to 1mb from 100kb (default)
  app.use(bodyParser.urlencoded({
    extended: true, // Uses 'qs' library as old connect middleware
  }));
  app.use(bodyParser.json());
  app.use(methodOverride()); // TODO still needed in 2016?

  app.use(cookieSession({
    name: 'connect:sess', // Used to keep backward compatibility with Express 3 cookies
    secret: SESSION_SECRET,
    httpOnly: false, // TODO this should be true for security, what about https only?
    maxAge: TWO_WEEKS,
  }));

  // Initialize Passport! Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());

  const staticPagesRouter = express.Router(); // eslint-disable-line babel/new-cap
  routes.readController(staticPagesRouter, staticPagesController);
  app.use('/', staticPagesRouter);

  app.use('/api/v3', v3);
  app.use('/api/v2', v2);
  app.use('/api/v1', v1);
  staticMiddleware(app);

  app.use(notFoundHandler);

  // Error handler middleware, define as the last one.
  // Used for v3 and v1, v2 will keep using its own error handler
  app.use(errorHandler);
};
