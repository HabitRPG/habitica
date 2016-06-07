// Logger utility
import winston from 'winston';
import nconf from 'nconf';
import _ from 'lodash';
import {
  CustomError,
} from './errors';

const IS_PROD = nconf.get('IS_PROD');
const IS_TEST = nconf.get('IS_TEST');
const ENABLE_LOGS_IN_TEST = nconf.get('ENABLE_CONSOLE_LOGS_IN_TEST') === 'true';
const ENABLE_LOGS_IN_PROD = nconf.get('ENABLE_CONSOLE_LOGS_IN_PROD') === 'true';

const logger = new winston.Logger();

if (IS_PROD) {
  if (ENABLE_LOGS_IN_PROD) {
    logger.add(winston.transports.Console, {
      timestamp: true,
      colorize: false,
      prettyPrint: false,
    });
  }
} else if (!IS_TEST || IS_TEST && ENABLE_LOGS_IN_TEST) { // Do not log anything when testing unless specified
  logger
    .add(winston.transports.Console, {
      timestamp: true,
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

      if (_.isPlainObject(errorData) && !errorData.fullError) {
        // If the error object has interesting data (not only httpCode, message and name from the CustomError class)
        // add it to the logs
        if (err instanceof CustomError) {
          let errWithoutCommonProps = _.omit(err, ['name', 'httpCode', 'message']);

          if (Object.keys(errWithoutCommonProps).length > 0) {
            errorData.fullError = errWithoutCommonProps;
          }
        } else {
          errorData.fullError = err;
        }
      }

      let loggerArgs = [stack, errorData, ...otherArgs];

      // Treat 4xx errors that are handled as warnings, 5xx and uncaught errors as serious problems
      if (!errorData || !errorData.isHandledError || errorData.httpCode >= 500) {
        logger.error(...loggerArgs);
      } else {
        logger.warn(...loggerArgs);
      }
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
