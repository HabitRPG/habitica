/* eslint-disable import/no-commonjs */
/* eslint-disable no-undef */
/* eslint-disable global-require */
/* eslint-disable no-process-env */

//------------------------------
// Global modules
//------------------------------
global._ = require('lodash');
global.chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('chai-moment'));
chai.use(require('sinon-chai'));

global.expect = chai.expect;
global.sinon = require('sinon');
const sinonStubPromise = require('sinon-stub-promise');

sinonStubPromise(global.sinon);
global.sandbox = sinon.createSandbox();

const setupNconf = require('../../website/server/libs/setupNconf');

setupNconf('./config.json.example');
