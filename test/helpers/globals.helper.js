/* eslint-disable no-undef */
/* eslint-disable global-require */
/* eslint-disable no-process-env */
//------------------------------
// Global modules
//------------------------------

global._ = require('lodash');
global.chai = require('chai');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
global.expect = chai.expect;
global.sinon = require('sinon');
global.sandbox = sinon.sandbox.create();

import nconf from 'nconf';
import mongoose from 'mongoose';
import Q from 'q';

//------------------------------
// Load nconf for unit tests
//------------------------------
if (process.env.LOAD_SERVER === '0') { // when the server is in a different process we simply connect to mongoose
  require('../../website/src/libs/api-v3/setupNconf')('./config.json');
  // Use Q promises instead of mpromise in mongoose
  mongoose.Promise = Q.Promise;
  mongoose.connect(nconf.get('NODE_DB_URI'));
} else { // When running tests and the server in the same process
  require('../../website/src/libs/api-v3/setupNconf')('./config.json.example');
  nconf.set('NODE_DB_URI', 'mongodb://localhost/habitrpg_test');
  nconf.set('NODE_ENV', 'test');
  nconf.set('IS_TEST', true);
  // We require src/server and npt src/index because
  // 1. nconf is already setup
  // 2. we don't need clustering
  require('../../website/src/server');
}
