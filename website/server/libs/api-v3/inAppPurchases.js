import nconf from 'nconf';
import iap from 'in-app-purchase';
import payments from './payments';
import { model as IapPurchaseReceipt } from '../../models/iapPurchaseReceipt';
import Bluebird from 'bluebird';
import logger from './logger';

// Validation ERROR Codes
// const INVALID_PAYLOAD = 6778001;
// const CONNECTION_FAILED = 6778002;
// const PURCHASE_EXPIRED = 6778003;

iap.config({
  // This is the path to the directory containing iap-sanbox/iap-live files
  googlePublicKeyPath: nconf.get('IAP_GOOGLE_KEYDIR'),
});

module.exports = {
  setup: Bluebird.promisify(iap.setup, { context: iap }),
  validate: Bluebird.promisify(iap.validate, { context: iap }),
  GOOGLE: iap.GOOGLE,
};

async function iapIOSVerify (user, iapBody) {
  // Defining these 2 variables here so they can be logged in case of error
  let token;
  let appleRes;

  try {
    await iapSetup();
    appleRes = await iapValidate(iap.APPLE, iapBody.transaction.receipt);

    if (iap.isValidated(appleRes)) {
      token = appleRes.receipt.transactionIdentifier;

      console.log(JSON.stringify(appleRes), JSON.stringify(appleRes.receipt));

      let existingReceipt = await IapPurchaseReceipt.findOne({
        _id: token,
      }).exec();

      if (!existingReceipt) {
        await IapPurchaseReceipt.create({
          _id: token,
          consumed: true,
          userId: user._id,
        });
      } else {
        throw new Error('RECEIPT_ALREADY_USED');
      }

      let purchaseDataList = iap.getPurchaseData(appleRes);
      if (purchaseDataList.length === 0) throw new Error('NO_ITEM_PURCHASED');

      let correctReceipt = true;

      // Purchasing one item at a time (processing of await(s) below is sequential not parallel)
      for (let index in purchaseDataList) {
        switch (purchaseDataList[index].productId) {
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
    } else {
      throw new Error('INVALID_RECEIPT');
    }
  } catch (err) {
    logger.error(err, {
      userId: user._id,
      iapBody,
      appleRes,
      token,
    });

    return {
      ok: false,
      data: 'An error occurred while processing the purchase.',
    };
  }
}