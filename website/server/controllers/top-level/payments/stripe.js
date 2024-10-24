import shared from '../../../../common';
import {
  authWithHeaders,
} from '../../../middlewares/auth';
import stripePayments from '../../../libs/payments/stripe';

const api = {};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /stripe/checkout-session Create a Stripe Checkout Session
 * @apiName StripeCheckout
 * @apiGroup Payments
 *
 * @apiParam (Body) {String} [gemsBlock] If purchasing a gem block, its key
 * @apiParam (Body) {Object} [gift] The gift object
 * @apiParam (Body) {String} [sub] If purchasing a subscription, its key
 * @apiParam (Body) {UUID} [groupId] If purchasing a group plan, the group id
 * @apiParam (Body) {String} [coupon] Subscription Coupon
 *
 * @apiSuccess {String} data.sessionId The created checkout session id
 * */
api.createCheckoutSession = {
  method: 'POST',
  url: '/stripe/checkout-session',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const {
      gift, sub: subKey, gemsBlock, coupon, groupId, sku,
    } = req.body;

    const sub = subKey ? shared.content.subscriptionBlocks[subKey] : false;

    const session = await stripePayments.createCheckoutSession({
      user, gemsBlock, gift, sub, groupId, coupon, sku,
    });

    res.respond(200, {
      sessionId: session.id,
    });
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /stripe/subscribe/edit Edit Stripe subscription
 * @apiName StripeSubscribeEdit
 * @apiGroup Payments
 *
 * @apiParam (Body) {UUID} [groupId] If editing a group plan, the group id
 *
 * @apiSuccess {String} data.sessionId The created checkout session id
 * */
api.subscribeEdit = {
  method: 'POST',
  url: '/stripe/subscribe/edit',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { groupId } = req.body;
    const { user } = res.locals;

    const session = await stripePayments.createEditCardCheckoutSession({ groupId, user });

    res.respond(200, {
      sessionId: session.id,
    });
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /stripe/subscribe/cancel Cancel Stripe subscription
 * @apiName StripeSubscribeCancel
 * @apiGroup Payments
 *
 * @apiParam (Body) {UUID} [groupId] If editing a group plan, the group id
 *
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

// NOTE: due to Stripe requirements on validating webhooks, the body is not json parsed
// for this route, see website/server/middlewares/index.js

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /stripe/webhooks Stripe Webhooks handler
 * @apiName StripeHandleWebhooks
 * @apiGroup Payments
 * */
api.handleWebhooks = {
  method: 'POST',
  url: '/stripe/webhooks',
  async handler (req, res) {
    await stripePayments.handleWebhooks({ body: req.body, headers: req.headers });

    return res.respond(200, {});
  },
};

export default api;
