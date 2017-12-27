// This is a karma config file. For more details see
//   http://karma-runner.github.io/0.13/config/configuration-file.html
// we are also using it with karma-webpack
//   https://github.com/webpack/karma-webpack

// Necessary for babel to respect the env version of .babelrc which is necessary
// Because inject-loader does not work with ["es2015", { modules: false }] that we use
// in order to let webpack2 handle the imports

process.env.BABEL_ENV = process.env.NODE_ENV; // eslint-disable-line no-process-env
process.env.CHROME_BIN = require('puppeteer').executablePath();

const webpackConfig = require('../../../webpack/webpack.test.conf');

module.exports = function (config) {
  config.set({
    // to run in additional browsers:
    // 1. install corresponding karma launcher
    //    http://karma-runner.github.io/0.13/config/browsers.html
    // 2. add it to the `browsers` array below.
    browsers: ['ChromeNoSandboxHeadless'],
    customLaunchers: {
      ChromeNoSandboxHeadless: {
        base: 'Chrome',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          // See https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
          '--headless',
          '--disable-gpu',
          // Without a remote debugging port, Google Chrome exits immediately.
          ' --remote-debugging-port=9222',
        ],
      },
    },
    frameworks: ['mocha', 'sinon-stub-promise', 'sinon-chai', 'chai-as-promised', 'chai'],
    reporters: ['spec', 'coverage'],
    files: ['./index.js'],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap'],
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true,
    },
    coverageReporter: {
      dir: '../../../coverage/client-unit',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' },
      ],
    },
  });
};
