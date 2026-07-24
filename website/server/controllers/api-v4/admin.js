import validator from 'validator';
import merge from 'lodash/merge';
import uniqBy from 'lodash/uniqBy';
import { v4 as uuid } from 'uuid';
import { authWithHeaders } from '../../middlewares/auth';
import { ensurePermission } from '../../middlewares/ensureAccessRight';
import { model as User } from '../../models/user';
import { model as UserHistory } from '../../models/userHistory';
import { model as Group } from '../../models/group';
import { model as Blocker } from '../../models/blocker';
import {
  NotFound,
} from '../../libs/errors';
import apple from '../../libs/payments/apple';
import google from '../../libs/payments/google';
import paypal from '../../libs/payments/paypal';
import {
  getSubscriptionPaymentDetails as getStripeSubscriptionPaymentDetails,
} from '../../libs/payments/stripe/subscriptions';

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
        const emailQuery = { [field]: userIdentifier.toLowerCase() };
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
      const re = new RegExp(String.raw`^${userIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
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

    res.respond(200, uniqBy(users, '_id'));
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

api.getBlockers = {
  method: 'GET',
  url: '/admin/blockers',
  middlewares: [authWithHeaders(), ensurePermission('accessControl')],
  async handler (req, res) {
    const blockers = await Blocker
      .find({ disabled: false })
      .lean()
      .exec();

    res.respond(200, blockers);
  },
};

api.createBlocker = {
  method: 'POST',
  url: '/admin/blockers',
  middlewares: [authWithHeaders(), ensurePermission('accessControl')],
  async handler (req, res) {
    const id = uuid();
    const blocker = await Blocker({
      _id: id,
      ...Blocker.sanitize(req.body),
    }).save();

    res.respond(200, blocker);
  },
};

api.updateBlocker = {
  method: 'PUT',
  url: '/admin/blockers/:blockerId',
  middlewares: [authWithHeaders(), ensurePermission('accessControl')],
  async handler (req, res) {
    req.checkParams('blockerId', res.t('blockerIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const blocker = await Blocker.findById(req.params.blockerId).exec();
    if (!blocker) throw new NotFound(res.t('blockerNotFound'));

    merge(blocker, Blocker.sanitize(req.body));
    const savedBlocker = await blocker.save();

    res.respond(200, savedBlocker);
  },
};

api.deleteBlocker = {
  method: 'DELETE',
  url: '/admin/blockers/:blockerId',
  middlewares: [authWithHeaders(), ensurePermission('accessControl')],
  async handler (req, res) {
    req.checkParams('blockerId', res.t('blockerIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const blocker = await Blocker.findById(req.params.blockerId).exec();
    if (!blocker) throw new NotFound(res.t('blockerNotFound'));

    blocker.disabled = true;
    const savedBlocker = await blocker.save();

    res.respond(200, savedBlocker);
  },
};

api.validateSubscriptionPaymentDetails = {
  method: 'GET',
  url: '/admin/user/:userId/subscription-payment-details',
  middlewares: [authWithHeaders(), ensurePermission('userSupport')],
  async handler (req, res) {
    req.checkParams('userId', res.t('heroIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('purchased')
      .lean()
      .exec();

    if (!user) throw new NotFound(res.t('userWithIDNotFound', { userId }));
    if (!user.purchased || !user.purchased.plan || !user.purchased.plan.paymentMethod || !user.purchased.plan.paymentMethod === '') {
      throw new NotFound(res.t('subscriptionNotFoundForUser', { userId }));
    }

    let paymentDetails;
    if (user.purchased.plan.paymentMethod === 'Apple') {
      paymentDetails = await apple.getSubscriptionPaymentDetails(userId, user.purchased.plan);
    } else if (user.purchased.plan.paymentMethod === 'Google') {
      paymentDetails = await google.getSubscriptionPaymentDetails(userId, user.purchased.plan);
    } else if (user.purchased.plan.paymentMethod === 'Paypal') {
      paymentDetails = await paypal.getSubscriptionPaymentDetails({ user });
    } else if (user.purchased.plan.paymentMethod === 'Stripe') {
      paymentDetails = await getStripeSubscriptionPaymentDetails(user);
    } else if (user.purchased.plan.paymentMethod === 'Amazon Payments') {
      throw new NotFound(res.t('amazonSubscriptionNotValidated'));
    } else if (user.purchased.plan.paymentMethod === 'Gift') {
      throw new NotFound(res.t('giftSubscriptionNotValidated'));
    } else {
      throw new NotFound(res.t('unknownSubscriptionPaymentMethod', { method: user.purchased.paymentMethod }));
    }
    res.respond(200, paymentDetails);
  },
};

api.getGroup = {
  method: 'GET',
  url: '/admin/groups/:groupId',
  middlewares: [authWithHeaders(), ensurePermission('groupSupport')],
  async handler (req, res) {
    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .lean()
      .exec();

    if (!group) throw new NotFound(res.t('groupNotFound'));

    res.respond(200, group);
  },
};

export default api;
