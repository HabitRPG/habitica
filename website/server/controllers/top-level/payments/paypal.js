/* eslint-disable camelcase */

import nconf from 'nconf';
import moment from 'moment';
import _ from 'lodash';
import payments from '../../../libs/payments';
import ipn from 'paypal-ipn';
import paypal from 'paypal-rest-sdk';
import shared from '../../../../common';
import cc from 'coupon-code';
import Bluebird from 'bluebird';
import { model as Coupon } from '../../../models/coupon';
import { model as User } from '../../../models/user';
import {
  authWithUrl,
  authWithSession,
} from '../../../middlewares/auth';
import {
  BadRequest,
  NotAuthorized,
} from '../../../libs/errors';

const BASE_URL = nconf.get('BASE_URL');

// This is the plan.id for paypal subscriptions. You have to set up billing plans via their REST sdk (they don't have
// a web interface for billing-plan creation), see ./paypalBillingSetup.js for how. After the billing plan is created
// there, get it's plan.id and store it in config.json
_.each(shared.content.subscriptionBlocks, (block) => {
  block.paypalKey = nconf.get(`PAYPAL:billing_plans:${block.key}`);
});

paypal.configure({
  mode: nconf.get('PAYPAL:mode'), // sandbox or live
  client_id: nconf.get('PAYPAL:client_id'),
  client_secret: nconf.get('PAYPAL:client_secret'),
});

// TODO better handling of errors
const paypalPaymentCreate = Bluebird.promisify(paypal.payment.create, {context: paypal.payment});
const paypalPaymentExecute = Bluebird.promisify(paypal.payment.execute, {context: paypal.payment});
const paypalBillingAgreementCreate = Bluebird.promisify(paypal.billingAgreement.create, {context: paypal.billingAgreement});
const paypalBillingAgreementExecute = Bluebird.promisify(paypal.billingAgreement.execute, {context: paypal.billingAgreement});
const paypalBillingAgreementGet = Bluebird.promisify(paypal.billingAgreement.get, {context: paypal.billingAgreement});
const paypalBillingAgreementCancel = Bluebird.promisify(paypal.billingAgreement.cancel, {context: paypal.billingAgreement});

const ipnVerifyAsync = Bluebird.promisify(ipn.verify, {context: ipn});

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

    let amount = 5.00;
    let description = 'Habitica Gems';
    if (gift) {
      if (gift.type === 'gems') {
        amount = Number(gift.gems.amount / 4).toFixed(2);
        description = `${description} (Gift)`;
      } else {
        amount = Number(shared.content.subscriptionBlocks[gift.subscription.key].price).toFixed(2);
        description = 'mo. Habitica Subscription (Gift)';
      }
    }

    let createPayment = {
      intent: 'sale',
      payer: { payment_method: 'Paypal' },
      redirect_urls: {
        return_url: `${BASE_URL}/paypal/checkout/success`,
        cancel_url: `${BASE_URL}`,
      },
      transactions: [{
        item_list: {
          items: [{
            name: description,
            // sku: 1,
            price: amount,
            currency: 'USD',
            quantity: 1,
          }],
        },
        amount: {
          currency: 'USD',
          total: amount,
        },
        description,
      }],
    };

    let result = await paypalPaymentCreate(createPayment);
    let link = _.find(result.links, { rel: 'approval_url' }).href;
    res.redirect(link);
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

    let method = 'buyGems';
    let data = {
      user: res.locals.user,
      customerId,
      paymentMethod: 'Paypal',
    };

    let gift = req.session.gift ? JSON.parse(req.session.gift) : undefined;
    delete req.session.gift;

    if (gift) {
      gift.member = await User.findById(gift.uuid);
      if (gift.type === 'subscription') {
        method = 'createSubscription';
      }

      data.paymentMethod = 'Gift';
      data.gift = gift;
    }

    await paypalPaymentExecute(paymentId, { payer_id: customerId });
    await payments[method](data);
    res.redirect('/');
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
    let sub = shared.content.subscriptionBlocks[req.query.sub];

    if (sub.discount) {
      if (!req.query.coupon) throw new BadRequest(res.t('couponCodeRequired'));
      let coupon = await Coupon.findOne({_id: cc.validate(req.query.coupon), event: sub.key});
      if (!coupon) throw new NotAuthorized(res.t('invalidCoupon'));
    }

    let billingPlanTitle = `Habitica Subscription ($${sub.price} every ${sub.months} months, recurring)`;
    let billingAgreementAttributes = {
      name: billingPlanTitle,
      description: billingPlanTitle,
      start_date: moment().add({ minutes: 5 }).format(),
      plan: {
        id: sub.paypalKey,
      },
      payer: {
        payment_method: 'Paypal',
      },
    };
    let billingAgreement = await paypalBillingAgreementCreate(billingAgreementAttributes);

    req.session.paypalBlock = req.query.sub;
    let link = _.find(billingAgreement.links, { rel: 'approval_url' }).href;
    res.redirect(link);
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
    let block = shared.content.subscriptionBlocks[req.session.paypalBlock];
    delete req.session.paypalBlock;

    let result = await paypalBillingAgreementExecute(req.query.token, {});
    await payments.createSubscription({
      user,
      customerId: result.id,
      paymentMethod: 'Paypal',
      sub: block,
      headers: req.headers,
    });

    res.redirect('/');
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
    let customerId = user.purchased.plan.customerId;
    if (!user.purchased.plan.customerId) throw new NotAuthorized(res.t('missingSubscription'));

    let customer = await paypalBillingAgreementGet(customerId);

    let nextBillingDate = customer.agreement_details.next_billing_date;
    if (customer.agreement_details.cycles_completed === '0') { // hasn't billed yet
      throw new BadRequest(res.t('planNotActive', { nextBillingDate }));
    }

    await paypalBillingAgreementCancel(customerId, { note: res.t('cancelingSubscription') });
    await payments.cancelSubscription({
      user,
      paymentMethod: 'Paypal',
      nextBill: nextBillingDate,
    });

    res.redirect('/');
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

    await ipnVerifyAsync(req.body);

    if (req.body.txn_type === 'recurring_payment_profile_cancel' || req.body.txn_type === 'subscr_cancel') {
      let user = await User.findOne({ 'purchased.plan.customerId': req.body.recurring_payment_id });
      if (user) {
        await payments.cancelSubscription({ user, paymentMethod: 'Paypal' });
      }
    }
  },
};

module.exports = api;
