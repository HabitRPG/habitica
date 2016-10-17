import stripeModule from 'stripe';
import shared from '../../../../common';
import {
  BadRequest,
  NotAuthorized,
} from '../../../libs/errors';
import { model as Coupon } from '../../../models/coupon';
import payments from '../../../libs/payments';
import nconf from 'nconf';
import { model as User } from '../../../models/user';
import cc from 'coupon-code';
import {
  authWithHeaders,
  authWithUrl,
} from '../../../middlewares/auth';

const stripe = stripeModule(nconf.get('STRIPE_API_KEY'));

let api = {};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /stripe/checkout Stripe checkout
 * @apiName StripeCheckout
 * @apiGroup Payments
 *
 * @apiParam {String} id Body parameter - The token
 * @apiParam {String} email Body parameter - the customer email
 * @apiParam {String} gift Query parameter - stringified json object, gift
 * @apiParam {String} sub Query parameter - subscription, possible values are: basic_earned, basic_3mo, basic_6mo, google_6mo, basic_12mo
 * @apiParam {String} coupon Query parameter - coupon for the matching subscription, required only for certain subscriptions
 *
 * @apiSuccess {Object} data Empty object
 **/
api.checkout = {
  method: 'POST',
  url: '/stripe/checkout',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let token = req.body.id;
    let user = res.locals.user;
    let gift = req.query.gift ? JSON.parse(req.query.gift) : undefined;
    let sub = req.query.sub ? shared.content.subscriptionBlocks[req.query.sub] : false;
    let coupon;
    let response;

    if (!token) throw new BadRequest('Missing req.body.id');

    if (sub) {
      if (sub.discount) {
        if (!req.query.coupon) throw new BadRequest(res.t('couponCodeRequired'));
        coupon = await Coupon.findOne({_id: cc.validate(req.query.coupon), event: sub.key});
        if (!coupon) throw new BadRequest(res.t('invalidCoupon'));
      }

      response = await stripe.customers.create({
        email: req.body.email,
        metadata: { uuid: user._id },
        card: token,
        plan: sub.key,
      });
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
        headers: req.headers,
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
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /stripe/subscribe/edit Edit Stripe subscription
 * @apiName StripeSubscribeEdit
 * @apiGroup Payments
 *
 * @apiParam {String} id Body parameter - The token
 *
 * @apiSuccess {Object} data Empty object
 **/
api.subscribeEdit = {
  method: 'POST',
  url: '/stripe/subscribe/edit',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let token = req.body.id;
    let user = res.locals.user;
    let customerId = user.purchased.plan.customerId;

    if (!customerId) throw new NotAuthorized(res.t('missingSubscription'));
    if (!token) throw new BadRequest('Missing req.body.id');

    let subscriptions = await stripe.customers.listSubscriptions(customerId);
    let subscriptionId = subscriptions.data[0].id;
    await stripe.customers.updateSubscription(customerId, subscriptionId, { card: token });

    res.respond(200, {});
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /stripe/subscribe/cancel Cancel Stripe subscription
 * @apiName StripeSubscribeCancel
 * @apiGroup Payments
 **/
api.subscribeCancel = {
  method: 'GET',
  url: '/stripe/subscribe/cancel',
  middlewares: [authWithUrl],
  async handler (req, res) {
    let user = res.locals.user;
    if (!user.purchased.plan.customerId) throw new NotAuthorized(res.t('missingSubscription'));

    let customer = await stripe.customers.retrieve(user.purchased.plan.customerId);
    await stripe.customers.del(user.purchased.plan.customerId);
    await payments.cancelSubscription({
      user,
      nextBill: customer.subscription.current_period_end * 1000, // timestamp in seconds
      paymentMethod: 'Stripe',
    });

    res.redirect('/');
  },
};

module.exports = api;
