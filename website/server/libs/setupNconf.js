/* eslint-disable import/no-commonjs */
// NOTE es5 requires/exports to allow import from webpack
const nconfDefault = require('nconf');
const { join, resolve } = require('path');
const fs = require('fs');
const logger = require('./logger').default;

const PATH_TO_CONFIG = join(resolve(__dirname, '../../../config.json'));

module.exports = function setupNconf (file, nconfInstance = nconfDefault) {
  const configFile = file || PATH_TO_CONFIG;

  if (!fs.existsSync(configFile)) {
    logger.warn('Missing "config.json", did you forget to copy it from "config.json.example"?');
  }

  nconfInstance
    .argv()
    .env()
    .file('user', configFile);

  nconfInstance.set('IS_PROD', nconfInstance.get('NODE_ENV') === 'production');
  nconfInstance.set('IS_DEV', nconfInstance.get('NODE_ENV') === 'development');
  nconfInstance.set('IS_TEST', nconfInstance.get('NODE_ENV') === 'test');
};
