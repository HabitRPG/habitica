import common from '../../common'; // eslint-disable-line max-classes-per-file

export const { CustomError } = common.errors;

/**
 * @apiDefine NotAuthorized
 * @apiError NotAuthorized The client is not authorized to make this request.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "NotAuthorized",
 *       "message": "Not authorized."
 *     }
 */
export const { NotAuthorized } = common.errors;

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
export const { BadRequest } = common.errors;

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
export const { NotFound } = common.errors;

/**
 * @apiDefine Forbidden
 * @apiError Forbidden The requested resource was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "error": "Forbidden",
 *       "message": "Access forbidden."
 *     }
 */
export const { Forbidden } = common.errors;

/**
 * @apiDefine TooManyRequests
 * @apiError TooManyRequests The client made too many requests to the API and was rate limited.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 429 TooManyRequests
 *     {
 *       "error": "TooManyRequests",
 *       "message": "Access forbidden."
 *     }
 */
export const { TooManyRequests } = common.errors;

/**
 * @apiDefine RequestTimeout
 * @apiError RequestTimeout The request took too long to complete.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 408 RequestTimeout
 *     {
 *       "error": "RequestTimeout",
 *       "message": "Access forbidden."
 *     }
 */
export const { RequestTimeout } = common.errors;

/**
 * @apiDefine NotificationNotFound
 * @apiError NotificationNotFound The notification was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "NotificationNotFound",
 *       "message": "Notification not found."
 *     }
 */
export class NotificationNotFound extends NotFound {
  constructor (language) {
    super(common.i18n.t('messageNotificationNotFound', language));
    this.name = this.constructor.name;
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

/**
 * @apiDefine TransactionError
 * @apiError TransactionError An error occurred during a transaction that could not be resolved.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "TransactionError",
 *       "message": "The transaction failed to commit after multiple attempts."
 *     }
 */
export class TransactionError extends InternalServerError {
  constructor (customMessage) {
    super();
    this.message = customMessage || 'The transaction failed to commit after multiple attempts.';
  }
}

/**
 * @apiDefine DatabaseError
 * @apiError DatabaseError An error occurred while interacting with the database.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "DatabaseError",
 *       "message": "A database error occurred."
 *     }
 */
export class DatabaseError extends InternalServerError {
  constructor (customMessage) {
    super();
    this.message = customMessage || 'A database error occurred.';
  }
}
