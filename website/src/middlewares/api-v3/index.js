// This module is only used to attach middlewares to the express app

import errorHandler from './errorHandler';

export default function attachMiddlewares (app) {
  // Error handler middleware, define as the last one
  app.use(errorHandler);
}
