import validator from 'validator';
import { authWithHeaders } from '../../middlewares/auth';
import { ensurePermission } from '../../middlewares/ensureAccessRight';
import { model as User } from '../../models/user';

const api = {};

/**
 * @api {get} /api/v4/admin/search/:userIdentifier Search for users by username or email
 * @apiParam (Path) {String} userIdentifier The username or email of the user to search for
 * @apiName SearchUsers
 * @apiGroup Admin
 * @apiPermission Admin
 *
 * @apiDescription Returns a list of users that match the search criteria
 *
 * @apiSuccess {Object} data The User list
 *
 * @apiUse NoAuthHeaders
 * @apiUse NoAccount
 * @apiUse NoUser
 * @apiUse NotAdmin
 */
api.getHero = {
  method: 'GET',
  url: '/admin/search/:userIdentifier',
  middlewares: [authWithHeaders(), ensurePermission('userSupport')],
  async handler (req, res) {
    req.checkParams('userIdentifier', res.t('userIdentifierRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { userIdentifier } = req.params;

    const re = new RegExp(String.raw`${userIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

    let query;
    if (validator.isUUID(userIdentifier)) {
      query = { _id: userIdentifier };
    } else if (validator.isEmail(userIdentifier)) {
      query = {
        $or: [
          { 'auth.local.email': { $regex: re, $options: 'i' } },
          { 'auth.google.email': { $regex: re, $options: 'i' } },
          { 'auth.apple.email': { $regex: re, $options: 'i' } },
          { 'auth.facebook.email': { $regex: re, $options: 'i' } },
        ],
      };
    } else {
      query = { 'auth.local.lowerCaseUsername': { $regex: re, $options: 'i' } };
    }

    const users = await User
      .find(query)
      .select('contributor backer profile auth')
      .limit(30)
      .lean()
      .exec();
    res.respond(200, users);
  },
};

export default api;
