import nconf from 'nconf';
import iap from 'in-app-purchase';
import payments from './payments';
import { model as IapPurchaseReceipt } from '../../models/iapPurchaseReceipt';
import Bluebird from 'bluebird';

// Validation ERROR Codes
const INVALID_PAYLOAD = 6778001;
// const CONNECTION_FAILED = 6778002;
// const PURCHASE_EXPIRED = 6778003;

iap.config({
  // this is the path to the directory containing iap-sanbox/iap-live files
  googlePublicKeyPath: nconf.get('IAP_GOOGLE_KEYDIR'),
});

let iapSetup = Bluebird.promisify(iap.setup, { context: iap });
let iapValidate = Bluebird.promisify(iap.validate, { context: iap });

async function iapAndroidVerify (user, iapBody) {
  try {
    await iapSetup();
    let testObj = {
      data: iapBody.transaction.receipt,
      signature: iapBody.transaction.signature,
    };

    try {
      let googleRes = iapValidate(iap.GOOGLE, testObj);

      if (iap.isValidated(googleRes)) {
        let resObj = {
          ok: true,
          data: googleRes,
        };

        let token = testObj.data.token;
        if (!token) token = testObj.data.purchaseToken;

        let existingReceipt = await IapPurchaseReceipt.findOne({
          _id: token,
        }).exec();

        if (!existingReceipt) {
          try {
            await IapPurchaseReceipt.create({
              token,
              consumed: true,
              userID: user._id,
            });

            await payments.buyGems({
              user,
              paymentMethod: 'IAP GooglePlay',
              amount: 5.25,
            });

            return resObj;
          } catch (err) {
            return resObj;
          }
        } else {
          return resObj;
        }
      }
    } catch (error) {
      return {
        ok: false,
        data: {
          code: INVALID_PAYLOAD,
          message: error.toString(),
        },
      };
    }
  } catch (error) {
    return {
      ok: false,
      data: 'IAP Error',
    };
  }
}

async function iapIOSVerify (user, iapBody) {
  iap.setup(function iosSetupResult (error) {
    if (error) {
      let resObj = {
        ok: false,
        data: 'IAP Error',
      };

      return resObj;
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

        return resObj;
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
            return resObj;
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

        return resObj;
      }

      // invalid receipt
      let resObj = {
        ok: false,
        data: {
          code: INVALID_PAYLOAD,
          message: 'Invalid receipt',
        },
      };

      return resObj;
    });
  });
}


module.exports = {
  iapAndroidVerify,
  iapIOSVerify,
  iapSetup,
};