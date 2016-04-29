let nconf = require('nconf');
let moment = require('moment');
let _ = require('lodash');
let payments = require('../../../libs/api-v3/payments');
let ipn = require('paypal-ipn');
let paypal = require('paypal-rest-sdk');
let shared = require('../../../../../common');
let cc = require('coupon-code');
import { model as Coupon } from '../../../models/coupon';
import { model as User } from '../../../models/user';
import {
  authWithUrl,
  authWithSession,
} from '../../../middlewares/api-v3/auth';
import {
  BadRequest,
} from '../../../libs/api-v3/errors';

// @TODO: I still need this? _vp_ 20160428
// This is the plan.id for paypal subscriptions. You have to set up billing plans via their REST sdk (they don't have
// a web interface for billing-plan creation), see ./paypalBillingSetup.js for how. After the billing plan is created
// there, get it's plan.id and store it in config.json
_.each(shared.content.subscriptionBlocks, (block) => {
  block.paypalKey = nconf.get(`PAYPAL:billing_plans:${block.key}`);
});

/* eslint-disable camelcase */

paypal.configure({
  mode: nconf.get('PAYPAL:mode'), // sandbox or live
  client_id: nconf.get('PAYPAL:client_id'), // eslint-disable-line camelcase
  client_secret: nconf.get('PAYPAL:client_secret'),
});

let api = {};

/**
 * @api {get} /paypal/checkout checkout
 * @apiVersion 3.0.0
 * @apiName PaypalCheckout
 * @apiGroup Payments
 *
 * @apiParam {string} gift The stringified object representing the user, the gift recepient.
 *
 * @apiSuccess {} redirect
 **/
api.checkout = {
  method: 'GET',
  url: '/payments/paypal/checkout',
  middlewares: [authWithUrl],
  async handler (req, res) {
    let gift = req.query.gift ? JSON.parse(req.query.gift) : undefined;
    req.session.gift = req.query.gift;

    let amount = 5.00;
    let description = 'HabitRPG gems';
    if (gift) {
      if (gift.type === 'gems') {
        amount = Number(gift.gems.amount / 4).toFixed(2);
        description = `${description} (Gift)`;
      } else {
        amount = Number(shared.content.subscriptionBlocks[gift.subscription.key].price).toFixed(2);
        description = 'monthly HabitRPG Subscription (Gift)';
      }
    }

    let createPayment = {
      intent: 'sale',
      payer: { payment_method: 'Paypal' },
      redirect_urls: {
        return_url: `${nconf.get('BASE_URL')}/paypal/checkout/success`,
        cancel_url: `${nconf.get('BASE_URL')}`,
      },
      transactions: [{
        item_list: {
          items: [{
            name: description,
            price: amount,
            currency: 'USD',
            quality: 1,
          }],
        },
        amount: {
          currency: 'USD',
          total: amount,
        },
        description,
      }],
    };
    try {
      let result = await paypal.payment.create(createPayment);
      let link = _.find(result.links, { rel: 'approval_url' }).href;
      res.redirect(link);
    } catch (e) {
      throw new BadRequest(e);
    }
  },
};

/**
 * @api {get} /paypal/checkout/success Paypal checkout success
 * @apiVersion 3.0.0
 * @apiName PaypalCheckoutSuccess
 * @apiGroup Payments
 *
 * @apiParam {string} paymentId The payment id
 * @apiParam {string} payerID The payer id, notice ID not id
 *
 * @apiSuccess {} redirect
 **/
api.checkoutSuccess = { // @TODO: formerly paypal.executePayment
  method: 'GET',
  url: '/payments/paypal/checkout/success',
  middlewares: [authWithSession],
  async handler (req, res) {
    let paymentId = req.query.paymentId;
    let customerId = req.query.payerID;
    let method = 'buyGems';
    let data = {
      user: res.locals.user,
      customerId,
      paymentMethod: 'Paypal',
    };

    try {
      let gift = req.session.gift ? JSON.parse(req.session.gift) : undefined;
      delete req.session.gift;
      if (gift) {
        gift.member = await User.findById(gift.uuid);
        if (gift.type === 'subscription') {
          method = 'createSubscription';
          data.paymentMethod = 'Gift';
        }
        data.gift = gift;
      }

      await paypal.payment.execute(paymentId, { payer_id: customerId });
      await payments[method](data);
      res.redirect('/');
    } catch (e) {
      throw new BadRequest(e);
    }
  },
};

/**
 * @api {get} /paypal/subscribe Paypal subscribe
 * @apiVersion 3.0.0
 * @apiName PaypalSubscribe
 * @apiGroup Payments
 *
 * @apiParam {string} sub subscription, possible values are: basic_earned, basic_3mo, basic_6mo, google_6mo, basic_12mo
 * @apiParam {string} coupon coupon for the matching subscription, required only for certain subscriptions
 *
 * @apiSuccess {} empty object
 **/
api.subscribe = { // @TODO: formerly paypal.createBillingAgreement
  method: 'GET',
  url: '/payments/paypal/subscribe',
  middlewares: [authWithUrl],
  async handler (req, res) {
    let sub = shared.content.subscriptionBlocks[req.query.sub];
    if (sub.discount) {
      if (!req.query.coupon) throw new BadRequest(res.t('couponCodeRequired'));
      let coupon = await Coupon.findOne({_id: cc.validate(req.query.coupon), event: sub.key});
      if (!coupon) throw new BadRequest(res.t('invalidCoupon'));
    }

    let billingPlanTitle = `HabitRPG Subscription ($${sub.price} every ${sub.months} months, recurring)`;
    let billingAgreementAttributes = {
      name: billingPlanTitle,
      description: billingPlanTitle,
      start_date: moment().add({ minutes: 5}).format(),
      plan: {
        id: sub.paypalKey,
      },
      payer: {
        payment_method: 'Paypal',
      },
    };
    try {
      let billingAgreement = await paypal.billingAgreement.create(billingAgreementAttributes);
      req.session.paypalBlock = req.query.sub;
      let link = _.find(billingAgreement.links, { rel: 'approval_url' }).href;
      res.redirect(link);
    } catch (e) {
      throw new BadRequest(e);
    }
  },
};

/**
 * @api {get} /paypal/subscribe/success Paypal subscribe success
 * @apiVersion 3.0.0
 * @apiName PaypalSubscribeSuccess
 * @apiGroup Payments
 *
 * @apiParam {string} token The token in query
 *
 * @apiSuccess {} redirect
 **/
api.subscribeSuccess = { // @TODO: formerly paypal.executeBillingAgreement
  method: 'GET',
  url: '/payments/paypal/subscribe/success',
  middlewares: [authWithSession],
  async handler (req, res) {
    let user = res.locals.user;
    let block = shared.content.subscriptionBlocks[req.session.paypalBlock];
    delete req.session.paypalBlock;
    try {
      let result = await paypal.billingAgreement.execute(req.query.token, {});
      await payments.createSubscription({
        user,
        customerId: result.id,
        paymentMethod: 'Paypal',
        sub: block,
      });
      res.redirect('/');
    } catch (e) {
      throw new BadRequest(e);
    }
  },
};

/**
 * @api {get} /paypal/subscribe/cancel Paypal subscribe cancel
 * @apiVersion 3.0.0
 * @apiName PaypalSubscribeCancel
 * @apiGroup Payments
 *
 * @apiParam {string} token The token in query
 *
 * @apiSuccess {} redirect
 **/
api.subscribeCancel = { // @TODO: formerly paypal.cancelSubscription
  method: 'GET',
  url: '/payments/paypal/subscribe/cancel',
  middlewares: [authWithUrl],
  async handler (req, res) {
    let user = res.locals.user;
    let customerId = user.purchased.plan.customerId;
    if (!user.purchased.plan.customerId) throw new BadRequest(res.t('missingSubscription'));
    try {
      let customer = await paypal.billingAgreement.get(customerId);
      let nextBillingDate = customer.agreement_details.next_billing_date;
      if (customer.agreement_details.cycles_completed === '0') { // hasn't billed yet
        throw new BadRequest(res.t('planNotActive', { nextBillingDate }));
      }
      await paypal.billingAgreement.cancel(customerId, { note: res.t('cancelingSubscription') });
      let data = {
        user,
        paymentMethod: 'Paypal',
        nextBill: nextBillingDate,
      };
      await payments.cancelSubscription(data);
      res.redirect('/');
    } catch (e) {
      throw new BadRequest(e);
    }
  },
};

/**
 * @api {post} /paypal/ipn Paypal IPN
 * @apiVersion 3.0.0
 * @apiName PaypalIpn
 * @apiGroup Payments
 *
 * @apiParam {string} txn_type txn_type
 * @apiParam {string} recurring_payment_id recurring_payment_id
 *
 * @apiSuccess {} empty object
 **/
api.ipn = {
  method: 'POST',
  url: '/payments/paypal/ipn',
  middlewares: [],
  async handler (req, res) {
    res.respond(200);
    try {
      await ipn.verify(req.body);
      if (req.body.txn_type === 'recurring_payment_profile_cancel' || req.body.txn_type === 'subscr_cancel') {
        let user = await User.findOne({ 'purchased.plan.customerId': req.body.recurring_payment_id });
        if (user) {
          payments.cancelSubscriptoin({ user, paymentMethod: 'Paypal' });
        }
      }
    } catch (e) {
      console.log('Problem with Paypal ipn:', e); // eslint-disable-line no-console
    }
  },
};

/* eslint-disable camelcase */

module.exports = api;
