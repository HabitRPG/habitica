/* eslint-disable import/no-commonjs */
// NOTE es5 requires/exports to allow import from webpack
const nconfDefault = require('nconf');
const { join, resolve } = require('path');

const PATH_TO_CONFIG = join(resolve(__dirname, '../../../config.json'));

module.exports = function setupNconf (file, nconfInstance = nconfDefault) {
  const configFile = file || PATH_TO_CONFIG;

  nconfInstance
    .argv()
    .env()
    .file('user', configFile);

  nconfInstance.set('IS_PROD', nconfInstance.get('NODE_ENV') === 'production');
  nconfInstance.set('IS_DEV', nconfInstance.get('NODE_ENV') === 'development');
  nconfInstance.set('IS_TEST', nconfInstance.get('NODE_ENV') === 'test');
};
