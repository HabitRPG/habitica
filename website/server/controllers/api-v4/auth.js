import { authWithHeaders } from '../../middlewares/auth';
import * as authLib from '../../libs/auth';

const api = {};

/*
* NOTE most user routes are still in the v3 controller
* here there are only routes that had to be split from the v3 version because of
* some breaking change (for example because their returned the entire user object).
*/

/* NOTE this route has also an API v3 version */

/**
 * @api {post} /api/v4/user/auth/local/register Register
 * @apiDescription Register a new user with email, login name, and password or attach local auth to a social user
 * @apiName UserRegisterLocal
 * @apiGroup User
 *
 * @apiParam (Body) {String} username Login name of the new user. Must be 1-36 characters, containing only a-z, 0-9, hyphens (-), or underscores (_).
 * @apiParam (Body) {String} email Email address of the new user
 * @apiParam (Body) {String} password Password for the new user
 * @apiParam (Body) {String} confirmPassword Password confirmation
 *
 * @apiSuccess {Object} data The user object, if local auth was just attached to a social user then only user.auth.local
 */
api.registerLocal = {
  method: 'POST',
  middlewares: [authWithHeaders({
    optional: true,
  })],
  url: '/user/auth/local/register',
  async handler (req, res) {
    await authLib.registerLocal(req, res, { isV3: false });
  },
};

module.exports = api;