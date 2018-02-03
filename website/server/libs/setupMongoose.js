import nconf from 'nconf';
import logger from './logger';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';

const IS_PROD = nconf.get('IS_PROD');
const MAINTENANCE_MODE = nconf.get('MAINTENANCE_MODE');

// Use Q promises instead of mpromise in mongoose
mongoose.Promise = Bluebird;

// Do not connect to MongoDB when in maintenance mode
if (MAINTENANCE_MODE !== 'true') {
  const mongooseOptions = !IS_PROD ? {} : {
    keepAlive: 120,
    connectTimeoutMS: 30000,
  };

  const NODE_DB_URI = nconf.get('IS_TEST') ? nconf.get('TEST_DB_URI') : nconf.get('NODE_DB_URI');

  mongoose.connect(NODE_DB_URI, mongooseOptions, (err) => {
    if (err) throw err;
    logger.info('Connected with Mongoose.');
  });
}
