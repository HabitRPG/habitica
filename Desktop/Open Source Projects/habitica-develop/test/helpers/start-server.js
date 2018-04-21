/* eslint-disable no-process-env */
import nconf from 'nconf';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';
import setupNconf from '../../website/server/libs/setupNconf';

if (process.env.LOAD_SERVER === '0') { // when the server is in a different process we simply connect to mongoose
  setupNconf('./config.json');
  // Use Q promises instead of mpromise in mongoose
  mongoose.Promise = Bluebird;
  mongoose.connect(nconf.get('TEST_DB_URI'));
} else { // When running tests and the server in the same process
  setupNconf('./config.json.example');
  nconf.set('NODE_DB_URI', nconf.get('TEST_DB_URI'));
  nconf.set('NODE_ENV', 'test');
  nconf.set('IS_TEST', true);
  // We require src/server and npt src/index because
  // 1. nconf is already setup
  // 2. we don't need clustering
  require('../../website/server/server'); // eslint-disable-line global-require
}
