// This module is only used to attach middlewares to the express app

import errorHandler from './errorHandler';
import bodyParser from 'body-parser';

export default function attachMiddlewares (app) {

  // Parse query parameters and json bodies
  // TODO handle errors
  app.use(bodyParser.urlencoded({
    extended: true, // Uses 'qs' library as old connect middleware
  }));
  app.use(bodyParser.json());

  // Error handler middleware, define as the last one
  app.use(errorHandler);
}
