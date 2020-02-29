// Logger utility
import winston from 'winston';
import { Loggly } from 'winston-loggly-bulk';
import nconf from 'nconf';
import _ from 'lodash';
import {
  CustomError,
} from './errors';

const IS_PROD = nconf.get('IS_PROD');
const IS_TEST = nconf.get('IS_TEST');
const ENABLE_LOGS_IN_TEST = nconf.get('ENABLE_CONSOLE_LOGS_IN_TEST') === 'true';
const ENABLE_CONSOLE_LOGS_IN_PROD = nconf.get('ENABLE_CONSOLE_LOGS_IN_PROD') === 'true';

const LOGGLY_TOKEN = nconf.get('LOGGLY_TOKEN');
const LOGGLY_SUBDOMAIN = nconf.get('LOGGLY_SUBDOMAIN');

const logger = winston.createLogger();

const _config = {
  logger,
  loggingEnabled: true, // false if no transport has been configured
};

export { _config as _loggerConfig }; // exported for use during tests

if (IS_PROD) {
  if (ENABLE_CONSOLE_LOGS_IN_PROD) {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }));
  }

  if (LOGGLY_TOKEN && LOGGLY_SUBDOMAIN) {
    logger.add(new Loggly({
      inputToken: LOGGLY_TOKEN,
      subdomain: LOGGLY_SUBDOMAIN,
      tags: ['Winston-NodeJS'],
      json: true,
    }));
  }
// Do not log anything when testing unless specified
} else if (!IS_TEST || (IS_TEST && ENABLE_LOGS_IN_TEST)) {
  logger
    .add(new winston.transports.Console({
      level: 'warn', // warn and errors (text part)
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(
          info => `${info.timestamp} - ${info.level} ${info.message}`,
        ),
      ),
    }))
    .add(new winston.transports.Console({
      level: 'warn', // warn and errors (json part)
      format: winston.format.combine(
        // Remove stacktrace from json, printed separately
        winston.format(info => {
          const message = info.message.split('\n')[0];
          info.message = message;
          return info;
        })(),
        winston.format.prettyPrint({
          colorize: true,
        }),
      ),
    }))
    .add(new winston.transports.Console({
      level: 'info', // info messages as text
      format: winston.format.combine(
        // Ignores warn and errors
        winston.format(info => {
          if (info.level === 'error' || info.level === 'warn') {
            return false;
          }

          return info;
        })(),
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.printf(info => `${info.timestamp} - ${info.level} ${info.message}`),
      ),
    }));
} else {
  _config.loggingEnabled = false;
}

// exports a public interface insteaf of accessing directly the logger module
const loggerInterface = {
  info (...args) {
    if (!_config.loggingEnabled) return;

    logger.info(...args);
  },

  // Accepts two argument,
  // an Error object (required)
  // and an object of additional data to log alongside the error
  // If the first argument isn't an Error, it'll call logger.error with all the arguments supplied
  error (...args) {
    if (!_config.loggingEnabled) return;
    const [err, errorData = {}, ...otherArgs] = args;

    if (err instanceof Error) {
      // pass the error stack as the first parameter to logger.error
      const stack = err.stack || err.message || err;

      if (_.isPlainObject(errorData) && !errorData.fullError) {
        // If the error object has interesting data
        // (not only httpCode, message and name from the CustomError class)
        // add it to the logs
        if (err instanceof CustomError) {
          const errWithoutCommonProps = _.omit(err, ['name', 'httpCode', 'message']);

          if (Object.keys(errWithoutCommonProps).length > 0) {
            errorData.fullError = errWithoutCommonProps;
          }
        } else {
          errorData.fullError = err;
        }
      }

      const loggerArgs = [stack, errorData, ...otherArgs];

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
// reason is the error, p the promise where it originated
process.on('unhandledRejection', (reason, p) => {
  loggerInterface.error(reason, 'unhandledPromiseRejection at', p);
});

export default loggerInterface;
