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

    if (iap.isValidated(googleRes)) {
      let receiptObj = JSON.parse(testObj.data); // passed as a string
      let token = receiptObj.token || receiptObj.purchaseToken;

      let existingReceipt = await IapPurchaseReceipt.findOne({
        _id: token,
      }).exec();

      if (!existingReceipt) {
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
      } else {
        throw new NotAuthorized('RECEIPT_ALREADY_USED');
      }
    } else {
      throw new NotAuthorized('INVALID_RECEIPT');
    }

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
    let resObject = await iapIOSVerify(res.locals.user, req.body);

    return res
      .status(resObject.ok === true ? 200 : 500)
      .json(resObject);
  },
};

module.exports = api;
