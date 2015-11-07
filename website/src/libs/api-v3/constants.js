// Exports constants used throughout the app
import nconf from 'nconf';

const IS_PROD = nconf.get('NODE_ENV') === 'production';
const IS_DEV = nconf.get('NODE_ENV') === 'development';

export default {
  IS_PROD: IS_PROD,
  IS_DEV: IS_DEV,
}
