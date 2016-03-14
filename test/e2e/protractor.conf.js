'use strict';

let chai = require('chai');
let chaiAsPromised = require('chai-as-promised');

require('babel-register');
require('babel-polyfill');

exports.config = {
  specs: ['./helper.js', './**/*.test.js'],
  baseUrl: 'http://localhost:3003/',
  capabilities: {
    browserName: 'firefox',
  },
  directConnect: true,
  seleniumAddress: 'http://localhost:4444/wd/hub',
  framework: 'mocha',
  mochaOpts: {
    reporter: 'spec',
    slow: 6000,
    timeout: 10000,
    compilers: 'js:babel-register',
  },
  onPrepare: () => {
    browser.ignoreSynchronization = true;

    chai.use(chaiAsPromised);
    global.expect = chai.expect;
  },
};
