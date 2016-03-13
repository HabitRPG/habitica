'use strict'

require('babel-register');
require('babel-polyfill');

exports.config = {
  specs: 'test/e2e/**/*.js',
  baseUrl: 'http://localhost:3003/',
  directConnect: true,
  seleniumAddress: 'http://localhost:4444/wd/hub',
  framework: 'mocha',
  mochaOpts: {
    reporter: 'spec',
    slow: 6000,
    timeout: 10000,
    compilers: 'js:babel-register'
  },
  onPrepare: () => {
    browser.ignoreSynchronization = true;
    let chai = require('chai');
    let chaiAsPromised = require('chai-as-promised');

    chai.use(chaiAsPromised);
    global.expect = chai.expect;
  },
};
