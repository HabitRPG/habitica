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
  model as Group,
  basicFields as basicGroupFields,
} from '../../../models/group';
import {
  authWithUrl,
  authWithSession,
} from '../../../middlewares/auth';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../../libs/errors';


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

    let link = await paypalPayments.checkout({gift});

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
    let user = res.locals.user;
    let gift = req.session.gift ? JSON.parse(req.session.gift) : undefined;
    delete req.session.gift;

    await paypalPayments.checkoutSuccess();

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

    let link = await paypalPayments.subscribe();

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
    let groupId = req.session.groupId;

    delete req.session.paypalBlock;
    delete req.session.groupId;

    await paypalPayments.subscribeSuccess();

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
    let groupId = req.query.groupId;

    await paypalPayments.subscribeCancel({user, groupId});

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

    await paypalPayments.ipn();
  },
};

module.exports = api;
