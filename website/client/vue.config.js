// TODO abstract from server
const path = require('path');
const nconf = require('nconf');
const setupNconf = require('../../website/server/libs/setupNconf');

let configFile = path.join(path.resolve(__dirname, '../../config.json'));

setupNconf(configFile);

const DEV_BASE_URL = nconf.get('BASE_URL');

module.exports = {
  devServer: {
    proxy: {
      // proxy all requests to the server at IP:PORT as specified in the top-level config
      '^/api/v3': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/api/v4': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/stripe': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/amazon': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/paypal': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/logout-server': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/export': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
    }
  }
};
