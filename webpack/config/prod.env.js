const nconf = require('nconf');
const { join, resolve } = require('path');

const PATH_TO_CONFIG = join(resolve(__dirname, '../../config.json'));
let configFile = PATH_TO_CONFIG;

nconf
  .argv()
  .env()
  .file('user', configFile);

nconf.set('IS_PROD', nconf.get('NODE_ENV') === 'production');
nconf.set('IS_DEV', nconf.get('NODE_ENV') === 'development');
nconf.set('IS_TEST', nconf.get('NODE_ENV') === 'test');

// @TODO: Check if we can import from client. Items like admin emails can be imported
// and that should be prefered

// To avoid stringifying more data then we need,
// items from `env` used on the client will have to be specified in this array
// @TODO: Do we need? const CLIENT_VARS = ['language', 'isStaticPage', 'availableLanguages', 'translations',
//                      'FACEBOOK_KEY', 'GOOGLE_CLIENT_ID', 'NODE_ENV', 'BASE_URL', 'GA_ID',
//                      'AMAZON_PAYMENTS', 'STRIPE_PUB_KEY', 'AMPLITUDE_KEY',
//                      'worldDmg', 'mods', 'IS_MOBILE', 'PUSHER:KEY', 'PUSHER:ENABLED'];

let env = {
  NODE_ENV: '"production"',
  // clientVars: CLIENT_VARS,
  AMAZON_PAYMENTS: {
    SELLER_ID: `"${nconf.get('AMAZON_PAYMENTS:SELLER_ID')}"`,
    CLIENT_ID: `"${nconf.get('AMAZON_PAYMENTS:CLIENT_ID')}"`,
  },
  EMAILS: {
    COMMUNITY_MANAGER_EMAIL: `"${nconf.get('EMAILS:COMMUNITY_MANAGER_EMAIL')}"`,
    TECH_ASSISTANCE_EMAIL: `"${nconf.get('EMAILS:TECH_ASSISTANCE_EMAIL')}"`,
    PRESS_ENQUIRY_EMAIL: `"${nconf.get('EMAILS:PRESS_ENQUIRY_EMAIL')}"`,
  },
};

'NODE_ENV BASE_URL GA_ID STRIPE_PUB_KEY FACEBOOK_KEY GOOGLE_CLIENT_ID AMPLITUDE_KEY PUSHER:KEY PUSHER:ENABLED'
  .split(' ')
  .forEach(key => {
    env[key] = `"${nconf.get(key)}"`;
  });

module.exports = env;
