import nconf from 'nconf';
import logger from './libs/logger';
import express from 'express';
import http from 'http';

try {
  // @TODO: May need to remove - testing
  const memwatch = require('memwatch-next'); // eslint-disable-line global-require
  memwatch.on('leak', (info) => {
    const message = 'Memory leak detected.';
    logger.error(message, info);
  });
} catch (err) {
  logger.info('"memwatch-next" couldn\'t be loaded.');
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
