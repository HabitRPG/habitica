import stripeModule from 'stripe';
import shared from '../../../../common';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../../libs/errors';
import { model as Coupon } from '../../../models/coupon';
import payments from '../../../libs/payments';
import nconf from 'nconf';
import { model as User } from '../../../models/user';
import {
  model as Group,
  basicFields as basicGroupFields,
} from '../../../models/group';
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
    let groupId = req.query.groupId;
    let coupon;
    let response;
    let subscriptionId;

    // @TODO: Update this to use payments.payWithStripe

    if (!token) throw new BadRequest('Missing req.body.id');

    if (sub) {
      if (sub.discount) {
        if (!req.query.coupon) throw new BadRequest(res.t('couponCodeRequired'));
        coupon = await Coupon.findOne({_id: cc.validate(req.query.coupon), event: sub.key});
        if (!coupon) throw new BadRequest(res.t('invalidCoupon'));
      }

      let customerObject = {
        email: req.body.email,
        metadata: { uuid: user._id },
        card: token,
        plan: sub.key,
      };

      if (groupId) {
        customerObject.quantity = sub.quantity;
      }

      response = await stripe.customers.create(customerObject);

      if (groupId) subscriptionId = response.subscriptions.data[0].id;
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
        groupId,
        subscriptionId,
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
        data.paymentMethod = 'Stripe (Gift)';
      }

      await payments[method](data);

      if (gift && gift.type === 'subscription' && gift.member._id !== user._id) {
        gift.member = user;
        await payments.createSubscription(data);
      }
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
    let groupId = req.body.groupId;
    let user = res.locals.user;
    let customerId;

    //  If we are buying a group subscription
    if (groupId) {
      let groupFields = basicGroupFields.concat(' purchased');
      let group = await Group.getGroup({user, groupId, populateLeader: false, groupFields});

      if (!group) {
        throw new NotFound(res.t('groupNotFound'));
      }

      let allowedManagers = [group.leader, group.purchased.plan.owner];

      if (allowedManagers.indexOf(user._id) === -1) {
        throw new NotAuthorized(res.t('onlyGroupLeaderCanManageSubscription'));
      }
      customerId = group.purchased.plan.customerId;
    } else {
      customerId = user.purchased.plan.customerId;
    }

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
    let groupId = req.query.groupId;
    let customerId;

    if (groupId) {
      let groupFields = basicGroupFields.concat(' purchased');
      let group = await Group.getGroup({user, groupId, populateLeader: false, groupFields});

      if (!group) {
        throw new NotFound(res.t('groupNotFound'));
      }

      if (!group.leader === user._id) {
        throw new NotAuthorized(res.t('onlyGroupLeaderCanManageSubscription'));
      }
      customerId = group.purchased.plan.customerId;
    } else {
      customerId = user.purchased.plan.customerId;
    }

    if (!customerId) throw new NotAuthorized(res.t('missingSubscription'));

    let customer = await stripe.customers.retrieve(customerId);

    let subscription = customer.subscription;
    if (!subscription) {
      subscription = customer.subscriptions.data[0];
    }

    await stripe.customers.del(customerId);
    await payments.cancelSubscription({
      user,
      groupId,
      nextBill: subscription.current_period_end * 1000, // timestamp in seconds
      paymentMethod: 'Stripe',
    });

    res.redirect('/');
  },
};

module.exports = api;
