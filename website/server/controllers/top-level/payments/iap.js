import iap from 'in-app-purchase';
import nconf from 'nconf';
import {
  authWithHeaders,
  authWithUrl,
} from '../../../middlewares/api-v3/auth';
import payments from '../../../libs/api-v3/payments';

// NOT PORTED TO v3

iap.config({
  // this is the path to the directory containing iap-sanbox/iap-live files
  googlePublicKeyPath: nconf.get('IAP_GOOGLE_KEYDIR'),
});

// Validation ERROR Codes
const INVALID_PAYLOAD = 6778001;
// const CONNECTION_FAILED = 6778002;
// const PURCHASE_EXPIRED = 6778003;

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

    iap.setup((error) => {
      if (error) {
        let resObj = {
          ok: false,
          data: 'IAP Error',
        };

        return res.json(resObj);
      }

      // google receipt must be provided as an object
      // {
      //   "data": "{stringified data object}",
      //   "signature": "signature from google"
      // }
      let testObj = {
        data: iapBody.transaction.receipt,
        signature: iapBody.transaction.signature,
      };

      // iap is ready
      iap.validate(iap.GOOGLE, testObj, (err, googleRes) => {
        if (err) {
          let resObj = {
            ok: false,
            data: {
              code: INVALID_PAYLOAD,
              message: err.toString(),
            },
          };

          return res.json(resObj);
        }

        if (iap.isValidated(googleRes)) {
          let resObj = {
            ok: true,
            data: googleRes,
          };

          payments.buyGems({
            user,
            paymentMethod: 'IAP GooglePlay',
            amount: 5.25,
          }).then(() => res.json(resObj));
        }
      });
    });
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
    let iapBody = req.body;
    let user = res.locals.user;

    iap.setup(function iosSetupResult (error) {
      if (error) {
        let resObj = {
          ok: false,
          data: 'IAP Error',
        };

        return res.json(resObj);
      }

      // iap is ready
      iap.validate(iap.APPLE, iapBody.transaction.receipt, (err, appleRes) => {
        if (err) {
          let resObj = {
            ok: false,
            data: {
              code: INVALID_PAYLOAD,
              message: err.toString(),
            },
          };

          return res.json(resObj);
        }

        if (iap.isValidated(appleRes)) {
          let purchaseDataList = iap.getPurchaseData(appleRes);
          if (purchaseDataList.length > 0) {
            let correctReceipt = true;

            for (let index in purchaseDataList) {
              switch (purchaseDataList[index].productId) {
                case 'com.habitrpg.ios.Habitica.4gems':
                  payments.buyGems({user, paymentMethod: 'IAP AppleStore', amount: 1});
                  break;
                case 'com.habitrpg.ios.Habitica.8gems':
                  payments.buyGems({user, paymentMethod: 'IAP AppleStore', amount: 2});
                  break;
                case 'com.habitrpg.ios.Habitica.20gems':
                case 'com.habitrpg.ios.Habitica.21gems':
                  payments.buyGems({user, paymentMethod: 'IAP AppleStore', amount: 5.25});
                  break;
                case 'com.habitrpg.ios.Habitica.42gems':
                  payments.buyGems({user, paymentMethod: 'IAP AppleStore', amount: 10.5});
                  break;
                default:
                  correctReceipt = false;
              }
            }

            if (correctReceipt) {
              let resObj = {
                ok: true,
                data: appleRes,
              };

              // yay good!
              return res.json(resObj);
            }
          }

          // wrong receipt content
          let resObj = {
            ok: false,
            data: {
              code: INVALID_PAYLOAD,
              message: 'Incorrect receipt content',
            },
          };

          return res.json(resObj);
        }

        // invalid receipt
        let resObj = {
          ok: false,
          data: {
            code: INVALID_PAYLOAD,
            message: 'Invalid receipt',
          },
        };

        return res.json(resObj);
      });
    });
  },
};

module.exports = api;
