import nconf from 'nconf';
import logger from './logger';
import autoinc from 'mongoose-id-autoinc';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';

const IS_PROD = nconf.get('IS_PROD');

// Use Q promises instead of mpromise in mongoose
mongoose.Promise = Bluebird;

let mongooseOptions = !IS_PROD ? {} : {
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
};
let db = mongoose.connect(nconf.get('NODE_DB_URI'), mongooseOptions, (err) => {
  if (err) throw err;
  logger.info('Connected with Mongoose.');
});

autoinc.init(db);
