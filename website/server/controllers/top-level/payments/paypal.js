/* eslint-disable camelcase */
import paypalPayments from '../../../libs/paypalPayments';
import shared from '../../../../common';
import {
  authWithUrl,
  authWithSession,
} from '../../../middlewares/auth';
import {
  BadRequest,
} from '../../../libs/errors';

const i18n = shared.i18n;

let api = {};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /paypal/checkout Paypal: checkout
 * @apiName PaypalCheckout
 * @apiGroup Payments
 **/
api.checkout = {
  method: 'GET',
  url: '/paypal/checkout',
  middlewares: [authWithUrl],
  async handler (req, res) {
    let gift = req.query.gift ? JSON.parse(req.query.gift) : undefined;
    req.session.gift = req.query.gift;

    let link = await paypalPayments.checkout({gift, user: res.locals.user});

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
 **/
api.checkoutSuccess = {
  method: 'GET',
  url: '/paypal/checkout/success',
  middlewares: [authWithSession],
  async handler (req, res) {
    let paymentId = req.query.paymentId;
    let customerId = req.query.PayerID;
    let user = res.locals.user;
    let gift = req.session.gift ? JSON.parse(req.session.gift) : undefined;
    delete req.session.gift;

    if (!paymentId) throw new BadRequest(i18n.t('missingPaymentId'));
    if (!customerId) throw new BadRequest(i18n.t('missingCustomerId'));

    await paypalPayments.checkoutSuccess({user, gift, paymentId, customerId});

    if (req.query.noRedirect) {
      res.respond(200);
    } else {
      res.redirect('/');
    }
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /paypal/subscribe Paypal: subscribe
 * @apiName PaypalSubscribe
 * @apiGroup Payments
 **/
api.subscribe = {
  method: 'GET',
  url: '/paypal/subscribe',
  middlewares: [authWithUrl],
  async handler (req, res) {
    if (!req.query.sub) throw new BadRequest(i18n.t('missingSubKey'));

    let sub = shared.content.subscriptionBlocks[req.query.sub];
    let coupon = req.query.coupon;

    let link = await paypalPayments.subscribe({sub, coupon});

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
 **/
api.subscribeSuccess = {
  method: 'GET',
  url: '/paypal/subscribe/success',
  middlewares: [authWithSession],
  async handler (req, res) {
    let user = res.locals.user;

    if (!req.session.paypalBlock) throw new BadRequest(i18n.t('missingPaypalBlock'));

    let block = shared.content.subscriptionBlocks[req.session.paypalBlock];
    let groupId = req.session.groupId;
    let token = req.query.token;

    delete req.session.paypalBlock;
    delete req.session.groupId;

    await paypalPayments.subscribeSuccess({user, block, groupId, token, headers: req.headers});

    if (req.query.noRedirect) {
      res.respond(200);
    } else {
      res.redirect('/user/settings/subscription');
    }
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /paypal/subscribe/cancel Paypal: subscribe cancel
 * @apiName PaypalSubscribeCancel
 * @apiGroup Payments
 **/
api.subscribeCancel = {
  method: 'GET',
  url: '/paypal/subscribe/cancel',
  middlewares: [authWithUrl],
  async handler (req, res) {
    let user = res.locals.user;
    let groupId = req.query.groupId;

    await paypalPayments.subscribeCancel({user, groupId});

    if (req.query.noRedirect) {
      res.respond(200);
    } else {
      res.redirect('/user/settings/subscription');
    }
  },
};

// General IPN handler. We catch cancelled Habitica subscriptions for users who manually cancel their
// recurring paypal payments in their paypal dashboard. TODO ? Remove this when we can move to webhooks or some other solution

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /paypal/ipn Paypal IPN
 * @apiName PaypalIpn
 * @apiGroup Payments
 **/
api.ipn = {
  method: 'POST',
  url: '/paypal/ipn',
  async handler (req, res) {
    res.sendStatus(200);

    await paypalPayments.ipn(req.body);
  },
};

module.exports = api;
