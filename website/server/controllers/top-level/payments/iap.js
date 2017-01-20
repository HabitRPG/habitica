import {
  authWithHeaders,
  authWithUrl,
} from '../../../middlewares/auth';
import shared from '../../../../common';
import iap from '../../../libs/inAppPurchases';
import payments from '../../../libs/payments';
import {
  NotAuthorized,
  BadRequest,
} from '../../../libs/errors';
import { model as IapPurchaseReceipt } from '../../../models/iapPurchaseReceipt';
import {model as User } from '../../../models/user';
import logger from '../../../libs/logger';
import moment from 'moment';

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

    await iap.setup();

    let testObj = {
      data: iapBody.transaction.receipt,
      signature: iapBody.transaction.signature,
    };

    let googleRes = await iap.validate(iap.GOOGLE, testObj);

    let isValidated = iap.isValidated(googleRes);
    if (!isValidated) throw new NotAuthorized('INVALID_RECEIPT');

    let receiptObj = JSON.parse(testObj.data); // passed as a string
    let token = receiptObj.token || receiptObj.purchaseToken;

    let existingReceipt = await IapPurchaseReceipt.findOne({
      _id: token,
    }).exec();
    if (existingReceipt) throw new NotAuthorized('RECEIPT_ALREADY_USED');

    await IapPurchaseReceipt.create({
      _id: token,
      consumed: true,
      userId: user._id,
    });

    let amount;

    switch (receiptObj.productId) {
      case 'com.habitrpg.android.habitica.iap.4gems':
        amount = 1;
        break;
      case 'com.habitrpg.android.habitica.iap.20.gems':
      case 'com.habitrpg.android.habitica.iap.21gems':
        amount = 5.25;
        break;
      case 'com.habitrpg.android.habitica.iap.42gems':
        amount = 10.5;
        break;
      case 'com.habitrpg.android.habitica.iap.84gems':
        amount = 21;
        break;
    }

    if (!amount) throw new Error('INVALID_ITEM_PURCHASED');

    await payments.buyGems({
      user,
      paymentMethod: 'IAP GooglePlay',
      amount,
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
 **/
api.iapSubscriptionAndroid = {
  method: 'POST',
  url: '/iap/android/subscribe',
  middlewares: [authWithUrl],
  async handler (req, res) {
    let subCode;
    switch (req.body.sku) {
      case 'com.habitrpg.android.habitica.subscription.1month':
        subCode = 'basic_earned';
        break;
      case 'com.habitrpg.android.habitica.subscription.3month':
        subCode = 'basic_3mo';
        break;
      case 'com.habitrpg.android.habitica.subscription.6month':
        subCode = 'basic_6mo';
        break;
      case 'com.habitrpg.android.habitica.subscription.12month':
        subCode = 'basic_12mo';
        break;
    }
    let sub = subCode ? shared.content.subscriptionBlocks[subCode] : false;

    if (!req.body.sku) throw new BadRequest(res.t('missingSubscriptionCode'));

    let user = res.locals.user;
    let iapBody = req.body;


    await iap.setup();

    let testObj = {
      data: iapBody.transaction.receipt,
      signature: iapBody.transaction.signature,
    };

    let receiptObj = JSON.parse(testObj.data); // passed as a string
    let token = receiptObj.token || receiptObj.purchaseToken;

    let existingUser = await User.findOne({
      'payments.plan.customerId': token,
    }).exec();
    if (existingUser) throw new NotAuthorized('RECEIPT_ALREADY_USED');

    let googleRes = await iap.validate(iap.GOOGLE, testObj);

    let isValidated = iap.isValidated(googleRes);
    if (!isValidated) throw new NotAuthorized('INVALID_RECEIPT');

    await payments.createSubscription({
      user,
      customerId: token,
      paymentMethod: 'Google',
      sub,
      headers: req.headers,
      nextPaymentProcessing: moment.utc().add({days: 2}),
      nextBillingDate: googleRes.expirationDate,
      additionalData: testObj,
    });

    res.respond(200);
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /amazon/subscribe/cancel Amazon Payments: subscribe cancel
 * @apiName AmazonSubscribe
 * @apiGroup Payments
 **/
api.iapCancelSubscriptionAndroid = {
  method: 'GET',
  url: '/iap/android/subscribe/cancel',
  middlewares: [authWithUrl],
  async handler (req, res) {
    let user = res.locals.user;

    let data;

    let data = user.purchased.plan.additionalData;

    if (!data) throw new NotAuthorized(res.t('missingSubscription'));

    await iap.setup();

    let googleRes = await iap.validate(iap.GOOGLE, data);

    let isValidated = iap.isValidated(googleRes);
    if (!isValidated) throw new NotAuthorized('INVALID_RECEIPT');

    let purchases = iap.getPurchaseData(googleRes);
    if (purchases.length === 0) throw new NotAuthorized('INVALID_RECEIPT');
    let subscriptionData = purchases[0];

    let dateTerminated = new Date(Number(subscriptionData.expirationDate));
    if (dateTerminated > new Date()) throw new NotAuthorized('SUBSCRIPTION_STILL_VALID');

    await payments.cancelSubscription({
      user,
      nextBill: dateTerminated,
      paymentMethod: 'Google',
      headers: req.headers,
    });

    if (req.query.noRedirect) {
      res.respond(200);
    } else {
      res.redirect('/');
    }
  },
};

// IMPORTANT: NOT PORTED TO v3 standards (not using res.respond)

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
    let user = res.locals.user;
    let iapBody = req.body;

    let appleRes;

    try {
      await iap.setup();

      appleRes = await iap.validate(iap.APPLE, iapBody.transaction.receipt);
      let isValidated = iap.isValidated(appleRes);
      if (!isValidated) throw new Error('INVALID_RECEIPT');

      let purchaseDataList = iap.getPurchaseData(appleRes);
      if (purchaseDataList.length === 0) throw new Error('NO_ITEM_PURCHASED');

      let correctReceipt = true;

      // Purchasing one item at a time (processing of await(s) below is sequential not parallel)
      for (let index in purchaseDataList) {
        let purchaseData = purchaseDataList[index];
        let token = purchaseData.transactionId;

        let existingReceipt = await IapPurchaseReceipt.findOne({ // eslint-disable-line no-await-in-loop
          _id: token,
        }).exec();

        if (!existingReceipt) {
          await IapPurchaseReceipt.create({ // eslint-disable-line no-await-in-loop
            _id: token,
            consumed: true,
            userId: user._id,
          });
        } else {
          throw new Error('RECEIPT_ALREADY_USED');
        }

        let amount;
        switch (purchaseData.productId) {
          case 'com.habitrpg.ios.Habitica.4gems':
            amount = 1;
            break;
          case 'com.habitrpg.ios.Habitica.20gems':
          case 'com.habitrpg.ios.Habitica.21gems':
            amount = 5.25;
            break;
          case 'com.habitrpg.ios.Habitica.42gems':
            amount = 10.5;
            break;
          case 'com.habitrpg.ios.Habitica.84gems':
            amount = 21;
            break;
        }
        if (!amount) {
          correctReceipt = false;
          break;
        }

        await payments.buyGems({ // eslint-disable-line no-await-in-loop
          user,
          paymentMethod: 'IAP AppleStore',
          amount,
          headers: req.headers,
        });
      }

      if (!correctReceipt) throw new Error('INVALID_ITEM_PURCHASED');

      return res.status(200).json({
        ok: true,
        data: appleRes,
      });
    } catch (err) {
      logger.error(err, {
        userId: user._id,
        iapBody,
        appleRes,
      });

      return res.status(500).json({
        ok: false,
        data: 'An error occurred while processing the purchase.',
      });
    }
  },
};

module.exports = api;
