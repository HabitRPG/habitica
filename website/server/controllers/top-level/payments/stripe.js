import shared from '../../../../common';
import {
  authWithHeaders,
} from '../../../middlewares/auth';
import stripePayments from '../../../libs/payments/stripe';

const api = {};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /stripe/checkout Stripe checkout
 * @apiName StripeCheckout
 * @apiGroup Payments
 *
 * @apiParam {String} id Body parameter - The token
 * @apiParam {String} email Body parameter - the customer email
 * @apiParam {String} gift Query parameter - stringified json object, gift
 * @apiParam {String} sub Query parameter - subscription, possible values are:
 *                        basic_earned, basic_3mo, basic_6mo, google_6mo, basic_12mo
 * @apiParam {String} coupon Query parameter - coupon for the matching subscription,
 *                           required only for certain subscriptions
 *
 * @apiSuccess {Object} data Empty object
 * */
api.checkout = {
  method: 'POST',
  url: '/stripe/checkout',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    // @TODO: These quer params need to be changed to body
    const token = req.body.id;
    const { user } = res.locals;
    const gift = req.query.gift ? JSON.parse(req.query.gift) : undefined;
    const sub = req.query.sub ? shared.content.subscriptionBlocks[req.query.sub] : false;
    const { groupId } = req.query;
    const { coupon } = req.query;

    await stripePayments.checkout({
      token, user, gift, sub, groupId, coupon,
    });

    res.respond(200, {});
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /stripe/subscribe/edit Edit Stripe subscription
 * @apiName StripeSubscribeEdit
 * @apiGroup Payments
 *
 * @apiParam {String} id Body parameter - The token
 *
 * @apiSuccess {Object} data Empty object
 * */
api.subscribeEdit = {
  method: 'POST',
  url: '/stripe/subscribe/edit',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const token = req.body.id;
    const { groupId } = req.body;
    const { user } = res.locals;

    await stripePayments.editSubscription({ token, groupId, user });

    res.respond(200, {});
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /stripe/subscribe/cancel Cancel Stripe subscription
 * @apiName StripeSubscribeCancel
 * @apiGroup Payments
 * */
api.subscribeCancel = {
  method: 'GET',
  url: '/stripe/subscribe/cancel',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const { groupId } = req.query;

    await stripePayments.cancelSubscription({ user, groupId });

    if (req.query.noRedirect) {
      res.respond(200);
    } else {
      res.redirect('/');
    }
  },
};

api.handleWebhooks = {
  method: 'POST',
  url: '/stripe/webhooks',
  async handler (req, res) {
    await stripePayments.handleWebhooks({ requestBody: req.body });

    return res.respond(200, {});
  },
};

export default api;
