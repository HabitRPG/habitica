import nconf from 'nconf';
import logger from './logger';
import mongoose from 'mongoose';

const IS_PROD = nconf.get('IS_PROD');
const MAINTENANCE_MODE = nconf.get('MAINTENANCE_MODE');
const POOL_SIZE = nconf.get('MONGODB_POOL_SIZE');

// Do not connect to MongoDB when in maintenance mode
if (MAINTENANCE_MODE !== 'true') {
  const mongooseOptions = !IS_PROD ? {} : {
    keepAlive: 120,
    connectTimeoutMS: 30000,
  };

  if (POOL_SIZE) mongooseOptions.poolSize = Number(POOL_SIZE);

  const NODE_DB_URI = nconf.get('IS_TEST') ? nconf.get('TEST_DB_URI') : nconf.get('NODE_DB_URI');

  mongoose.connect(NODE_DB_URI, mongooseOptions, (err) => {
    if (err) throw err;
    logger.info('Connected with Mongoose.');
  });
}
