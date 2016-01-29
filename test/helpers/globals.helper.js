/* eslint-disable no-undef */
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

//------------------------------
// Load nconf for unit tests
//------------------------------
require('../../website/src/libs/api-v3/setupNconf')('./config.json.example');
nconf.set('NODE_DB_URI', 'mongodb://localhost/habitrpg_test');
// We require src/server and npt src/index because
// 1. nconf is already setup
// 2. we don't need clustering
require('../../website/src/server');
