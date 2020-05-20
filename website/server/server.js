import nconf from 'nconf';
import express from 'express';
import http from 'http';
import logger from './libs/logger';

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

const server = http.createServer();
const app = express();

app.set('port', nconf.get('PORT'));

attachMiddlewares(app, server);

server.on('request', app);
server.listen(app.get('port'), () => {
  logger.info(`Express server listening on port ${app.get('port')}`);
});

export default server;
