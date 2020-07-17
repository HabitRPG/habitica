/* eslint-disable max-classes-per-file */
import extendableBuiltin from './extendableBuiltin';

// Base class for custom application errors
// It extends Error and capture the stack trace
export class CustomError extends extendableBuiltin(Error) {
  constructor () {
    super();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// We specify an httpCode for all errors so that they can be used in the API too

export class NotAuthorized extends CustomError {
  constructor (customMessage) {
    super();
    this.name = this.constructor.name;
    this.httpCode = 401;
    this.message = customMessage || 'Not authorized.';
  }
}

export class BadRequest extends CustomError {
  constructor (customMessage) {
    super();
    this.name = this.constructor.name;
    this.httpCode = 400;
    this.message = customMessage || 'Bad request.';
  }
}

export class NotFound extends CustomError {
  constructor (customMessage) {
    super();
    this.name = this.constructor.name;
    this.httpCode = 404;
    this.message = customMessage || 'Not found.';
  }
}

export class Forbidden extends CustomError {
  constructor (customMessage) {
    super();
    this.name = this.constructor.name;
    this.httpCode = 403;
    this.message = customMessage || 'Access forbidden.';
  }
}

export class TooManyRequests extends CustomError {
  constructor (customMessage) {
    super();
    this.name = this.constructor.name;
    this.httpCode = 429;
    this.message = customMessage || 'Too many requests.';
  }
}

export class NotImplementedError extends CustomError {
  constructor (str) {
    super();
    this.name = this.constructor.name;

    this.message = `Method: '${str}' not implemented`;
  }
}
