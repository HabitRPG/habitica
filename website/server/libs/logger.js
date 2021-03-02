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
    logger
      .add(new winston.transports.Console({ // text part
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(
            info => `${info.timestamp} - ${info.level} ${info.message}`,
          ),
        ),
      }))
      .add(new winston.transports.Console({ // json part
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
          if (info && info.message && typeof info.message.split === 'function') {
            const message = info.message.split('\n')[0];
            info.message = message;
          }
          return info;
        })(),
        winston.format.prettyPrint({
          colorize: true,
        }),
      ),
    }))
    .add(new winston.transports.Console({
      level: 'info', // text part
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
        winston.format.printf(info => `${info.timestamp} - ${info.level} ${info.message}`),
      ),
    }))
    .add(new winston.transports.Console({
      level: 'info', // json part
      format: winston.format.combine(
        // Ignores warn and errors
        winston.format(info => {
          if (info.level === 'error' || info.level === 'warn') {
            return false;
          }

          // If there are only two keys (message and level) it means there's nothing
          // to print as json
          if (Object.keys(info).length <= 2) return false;

          return info;
        })(),
        winston.format.prettyPrint({
          colorize: true,
        }),
      ),
    }));
} else {
  _config.loggingEnabled = false;
}

// exports a public interface insteaf of accessing directly the logger module
const loggerInterface = {
  info (...args) {
    if (!_config.loggingEnabled) return;

    const [_message, _data] = args;
    const isMessageString = typeof _message === 'string';

    const message = isMessageString ? _message : 'No message provided for log.';
    let data;

    if (args.length === 1) {
      if (isMessageString) {
        data = {};
      } else {
        data = { extraData: _message };
      }
    } else if (!isMessageString || args.length > 2) {
      throw new Error('logger.info accepts up to two arguments: a message and an object with extra data to log.');
    } else if (_.isPlainObject(_data)) {
      data = _data;
    } else {
      data = { extraData: _data };
    }

    logger.info(message, data);
  },

  // Accepts two argument,
  // an Error object (required)
  // and an object of additional data to log alongside the error
  // If the first argument isn't an Error, it'll call logger.error with all the arguments supplied
  error (...args) {
    if (!_config.loggingEnabled) return;
    const [err, _errorData] = args;

    if (args.length > 2) {
      throw new Error('logger.error accepts up to two arguments: an error and an object with extra data to log.');
    }

    let errorData = {};

    if (typeof _errorData === 'string') {
      errorData = { extraMessage: _errorData };
    } else if (_.isPlainObject(_errorData)) {
      errorData = _errorData;
    } else if (_errorData) {
      errorData = { extraData: _errorData };
    }

    if (err instanceof Error) {
      // pass the error stack as the first parameter to logger.error
      const stack = err.stack || err.message || err;

      if (!errorData.fullError) {
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

      const loggerArgs = [stack, errorData];

      // Treat 4xx errors that are handled as warnings, 5xx and uncaught errors as serious problems
      if (!errorData || !errorData.isHandledError || errorData.httpCode >= 500) {
        logger.error(...loggerArgs);
      } else {
        logger.warn(...loggerArgs);
      }
    } else {
      errorData.invalidErr = err;
      logger.error('logger.error expects an Error instance', errorData);
    }
  },
};

// Logs unhandled promises errors
// when no catch is attached to a promise a unhandledRejection event will be triggered
// reason is the error, p the promise where it originated
process.on('unhandledRejection', (reason, promise) => {
  loggerInterface.error(reason, { message: 'unhandledPromiseRejection', promise });
});

export default loggerInterface;
