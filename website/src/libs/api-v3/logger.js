// Logger utility
// TODO remove winston-mail and winston-newrelic if not used
import winston from 'winston';
import nconf from 'nconf';

// TODO move isProd to a single location
const isProd = nconf.get('NODE_ENV') === 'production';

let logger = new winston.Logger();

if (isProd) {
  // TODO production logging, use loggly
  // log errors to console too
} else {
  logger
    .add(winston.transports.Console);
}

export default logger;
