/* eslint-disable no-process-env */
/* eslint-disable import/no-commonjs */

const nconf = require('nconf');
const mongoose = require('mongoose');
const setupNconf = require('../../website/server/libs/setupNconf');

// fix further imports of require/import syntaxes
require('@babel/register');

if (process.env.LOAD_SERVER === '0') { // when the server is in a different process we simply connect to mongoose
  setupNconf('./config.json');
  // Use Q promises instead of mpromise in mongoose
  mongoose.connect(nconf.get('TEST_DB_URI'));
} else { // When running tests and the server in the same process
  setupNconf('./config.json.example');
  nconf.set('NODE_DB_URI', nconf.get('TEST_DB_URI'));
  nconf.set('NODE_ENV', 'test');
  nconf.set('ACCOUNT_MIN_CHAT_AGE', '2');
  nconf.set('IS_TEST', true);
  // We require src/server and not src/index because
  // 1. nconf is already setup
  // 2. we don't need clustering
  require('../../website/server/server'); // eslint-disable-line global-require
}
