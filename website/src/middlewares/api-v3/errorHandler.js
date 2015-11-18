// The error handler middleware that handles all errors
// and respond to the client
import logger from '../../libs/api-v3/logger';
import {
  CustomError,
  BadRequest,
  InternalServerError,
} from '../../libs/api-v3/errors';

export default function errorHandler (err, req, res, next) {
  if (!err) return next();

  // Log the original error with some metadata
  let stack = err.stack || err.message || err;

  logger.error(stack, {
    originalUrl: req.originalUrl,
    headers: req.headers,
    body: req.body,
    fullError: err,
  });

  // In case of a CustomError class, use it's data
  // Otherwise try to identify the type of error (mongoose validation, mongodb unique, ...)
  // If we can't identify it, respond with a generic 500 error
  let responseErr = err instanceof CustomError ? err : null;

  // Handle errors created with 'http-errors' or similar that have a status/statusCode property
  if (err.statusCode && typeof err.statusCode === 'number') {
    responseErr = new CustomError();
    responseErr.httpCode = err.statusCode;
    responseErr.error = err.name;
    responseErr.message = err.message;
  }

  // Handle errors by express-validator
  if (Array.isArray(err) && err[0].param && err[0].msg) {
    responseErr = new BadRequest('Invalid request parameters.');
    responseErr.errors = err;
  }

  if (!responseErr || responseErr.httpCode >= 500) {
    // Try to identify the error...
    // ...
    // Otherwise create an InternalServerError and use it
    // we don't want to leak anything, just a generic error message
    // Use it also in case of identified errors but with httpCode === 500
    responseErr = new InternalServerError();
  }

  // TODO unless status >= 500 return data attached to errors
  return res
    .status(responseErr.httpCode)
    .json({
      error: responseErr.name,
      message: responseErr.message,
    });
}
