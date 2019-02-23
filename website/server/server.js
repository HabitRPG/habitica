import nconf from 'nconf';
import logger from './libs/logger';
import express from 'express';
import http from 'http';

const IS_PROD = nconf.get('IS_PROD');
const STACKDRIVER_TRACING_ENABLED = nconf.get('ENABLED_STACKDRIVER_TRACING') === 'true';
if (IS_PROD && STACKDRIVER_TRACING_ENABLED) {
  require('@google-cloud/trace-agent').start(); // eslint-disable-line global-require
}

const server = http.createServer();
const app = express();

app.set('port', nconf.get('PORT'));

// Setup translations
// Must come before attach middlewares so Mongoose validations can use translations
import './libs/i18n';

import attachMiddlewares from './middlewares/index';

// Load config files
import './libs/setupMongoose';
import './libs/setupPassport';

// Load some schemas & models
import './models/challenge';
import './models/group';
import './models/user';

attachMiddlewares(app, server);

server.on('request', app);
server.listen(app.get('port'), () => {
  logger.info(`Express server listening on port ${app.get('port')}`);
});

module.exports = server;
