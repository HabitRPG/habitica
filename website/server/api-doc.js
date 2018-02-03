'use strict';

// This file defines some globals for use in the API Doc comments

/**
 * @apiDefine Path Path Parameters
 */

/**
 * @apiDefine Body Body Parameters
 */

/**
 * @apiDefine Query Query Parameters
 */

/**
 * @apiDefine Admin Moderators
 * Contributors of tier 8 or higher can use this route.
 */

/**
 * @apiDefine NoAuthHeaders Missing authentication headers
 *
 * @apiError (401) {NotAuthorized} NoAuthHeaders Missing authentication headers
 *
 * @apiErrorExample Missing authentication headers
 * {
 *   "success": false,
 *   "error": "NotAuthorized",
 *   "message": "Missing authentication headers."
 * }
 */

/**
* @apiDefine NoAccount There is no account that uses those credentials.
*
* @apiError (401) {NotAuthorized} NoAccount There is no account that uses those credentials
*
* @apiErrorExample No account
* {
*   "success": false,
*   "error": "NotAuthorized",
*   "message": "There is no account that uses those credentials."
* }
*/

/**
 * @apiDefine NotAdmin You don't have admin access.
 *
 * @apiError (401) {NotAuthorized} NotAdmin User is not an admin
 *
 * @apiErrorExample No admin access
 * {
 *   "success": false,
 *   "error": "NotAuthorized",
 *   "message": "You don't have admin access."
 * }
 */

/**
 * @apiDefine NoUser No user
 * @apiError (404) {NotFound} NoUser The specified user could not be found.
 *
 * @apiErrorExample No user
 * {
 *   "success": false,
 *   "error": "NotFound",
 *   "message": "User with id \"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\" not found."
 * }
 */
