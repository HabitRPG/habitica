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
