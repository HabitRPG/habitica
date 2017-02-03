import nconf from 'nconf';
import iap from 'in-app-purchase';
import Bluebird from 'bluebird';

// Validation ERROR Codes
// const INVALID_PAYLOAD = 6778001;
// const CONNECTION_FAILED = 6778002;
// const PURCHASE_EXPIRED = 6778003;

// We are using this PR instead of the main release: https://github.com/voltrue2/in-app-purchase/pull/74
// Reason: Without the PR, the library attempts to validate IAP products as subscriptions and fails.
iap.config({
  // This is the path to the directory containing iap-sanbox/iap-live files
  googlePublicKeyPath: nconf.get('IAP_GOOGLE_KEYDIR'),
  googleAccToken: nconf.get('PLAY_API:ACCESS_TOKEN'),
  googleRefToken: nconf.get('PLAY_API:REFRESH_TOKEN'),
  googleClientID: nconf.get('PLAY_API:CLIENT_ID'),
  googleClientSecret: nconf.get('PLAY_API:CLIENT_SECRET'),
});

module.exports = {
  setup: Bluebird.promisify(iap.setup, { context: iap }),
  validate: Bluebird.promisify(iap.validate, { context: iap }),
  isValidated: iap.isValidated,
  getPurchaseData: iap.getPurchaseData,
  GOOGLE: iap.GOOGLE,
  APPLE: iap.APPLE,
};
