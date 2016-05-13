var nconf = require('nconf');
var winston = require('winston');

var logger, loggly;

// Currently disabled
if (nconf.get('LOGGLY:enabled')){
  loggly = require('loggly').createClient({
    token: nconf.get('LOGGLY:token'),
    subdomain: nconf.get('LOGGLY:subdomain'),
    auth: {
      username: nconf.get('LOGGLY:username'),
      password: nconf.get('LOGGLY:password')
    },
    //
    // Optional: Tag to send with EVERY log message
    //
    tags: [('heroku-'+nconf.get('BASE_URL'))],
    json: true
  });
}

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

module.exports.loggly = function(/* variable args */){
  if (loggly)
    loggly.log.apply(loggly, arguments);
};
