'use strict';

// Logger utility
// TODO remove winston-mail and winston-newrelic if not used
let winston = require('winston');
let nconf = require('nconf');

// TODO use const?
// TODO move isProd to a single location
let isProd = nconf.get('NODE_ENV') === 'production';

let logger = new winston.Logger();

if (isProd) {
  // TODO production logging, use loggly
  // log errors to console too
} else {
  logger
    .add(winston.transports.Console);
}

module.exports = logger;