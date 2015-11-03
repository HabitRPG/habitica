'use strict';

// Base class for custom application errors
// It extends Error and capture the stack trace
class CustomError extends Error {
  constructor() {
    super();
    Error.captureStackTrace(this, this.constructor);
  }
}

// NotAuthorized error with a 401 http error code
// used when a request is not authorized
class NotAuthorized extends CustomError {
  constructor(customMessage) {
    super();
    this.name = this.constructor.name;
    this.httpCode = 401;
    this.message = customMessage || 'Not authorized.';
  }
}

// BadRequest error with a 400 http error code
// used for requests not formatted correctly
// TODO use for validation errors too?
class BadRequest extends CustomError {
  constructor(customMessage) {
    super();
    this.name = this.constructor.name;
    this.httpCode = 400;
    this.message = customMessage || 'Bad request.';
  }
}

// InternalError error with a 500 http error code
// used when an unexpected, internal server error is thrown
class InternalServerError extends CustomError {
  constructor(customMessage) {
    super();
    this.name = this.constructor.name;
    this.httpCode = 500;
    this.message = customMessage || 'Internal server error.';
  }
}

module.exports = {
  CustomError,
  NotAuthorized,
  BadRequest,
  InternalServerError
};