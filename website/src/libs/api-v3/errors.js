// Base class for custom application errors
// It extends Error and capture the stack trace
export class CustomError extends Error {
  constructor () {
    super();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @apiDefine NotFound
 * @apiError NotFound The client is not authorized to make this request.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "NotAuthorized",
 *       "message": "Not authorized."
 *     }
 */
export class NotAuthorized extends CustomError {
  constructor (customMessage) {
    super();
    this.name = this.constructor.name;
    this.httpCode = 401;
    this.message = customMessage || 'Not authorized.';
  }
}

/**
 * @apiDefine BadRequest
 * @apiError BadRequest The request wasn't formatted correctly.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "BadRequest",
 *       "message": "Bad request."
 *     }
 */
export class BadRequest extends CustomError {
  constructor (customMessage) {
    super();
    this.name = this.constructor.name;
    this.httpCode = 400;
    this.message = customMessage || 'Bad request.';
  }
}

/**
 * @apiDefine NotFound
 * @apiError NotFound The requested resource was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "NotFound",
 *       "message": "Not found."
 *     }
 */
export class NotFound extends CustomError {
  constructor (customMessage) {
    super();
    this.name = this.constructor.name;
    this.httpCode = 404;
    this.message = customMessage || 'Not found.';
  }
}

/**
 * @apiDefine InternalServerError
 * @apiError InternalServerError An unexpected error occurred.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "InternalServerError",
 *       "message": "An unexpected error occurred."
 *     }
 */
export class InternalServerError extends CustomError {
  constructor (customMessage) {
    super();
    this.name = this.constructor.name;
    this.httpCode = 500;
    this.message = customMessage || 'An unexpected error occurred.';
  }
}
