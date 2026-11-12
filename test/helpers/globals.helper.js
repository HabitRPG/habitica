/* eslint-disable import/no-commonjs */
/* eslint-disable no-undef */
/* eslint-disable global-require */
/* eslint-disable no-process-env */

//------------------------------
// Global modules
//------------------------------
global._ = require('lodash');
global.chai = require('chai');
// chai-as-promised and sinon-chai are ES modules, require returns their namespace
chai.use(require('chai-as-promised').default);
chai.use(require('chai-moment'));
chai.use(require('sinon-chai').default);

global.expect = chai.expect;
global.sinon = require('sinon');

global.sandbox = sinon.createSandbox();

const setupNconf = require('../../website/server/libs/setupNconf').default;

setupNconf('./config.json.example');
