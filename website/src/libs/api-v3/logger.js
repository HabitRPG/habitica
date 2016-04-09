// Logger utility
import winston from 'winston';
import nconf from 'nconf';

const IS_PROD = nconf.get('IS_PROD');
const IS_TEST = nconf.get('IS_TEST');

let logger = new winston.Logger();

if (IS_PROD) {
  // TODO production logging, use loggly and new relic too
  // log errors to console too
} else if (IS_TEST) {
  // Do not log anything when testing
} else {
  logger
    .add(winston.transports.Console, {
      colorize: true,
      prettyPrint: true,
    });
}

module.exports = logger;
