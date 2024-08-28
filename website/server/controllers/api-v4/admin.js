import validator from 'validator';
import { authWithHeaders } from '../../middlewares/auth';
import { ensurePermission } from '../../middlewares/ensureAccessRight';
import { model as User } from '../../models/user';
import { model as UserHistory } from '../../models/userHistory';
import {
  NotFound,
} from '../../libs/errors';

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
api.searchHero = {
  method: 'GET',
  url: '/admin/search/:userIdentifier',
  middlewares: [authWithHeaders(), ensurePermission('userSupport')],
  async handler (req, res) {
    req.checkParams('userIdentifier', res.t('userIdentifierRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { userIdentifier } = req.params;

    const re = new RegExp(String.raw`^${userIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

    let query;
    let users = [];
    if (validator.isUUID(userIdentifier)) {
      query = { _id: userIdentifier };
    } else if (validator.isEmail(userIdentifier)) {
      const emailFields = [
        'auth.local.email',
        'auth.google.emails.value',
        'auth.apple.emails.value',
        'auth.facebook.emails.value',
      ];
      for (const field of emailFields) {
        const emailQuery = { [field]: userIdentifier };
        // eslint-disable-next-line no-await-in-loop
        const found = await User.findOne(emailQuery)
          .select('contributor backer profile auth')
          .lean()
          .exec();
        if (found) {
          users.push(found);
        }
      }
    } else {
      query = { 'auth.local.lowerCaseUsername': { $regex: re, $options: 'i' } };
    }

    if (query) {
      users = await User
        .find(query)
        .select('contributor backer profile auth')
        .limit(30)
        .lean()
        .exec();
    }
    res.respond(200, users);
  },
};

/**
 * @api {get} /api/v4/admin/user/:userId/history Get the history of a user
 * @apiParam (Path) {String} userIdentifier The username or email of the user
 * @apiName GetUserHistory
 * @apiGroup Admin
 * @apiPermission Admin
 *
 * @apiDescription Returns the history of a user
 *
 * @apiSuccess {Object} data The User history
 *
 * @apiUse NoAuthHeaders
 * @apiUse NoAccount
 * @apiUse NoUser
 * @apiUse NotAdmin
 */
api.getUserHistory = {
  method: 'GET',
  url: '/admin/user/:userId/history',
  middlewares: [authWithHeaders(), ensurePermission('userSupport')],
  async handler (req, res) {
    req.checkParams('userId', res.t('heroIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { userId } = req.params;

    const history = await UserHistory
      .findOne({ userId })
      .lean()
      .exec();

    if (!history) throw new NotFound(res.t('userWithIDNotFound', { userId }));

    res.respond(200, history);
  },
};

export default api;
