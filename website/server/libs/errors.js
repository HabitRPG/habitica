import common from '../../common';

export const CustomError = common.errors.CustomError;

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
export const NotAuthorized = common.errors.NotAuthorized;

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
export const BadRequest = common.errors.BadRequest;

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
export const NotFound = common.errors.NotFound;

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
