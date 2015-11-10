import nconf from 'nconf';
import { join, resolve } from 'path';

const PATH_TO_CONFIG = join(resolve(__dirname, '../../../../config.json'));

export default function setupNconf (file) {
  file = file || PATH_TO_CONFIG;

  nconf
    .argv()
    .env()
    .file('user', file);

  nconf.set('IS_PROD', nconf.get('NODE_ENV') === 'production');
  nconf.set('IS_DEV', nconf.get('NODE_ENV') === 'development');
}
