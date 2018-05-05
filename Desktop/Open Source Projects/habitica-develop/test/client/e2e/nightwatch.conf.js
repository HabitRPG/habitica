/* eslint-disable camelcase */

require('babel-register');
const config = require('../../../webpack/config');
const chromeDriverPath = require('chromedriver').path;
const seleniumServerPath = require('selenium-server').path;

// http://nightwatchjs.org/guide#settings-file
module.exports = {
  src_folders: ['test/client/e2e/specs'],
  output_folder: 'test/client/e2e/reports',
  custom_assertions_path: ['test/client/e2e/custom-assertions'],

  selenium: {
    start_process: true,
    server_path: seleniumServerPath,
    host: '127.0.0.1',
    port: 4444,
    cli_args: {
      'webdriver.chrome.driver': chromeDriverPath,
    },
  },

  test_settings: {
    default: {
      selenium_port: 4444,
      selenium_host: 'localhost',
      silent: true,
      globals: {
        devServerURL: `http://localhost:${process.env.PORT || config.dev.port}`, // eslint-disable-line no-process-env
      },
    },

    chrome: {
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
      },
    },

    firefox: {
      desiredCapabilities: {
        browserName: 'firefox',
        javascriptEnabled: true,
        acceptSslCerts: true,
      },
    },
  },
};
