import {
  authWithHeaders,
  authWithUrl,
} from '../../../middlewares/api-v3/auth';
import iap from '../../../libs/api-v3/inAppPurchases';
import payments from '../../../libs/api-v3/payments';
import {
  NotAuthorized,
} from '../../../libs/api-v3/errors';
import { model as IapPurchaseReceipt } from '../../../models/iapPurchaseReceipt';
import logger from '../../../libs/api-v3/logger';

let api = {};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /iap/android/verify Android Verify IAP
 * @apiVersion 3.0.0
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

    await payments.buyGems({
      user,
      paymentMethod: 'IAP GooglePlay',
      amount: 5.25,
    });

    res.respond(200, googleRes);
  },
};

// IMPORTANT: NOT PORTED TO v3 standards (not using res.respond)

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /iap/ios/verify iOS Verify IAP
 * @apiVersion 3.0.0
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
    let token;

    try {
      await iap.setup();

      appleRes = await iap.validate(iap.APPLE, iapBody.transaction.receipt);
      let isValidated = iap.isValidated(appleRes);
      if (!isValidated) throw new Error('INVALID_RECEIPT');

      let purchaseDataList = iap.getPurchaseData(appleRes);
      if (purchaseDataList.length === 0) throw new Error('NO_ITEM_PURCHASED');

      let correctReceipt = true;

      // Purchasing one item at a time (processing of await(s) below is sequential not parallel)
      for (let purchaseData of purchaseDataList) {
        token = purchaseData.transactionId;

        let existingReceipt = await IapPurchaseReceipt.findOne({ // eslint-disable-line babel/no-await-in-loop
          _id: token,
        }).exec();

        if (!existingReceipt) {
          await IapPurchaseReceipt.create({ // eslint-disable-line babel/no-await-in-loop
            _id: token,
            consumed: true,
            userId: user._id,
          });
        } else {
          throw new Error('RECEIPT_ALREADY_USED');
        }

        switch (purchaseData.productId) {
          case 'com.habitrpg.ios.Habitica.4gems':
            await payments.buyGems({user, paymentMethod: 'IAP AppleStore', amount: 1}); // eslint-disable-line babel/no-await-in-loop
            break;
          case 'com.habitrpg.ios.Habitica.8gems':
            await payments.buyGems({user, paymentMethod: 'IAP AppleStore', amount: 2}); // eslint-disable-line babel/no-await-in-loop
            break;
          case 'com.habitrpg.ios.Habitica.20gems':
          case 'com.habitrpg.ios.Habitica.21gems':
            await payments.buyGems({user, paymentMethod: 'IAP AppleStore', amount: 5.25}); // eslint-disable-line babel/no-await-in-loop
            break;
          case 'com.habitrpg.ios.Habitica.42gems':
            await payments.buyGems({user, paymentMethod: 'IAP AppleStore', amount: 10.5}); // eslint-disable-line babel/no-await-in-loop
            break;
          default:
            correctReceipt = false;
        }
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
