import {
  authWithHeaders,
  authWithUrl,
} from '../../../middlewares/auth';
import {
  BadRequest,
} from '../../../libs/errors';
import googlePayments from '../../../libs/googlePayments';
import applePayments from '../../../libs/applePayments';

let api = {};

// TODO missing tests

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /iap/android/verify Android Verify IAP
 * @apiName IapAndroidVerify
 * @apiGroup Payments
 **/
api.iapAndroidVerify = {
  method: 'POST',
  url: '/iap/android/verify',
  middlewares: [authWithUrl],
  async handler (req, res) {
    let user = res.locals.user;
    let iapBody = req.body;

    let googleRes = await googlePayments.verifyGemPurchase(user, iapBody.transaction.receipt, iapBody.transaction.signature, req.headers);

    res.respond(200, googleRes);
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /iap/android/subscription Android Subscribe
 * @apiName IapAndroidSubscribe
 * @apiGroup Payments
 **/
api.iapSubscriptionAndroid = {
  method: 'POST',
  url: '/iap/android/subscribe',
  middlewares: [authWithUrl],
  async handler (req, res) {
    if (!req.body.sku) throw new BadRequest(res.t('missingSubscriptionCode'));
    let user = res.locals.user;
    let iapBody = req.body;

    await googlePayments.subscribe(req.body.sku, user, iapBody.transaction.receipt, iapBody.transaction.signature, req.headers);

    res.respond(200);
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /iap/android/subscribe/cancel Google Payments: subscribe cancel
 * @apiName AndroidSubscribeCancel
 * @apiGroup Payments
 **/
api.iapCancelSubscriptionAndroid = {
  method: 'GET',
  url: '/iap/android/subscribe/cancel',
  middlewares: [authWithUrl],
  async handler (req, res) {
    let user = res.locals.user;

    await googlePayments.cancelSubscribe(user, req.headers);

    if (req.query.noRedirect) {
      res.respond(200);
    } else {
      res.redirect('/');
    }
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /iap/ios/verify iOS Verify IAP
 * @apiName IapiOSVerify
 * @apiGroup Payments
 **/
api.iapiOSVerify = {
  method: 'POST',
  url: '/iap/ios/verify',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    if (!req.body.transaction) throw new BadRequest(res.t('missingReceipt'));

    let appleRes = await applePayments.verifyGemPurchase(res.locals.user, req.body.transaction.receipt, req.headers);

    res.respond(200, appleRes);
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /iap/android/subscription iOS Subscribe
 * @apiName IapiOSSubscribe
 * @apiGroup Payments
 **/
api.iapSubscriptioniOS = {
  method: 'POST',
  url: '/iap/ios/subscribe',
  middlewares: [authWithUrl],
  async handler (req, res) {
    if (!req.body.sku) throw new BadRequest(res.t('missingSubscriptionCode'));
    if (!req.body.receipt) throw new BadRequest(res.t('missingReceipt'));

    await applePayments.subscribe(req.body.sku, res.locals.user, req.body.receipt, req.headers);

    res.respond(200);
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /iap/android/subscribe/cancel Apple Payments: subscribe cancel
 * @apiName iOSSubscribeCancel
 * @apiGroup Payments
 **/
api.iapCancelSubscriptioniOS = {
  method: 'GET',
  url: '/iap/ios/subscribe/cancel',
  middlewares: [authWithUrl],
  async handler (req, res) {
    let user = res.locals.user;

    await applePayments.cancelSubscribe(user, req.headers);

    if (req.query.noRedirect) {
      res.respond(200);
    } else {
      res.redirect('/');
    }
  },
};

module.exports = api;
