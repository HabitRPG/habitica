import {
  authWithHeaders,
  authWithUrl,
} from '../../../middlewares/api-v3/auth';
import {
  iapAndroidVerify,
  iapIOSVerify,
} from '../../../libs/api-v3/inAppPurchases';

// IMPORTANT: NOT PORTED TO v3 standards (not using res.respond)

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
    let resObject = await iapAndroidVerify(res.locals.user, req.body);
    return res.json(resObject);
  },
};

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
    return res.json(resObject);
  },
};

module.exports = api;
