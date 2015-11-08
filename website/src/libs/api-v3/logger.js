// Logger utility
// TODO remove winston-mail and winston-newrelic if not used
import winston from 'winston';
import nconf from 'nconf';

const IS_PROD = nconf.get('IS_PROD');

let logger = new winston.Logger();

if (IS_PROD) {
  // TODO production logging, use loggly
  // log errors to console too
} else {
  logger
    .add(winston.transports.Console);
}

export default logger;
