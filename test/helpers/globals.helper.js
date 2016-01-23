/* eslint-disable no-undef */
require('babel-core/register');
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

//------------------------------
// Load nconf for unit tests
//------------------------------
require('../../website/src/libs/api-v3/setupNconf')('./config.json.example');
