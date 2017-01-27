import {
  authWithHeaders,
  authWithUrl,
} from '../../../middlewares/auth';
import iap from '../../../libs/inAppPurchases';
import payments from '../../../libs/payments';
import {
  BadRequest,
} from '../../../libs/errors';
import { model as IapPurchaseReceipt } from '../../../models/iapPurchaseReceipt';
import logger from '../../../libs/logger';
import googlePayments from '../../../libs/googlePayments';

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
 * @apiName IapAndroidSubscribeCancel
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
