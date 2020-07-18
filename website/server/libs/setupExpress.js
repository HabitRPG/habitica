import nconf from 'nconf';

const IS_PROD = nconf.get('IS_PROD');

export default function setupExpress (app) {
  app.set('view engine', 'pug');
  app.set('views', `${__dirname}/../../views`);
  // The production build of Habitica runs behind a proxy
  // See https://expressjs.com/it/guide/behind-proxies.html
  if (IS_PROD) app.set('trust proxy', true);
}
