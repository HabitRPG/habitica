/* eslint-disable no-undef */
/* eslint-disable global-require */
/* eslint-disable no-process-env */

import Bluebird from 'bluebird';

//------------------------------
// Global modules
//------------------------------
global._ = require('lodash');
global.chai = require('chai');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
global.expect = chai.expect;
global.sinon = require('sinon');
let sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(global.sinon);
global.sandbox = sinon.sandbox.create();
global.Promise = Bluebird;

import setupNconf from '../../website/server/libs/setupNconf';
setupNconf('./config.json.example');
