import nconf from 'nconf';
import iap from 'in-app-purchase';
import Bluebird from 'bluebird';

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
  isValidated: iap.isValidated,
  getPurchaseData: iap.getPurchaseData,
  GOOGLE: iap.GOOGLE,
  APPLE: iap.APPLE,
};
