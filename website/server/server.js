import nconf from 'nconf';
import express from 'express';
import http from 'http';
import logger from './libs/logger';
import sinon from 'sinon';

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

const time = new Date(2024, 2, 18);
const clock = sinon.useFakeTimers({
  now: time,
  shouldAdvanceTime: true,
});

var jumped = false;
setInterval(() => {
  if (jumped) {
    jumped = false;
    return;
  }
  jumped = true;
  console.log('Jumping time');
  clock.jump(36000);
}, 1000);

server.on('request', app);
server.listen(app.get('port'), () => {
  logger.info(`Express server listening on port ${app.get('port')}`);
});

export default server;
