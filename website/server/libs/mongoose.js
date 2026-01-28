import nconf from 'nconf';
import mongoose from 'mongoose';
import logger from './logger';
import {
  getDevelopmentConnectionUrl,
  getDefaultConnectionOptions,
} from './mongodb';
import SERVER_STATUS from './serverStatus';

const IS_PROD = nconf.get('IS_PROD');
const MAINTENANCE_MODE = nconf.get('MAINTENANCE_MODE');
const MIN_POOL_SIZE = nconf.get('MONGODB_MIN_POOL_SIZE');
const POOL_SIZE = nconf.get('MONGODB_POOL_SIZE');
const SOCKET_TIMEOUT = nconf.get('MONGODB_SOCKET_TIMEOUT');

const mongooseOptions = getDefaultConnectionOptions();

if (MIN_POOL_SIZE) mongooseOptions.minPoolSize = Number(MIN_POOL_SIZE);
if (POOL_SIZE) mongooseOptions.maxPoolSize = Number(POOL_SIZE);
if (SOCKET_TIMEOUT) mongooseOptions.socketTimeoutMS = Number(SOCKET_TIMEOUT);

const DB_URI = nconf.get('IS_TEST') ? nconf.get('TEST_DB_URI') : nconf.get('NODE_DB_URI');
const connectionUrl = IS_PROD ? DB_URI : getDevelopmentConnectionUrl(DB_URI);

export default async function connectToMongoDB () {
  // Do not connect to MongoDB when in maintenance mode
  if (MAINTENANCE_MODE !== 'true') {
    mongoose.connection.on('open', () => {
      SERVER_STATUS.MONGODB = true;
    });
    mongoose.connection.on('disconnected', () => {
      SERVER_STATUS.MONGODB = false;
    });

    return mongoose.connect(connectionUrl, mongooseOptions).then(() => {
      logger.info('Connected with Mongoose.');
    });
  }
  return null;
}
