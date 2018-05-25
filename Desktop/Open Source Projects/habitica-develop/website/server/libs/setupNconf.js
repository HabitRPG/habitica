// require allows import from webpack
const nconf = require('nconf');
const { join, resolve } = require('path');

const PATH_TO_CONFIG = join(resolve(__dirname, '../../../config.json'));

module.exports = function setupNconf (file) {
  let configFile = file || PATH_TO_CONFIG;

  nconf
    .argv()
    .env()
    .file('user', configFile);

  nconf.set('IS_PROD', nconf.get('NODE_ENV') === 'production');
  nconf.set('IS_DEV', nconf.get('NODE_ENV') === 'development');
  nconf.set('IS_TEST', nconf.get('NODE_ENV') === 'test');
};
