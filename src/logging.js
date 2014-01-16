var nconf = require('nconf');
var winston = require('winston');

var logger;
if (logger == null) {
    // We currently don't support logging on Heroku
    if (nconf.get('NODE_ENV') != 'production') {
        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)({colorize: true}),
                new (winston.transports.File)({ filename: 'habitrpg.log' })
                // TODO: Add email, loggly, or mongodb transports
            ]
        });
    }
}

// A custom log function that wraps Winston. Makes it easy to instrument code
// and still possible to replace Winston in the future.
module.exports.log = function(/* variable args */) {
    logger.log.apply(logger, arguments);
};

module.exports.info = function(/* variable args */) {
   logger.info.apply(logger, arguments);
};

module.exports.warn = function(/* variable args */) {
    logger.warn.apply(logger, arguments);
};

module.exports.error = function(/* variable args */) {
    winston.error(arguments);
};
