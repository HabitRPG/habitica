import nconf from 'nconf';
import { join, resolve } from 'path';

const PATH_TO_CONFIG = join(resolve(__dirname, '../../../../config.json'));

export default function setupNconf () {
  nconf
    .argv()
    .env()
    .file('user', PATH_TO_CONFIG);

  nconf.set('IS_PROD', nconf.get('NODE_ENV') === 'production');
  nconf.set('IS_DEV', nconf.get('NODE_ENV') === 'development');
}
