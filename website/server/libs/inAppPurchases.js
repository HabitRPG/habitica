import nconf from 'nconf';
import util from 'util';
import iap from 'in-app-purchase';

// Validation ERROR Codes
// const INVALID_PAYLOAD = 6778001;
// const CONNECTION_FAILED = 6778002;
// const PURCHASE_EXPIRED = 6778003;

iap.config({
  // This is the path to the directory containing iap-sanbox/iap-live files
  googlePublicKeyPath: nconf.get('IAP_GOOGLE_KEYDIR'),
  googleAccToken: nconf.get('PLAY_API_ACCESS_TOKEN'),
  googleRefToken: nconf.get('PLAY_API_REFRESH_TOKEN'),
  googleClientID: nconf.get('PLAY_API_CLIENT_ID'),
  googleClientSecret: nconf.get('PLAY_API_CLIENT_SECRET'),
  applePassword: nconf.get('ITUNES_SHARED_SECRET'),
});

export default {
  setup: util.promisify(iap.setup.bind(iap)),
  validate: util.promisify(iap.validate.bind(iap)),
  isValidated: iap.isValidated,
  isCanceled: iap.isCanceled,
  isExpired: iap.isExpired,
  getPurchaseData: iap.getPurchaseData,
  GOOGLE: iap.GOOGLE,
  APPLE: iap.APPLE,
};
