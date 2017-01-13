import stripeModule from 'stripe';
import nconf from 'nconf';

import shared from '../../../../common';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../../libs/errors';
import { model as Coupon } from '../../../models/coupon';
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
import payments from '../../../libs/payments';
import stripePayments from '../../../libs/payments';

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

    await stripePayments.checkout({token, user, gift, sub, groupId, coupon});

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

    await stripePayments.editSubscription({token, groupId, user});

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
    let redirect = req.query.redirect;
    console.log(stripePayments.cancelSubscription)
    await stripePayments.cancelSubscription({user, groupId});

    if (redirect === 'none') return res.respond(200, {});
    return res.redirect('/');
  },
};

module.exports = api;
