// The error handler middleware that handles all errors
// and respond to the client
import logger from '../../libs/api-v3/logger';
import {
  CustomError,
  InternalServerError,
} from '../../libs/api-v3/errors';

export default function errorHandler (err, req, res, next) {
  // Log the original error with some metadata
  let stack = err.stack || err.message || err;
  logger.error(stack, {
    originalUrl: req.originalUrl,
    headers: req.headers,
    body: req.body,
  });

  // In case of a CustomError class, use it's data
  // Otherwise try to identify the type of error (mongoose validation, mongodb unique, ...)
  // If we can't identify it, respond with a generic 500 error

  let responseErr = err instanceof CustomError ? err : null;

  if (!responseErr) {
    // Try to identify the error...
    // ...
    // Otherwise create an InternalServerError and use it
    // we don't want to leak anything, just a generic error message
    responseErr = new InternalServerError();
  }

  return res
    .status(responseErr.httpCode)
    .json({
      error: responseErr.name,
      message: responseErr.message
    });
};
