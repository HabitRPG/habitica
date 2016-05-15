// Logger utility
import winston from 'winston';
import nconf from 'nconf';
import _ from 'lodash';

const IS_PROD = nconf.get('IS_PROD');
const IS_TEST = nconf.get('IS_TEST');
const ENABLE_CONSOLE_LOGS_IN_PROD = nconf.get('ENABLE_CONSOLE_LOGS_IN_PROD') === 'true';

const logger = new winston.Logger();

if (IS_PROD) {
  if (ENABLE_CONSOLE_LOGS_IN_PROD === 'true') {
    logger.add(winston.transports.Console, {
      colorize: true,
      prettyPrint: true,
    });
  }
} else if (IS_TEST) {
  // Do not log anything when testing
} else {
  logger
    .add(winston.transports.Console, {
      colorize: true,
      prettyPrint: true,
    });
}

// exports a public interface insteaf of accessing directly the logger module
let loggerInterface = {
  info (...args) {
    logger.info(...args);
  },

  // Accepts two argument,
  // an Error object (required)
  // and an object of additional data to log alongside the error
  // If the first argument isn't an Error, it'll call logger.error with all the arguments supplied
  error (...args) {
    let [err, errorData = {}, ...otherArgs] = args;

    if (err instanceof Error) {
      // pass the error stack as the first parameter to logger.error
      let stack = err.stack || err.message || err;

      if (_.isPlainObject(errorData) && !errorData.fullError) errorData.fullError = err;
      logger.error(stack, errorData, ...otherArgs);
    } else {
      logger.error(...args);
    }
  },
};

// Logs unhandled promises errors
// when no catch is attached to a promise a unhandledRejection event will be triggered
process.on('unhandledRejection', function handlePromiseRejection (reason) {
  loggerInterface.error(reason);
});

module.exports = loggerInterface;
