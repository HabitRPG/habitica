import {
  authWithHeaders,
} from '../../../middlewares/auth';
import {
  BadRequest,
} from '../../../libs/errors';
import googlePayments from '../../../libs/payments/google';
import applePayments from '../../../libs/payments/apple';

const api = {};

// TODO missing tests

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /iap/android/verify Android Verify IAP
 * @apiName IapAndroidVerify
 * @apiGroup Payments
 * */
api.iapAndroidVerify = {
  method: 'POST',
  url: '/iap/android/verify',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    if (!req.body.transaction) throw new BadRequest(res.t('missingReceipt'));
    const googleRes = await googlePayments.verifyPurchase({
      user: res.locals.user,
      receipt: req.body.transaction.receipt,
      signature: req.body.transaction.signature,
      gift: req.body.gift,
      headers: req.headers,
    });
    res.respond(200, googleRes);
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /iap/android/subscription Android Subscribe
 * @apiName IapAndroidSubscribe
 * @apiGroup Payments
 * */
api.iapSubscriptionAndroid = {
  method: 'POST',
  url: '/iap/android/subscribe',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    if (!req.body.sku) throw new BadRequest(res.t('missingSubscriptionCode'));
    await googlePayments.subscribe(
      req.body.sku,
      res.locals.user,
      req.body.transaction.receipt,
      req.body.transaction.signature,
      req.headers,
    );

    res.respond(200);
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /iap/android/norenew-subscribe Android non-renewing subscription IAP
 * @apiName iapSubscriptionAndroidNoRenew
 * @apiGroup Payments
 * */
api.iapSubscriptionAndroidNoRenew = {
  method: 'POST',
  url: '/iap/android/norenew-subscribe',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    if (!req.body.sku) throw new BadRequest(res.t('missingSubscriptionCode'));
    if (!req.body.transaction) throw new BadRequest(res.t('missingReceipt'));

    await googlePayments.noRenewSubscribe({
      sku: req.body.sku,
      user: res.locals.user,
      receipt: req.body.transaction.receipt,
      signature: req.body.transaction.signature,
      gift: req.body.gift,
      headers: req.headers,
    });

    res.respond(200);
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /iap/android/subscribe/cancel Google Payments: subscribe cancel
 * @apiName AndroidSubscribeCancel
 * @apiGroup Payments
 * */
api.iapCancelSubscriptionAndroid = {
  method: 'GET',
  url: '/iap/android/subscribe/cancel',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

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
 * */
api.iapiOSVerify = {
  method: 'POST',
  url: '/iap/ios/verify',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    if (!req.body.transaction) throw new BadRequest(res.t('missingReceipt'));
    const appleRes = await applePayments.verifyPurchase({
      user: res.locals.user,
      receipt: req.body.transaction.receipt,
      gift: req.body.gift,
      headers: req.headers,
    });
    res.respond(200, appleRes);
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /iap/android/subscription iOS Subscribe
 * @apiName IapiOSSubscribe
 * @apiGroup Payments
 * */
api.iapSubscriptioniOS = {
  method: 'POST',
  url: '/iap/ios/subscribe',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    if (!req.body.sku) throw new BadRequest(res.t('missingSubscriptionCode'));
    if (!req.body.receipt) throw new BadRequest(res.t('missingReceipt'));

    await applePayments.subscribe(res.locals.user, req.body.receipt, req.headers);

    res.respond(200);
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /iap/android/subscribe/cancel Apple Payments: subscribe cancel
 * @apiName iOSSubscribeCancel
 * @apiGroup Payments
 * */
api.iapCancelSubscriptioniOS = {
  method: 'GET',
  url: '/iap/ios/subscribe/cancel',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    await applePayments.cancelSubscribe(user, req.headers);

    if (req.query.noRedirect) {
      res.respond(200);
    } else {
      res.redirect('/');
    }
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /iap/ios/norenew-subscribe iOS Verify IAP
 * @apiName IapiOSVerify
 * @apiGroup Payments
 * */
api.iapSubscriptioniOSNoRenew = {
  method: 'POST',
  url: '/iap/ios/norenew-subscribe',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    if (!req.body.sku) throw new BadRequest(res.t('missingSubscriptionCode'));
    if (!req.body.transaction) throw new BadRequest(res.t('missingReceipt'));

    await applePayments.noRenewSubscribe({
      sku: req.body.sku,
      user: res.locals.user,
      receipt: req.body.transaction.receipt,
      gift: req.body.gift,
      headers: req.headers,
    });

    res.respond(200);
  },
};

export default api;
