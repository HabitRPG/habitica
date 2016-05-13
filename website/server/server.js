import nconf from 'nconf';
import logger from './libs/api-v3/logger';
import express from 'express';
import http from 'http';
import attachMiddlewares from './middlewares/api-v3/index';
import Bluebird from 'bluebird';

global.Promise = Bluebird;

const server = http.createServer();
const app = express();

app.set('port', nconf.get('PORT'));

// Setup translations
import './libs/api-v3/i18n';

// Load config files
import './libs/api-v3/setupMongoose';
import './libs/api-v3/firebase';
import './libs/api-v3/setupPassport';

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
