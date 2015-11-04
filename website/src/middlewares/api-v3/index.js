'use strict';

// This module is only used to attach middlewares to the express app

let errorHandler = require('./errorHandler');

module.exports = function attachMiddlewares (app) {
  // Error handler middleware, define as the last one
  app.use(errorHandler);
};