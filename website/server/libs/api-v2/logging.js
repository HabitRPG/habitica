var nconf = require('nconf');
var winston = require('winston');

var logger;

if (!logger) {
  logger = new (winston.Logger)({});
  logger.add(winston.transports.Console, {colorize:true}); // TODO remove

  if (nconf.get('NODE_ENV') !== 'production') {
    logger.add(winston.transports.File, {filename: 'habitrpg.log'});
  }
}

// A custom log function that wraps Winston. Makes it easy to instrument code
// and still possible to replace Winston in the future.
module.exports.log = function(/* variable args */) {
  if (logger)
    logger.log.apply(logger, arguments);
};

module.exports.info = function(/* variable args */) {
  if (logger)
    logger.info.apply(logger, arguments);
};

module.exports.warn = function(/* variable args */) {
  if (logger)
    logger.warn.apply(logger, arguments);
};

module.exports.error = function(/* variable args */) {
  if (logger)
    logger.error.apply(logger, arguments);
};