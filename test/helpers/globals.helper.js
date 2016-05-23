/* eslint-disable no-undef */
//------------------------------
// Global modules
//------------------------------

global._ = require('lodash');
global.chai = require('chai');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
global.expect = chai.expect;
