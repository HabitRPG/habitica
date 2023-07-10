/* eslint-disable camelcase */
import paypalPayments from '../../../libs/payments/paypal';
import logger from '../../../libs/logger';
import shared from '../../../../common';
import {
  authWithSession,
  authWithHeaders,
} from '../../../middlewares/auth';
import {
  BadRequest,
} from '../../../libs/errors';
import apiError from '../../../libs/apiError';

const api = {};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /paypal/checkout Paypal: checkout
 * @apiName PaypalCheckout
 * @apiGroup Payments
 * */
api.checkout = {
  method: 'GET',
  url: '/paypal/checkout',
  middlewares: [authWithSession],
  async handler (req, res) {
    const gift = req.query.gift ? JSON.parse(req.query.gift) : undefined;
    req.session.gift = req.query.gift;

    const { gemsBlock, sku } = req.query;
    req.session.gemsBlock = gemsBlock;
    req.session.sku = sku;

    const link = await paypalPayments.checkout({
      gift, gemsBlock, sku, user: res.locals.user,
    });

    if (req.query.noRedirect) {
      res.respond(200);
    } else {
      res.redirect(link);
    }
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /paypal/checkout/success Paypal: checkout success
 * @apiName PaypalCheckoutSuccess
 * @apiGroup Payments
 * */
api.checkoutSuccess = {
  method: 'GET',
  url: '/paypal/checkout/success',
  middlewares: [authWithSession],
  async handler (req, res) {
    const { paymentId } = req.query;
    const customerId = req.query.PayerID;
    const { user } = res.locals;
    const gift = req.session.gift ? JSON.parse(req.session.gift) : undefined;
    delete req.session.gift;
    const { gemsBlock, sku } = req.session;
    delete req.session.gemsBlock;
    delete req.session.sku;

    if (!paymentId) throw new BadRequest(apiError('missingPaymentId'));
    if (!customerId) throw new BadRequest(apiError('missingCustomerId'));

    await paypalPayments.checkoutSuccess({
      user, gemsBlock, gift, paymentId, customerId, headers: req.headers, sku,
    });

    if (req.query.noRedirect) {
      res.respond(200);
    } else {
      res.redirect('/redirect/paypal-success-checkout');
    }
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /paypal/subscribe Paypal: subscribe
 * @apiName PaypalSubscribe
 * @apiGroup Payments
 * */
api.subscribe = {
  method: 'GET',
  url: '/paypal/subscribe',
  middlewares: [authWithSession],
  async handler (req, res) {
    if (!req.query.sub) throw new BadRequest(apiError('missingSubKey'));

    const sub = shared.content.subscriptionBlocks[req.query.sub];
    const { coupon } = req.query;

    const link = await paypalPayments.subscribe({ sub, coupon });

    req.session.paypalBlock = req.query.sub;
    req.session.groupId = req.query.groupId;

    if (req.query.noRedirect) {
      res.respond(200);
    } else {
      res.redirect(link);
    }
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /paypal/subscribe/success Paypal: subscribe success
 * @apiName PaypalSubscribeSuccess
 * @apiGroup Payments
 * */
api.subscribeSuccess = {
  method: 'GET',
  url: '/paypal/subscribe/success',
  middlewares: [authWithSession],
  async handler (req, res) {
    const { user } = res.locals;

    if (!req.session.paypalBlock) throw new BadRequest(apiError('missingPaypalBlock'));

    const block = shared.content.subscriptionBlocks[req.session.paypalBlock];
    const { groupId } = req.session;
    const { token } = req.query;

    delete req.session.paypalBlock;
    delete req.session.groupId;

    await paypalPayments.subscribeSuccess({
      user, block, groupId, token, headers: req.headers,
    });

    if (req.query.noRedirect) {
      res.respond(200);
    } else {
      res.redirect('/redirect/paypal-success-subscribe');
    }
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /paypal/subscribe/cancel Paypal: subscribe cancel
 * @apiName PaypalSubscribeCancel
 * @apiGroup Payments
 * */
api.subscribeCancel = {
  method: 'GET',
  url: '/paypal/subscribe/cancel',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const { groupId } = req.query;

    await paypalPayments.subscribeCancel({ user, groupId });

    if (req.query.noRedirect) {
      res.respond(200);
    } else {
      res.redirect('/user/settings/subscription');
    }
  },
};

// General IPN handler. We catch cancelled Habitica subscriptions
// for users who manually cancel their recurring paypal payments in their paypal dashboard.
// TODO ? Remove this when we can move to webhooks or some other solution

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /paypal/ipn Paypal IPN
 * @apiName PaypalIpn
 * @apiGroup Payments
 * */
api.ipn = {
  method: 'POST',
  url: '/paypal/ipn',
  async handler (req, res) {
    res.sendStatus(200);

    paypalPayments
      .ipn(req.body)
      .catch(err => logger.error(err, 'Error handling Paypal IPN message.'));
  },
};

export default api;
