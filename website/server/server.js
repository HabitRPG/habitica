import nconf from 'nconf';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import redis from 'redis';
import logger from './libs/logger';

// Setup translations
// Must come before attach middlewares so Mongoose validations can use translations
import './libs/i18n';

import attachMiddlewares from './middlewares/index';

// Load config files
import connectToMongoDB from './libs/mongoose';
import './libs/setupPassport';
import './libs/setupFirebase';

// Load some schemas & models
import './models/challenge';
import './models/group';
import './models/user';
import SERVER_STATUS from './libs/serverStatus';

connectToMongoDB();

const server = http.createServer();
const app = express();

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await mongoose.disconnect();
    await redis.quit();
    process.exit(0);
  });
});

app.set('port', nconf.get('PORT'));

attachMiddlewares(app, server);

server.on('request', app);
server.listen(app.get('port'), () => {
  logger.info(`Express server listening on port ${app.get('port')}`);
  SERVER_STATUS.EXPRESS = true;
});

export default server;
