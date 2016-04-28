import stripeModule from 'stripe';
import shared from '../../../../../common';
import {
  BadRequest,
} from '../../../libs/api-v3/errors';
import { model as Coupon } from '../../../models/coupon';
import payments from '../../../libs/api-v3/payments';
import nconf from 'nconf';
import { model as User } from '../../../models/user';
import cc from 'coupon-code';
import {
  authWithHeaders,
  authWithUrl,
} from '../../../middlewares/api-v3/auth';

const stripe = stripeModule(nconf.get('STRIPE_API_KEY'));

let api = {};

/**
 * @api {post} /api/v3/payments/stripe/checkout Stripe checkout
 * @apiVersion 3.0.0
 * @apiName StripeCheckout
 * @apiGroup Payments
 *
 * @apiParam {string} id The token
 * @apiParam {string} gift stringified json object, gift
 * @apiParam {string} sub subscription, possible values are: basic_earned, basic_3mo, basic_6mo, google_6mo, basic_12mo
 * @apiParam {string} coupon coupon for the matching subscription, required only for certain subscriptions
 * @apiParam {string} email the customer email
 *
 * @apiSuccess {} empty object
 **/
api.checkout = {
  method: 'POST',
  url: '/payments/stripe/checkout',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let token = req.body.id;
    let user = res.locals.user;
    let gift = req.query.gift ? JSON.parse(req.query.gift) : undefined;
    let sub = req.query.sub ? shared.content.subscriptionBlocks[req.query.sub] : false;
    let coupon;
    let response;

    if (sub) {
      if (sub.discount) {
        if (!req.query.coupon) throw new BadRequest(res.t('couponCodeRequired'));
        coupon = await Coupon.findOne({_id: cc.validate(req.query.coupon), event: sub.key});
        if (!coupon) throw new BadRequest(res.t('invalidCoupon'));
      }
      let customer = {
        email: req.body.email,
        metadata: { uuid: user._id },
        card: token,
        plan: sub.key,
      };
      response = await stripe.customers.create(customer);
    } else {
      let amount = 500; // $5
      if (gift) {
        if (gift.type === 'subscription') {
          amount = `${shared.content.subscriptionBlocks[gift.subscription.key].price * 100}`;
        } else {
          amount = `${gift.gems.amount / 4 * 100}`;
        }
      }
      response = await stripe.charges.create({
        amount,
        currency: 'usd',
        card: token,
      });
    }

    if (sub) {
      await payments.createSubscription({
        user,
        customerId: response.id,
        paymentMethod: 'Stripe',
        sub,
      });
    } else {
      let method = 'buyGems';
      let data = {
        user,
        customerId: response.id,
        paymentMethod: 'Stripe',
        gift,
      };
      if (gift) {
        let member = await User.findById(gift.uuid);
        gift.member = member;
        if (gift.type === 'subscription') method = 'createSubscription';
        data.paymentMethod = 'Gift';
      }
      await payments[method](data);
    }
    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/payments/stripe/subscribe/edit Stripe subscribeEdit
 * @apiVersion 3.0.0
 * @apiName StripeSubscribeEdit
 * @apiGroup Payments
 *
 * @apiParam {string} id The token
 *
 * @apiSuccess {}
 **/
api.subscribeEdit = {
  method: 'POST',
  url: '/payments/stripe/subscribe/edit',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let token = req.body.id;
    let user = res.locals.user;
    let customerId = user.purchased.plan.customerId;

    if (!customerId) throw new BadRequest(res.t('missingSubscription'));

    try {
      let subscriptions = await stripe.customers.listSubscriptions(customerId);
      let subscriptionId = subscriptions.data[0].id;
      await stripe.customers.updateSubscription(customerId, subscriptionId, { card: token });
      res.respond(200, {});
    } catch (error) {
      throw new BadRequest(error.message);
    }
  },
};

/**
 * @api {get} /api/v3/payments/stripe/subscribe/cancel Stripe subscribeCancel
 * @apiVersion 3.0.0
 * @apiName StripeSubscribeCancel
 * @apiGroup Payments
 *
 * @apiParam
 *
 * @apiSuccess {}
 **/
api.subscribeCancel = {
  method: 'GET',
  url: '/payments/stripe/subscribe/cancel',
  middlewares: [authWithUrl],
  async handler (req, res) {
    let user = res.locals.user;
    if (!user.purchased.plan.customerId) throw new BadRequest(res.t('missingSubscription'));
    let customer = await stripe.customers.retrieve(user.purchased.plan.customeerId);
    await stripe.customers.del(user.purchased.plan.customerId);
    let data = {
      user,
      nextBill: customer.subscription.current_period_end * 1000, // timestamp in seconds
      paymentMethod: 'Stripe',
    };
    await payments.cancelSubscriptoin(data);
    res.respond(200, {});
  },
};

module.exports = api;
