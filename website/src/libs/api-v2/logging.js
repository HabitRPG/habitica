var nconf = require('nconf');
var winston = require('winston');
//require('winston-mail').Mail;
//require('winston-newrelic');

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

if (logger == null) {
    logger = new (winston.Logger)({});
    if (nconf.get('NODE_ENV') == 'production') {
        if (!nconf.get('DISABLE_ERROR_EMAILS') && false) {
          logger.add(winston.transports.Mail, {
              to: nconf.get('ADMIN_EMAIL') || nconf.get('SMTP_USER'),
              from: "HabitRPG <" + nconf.get('SMTP_USER') + ">",
              subject: "HabitRPG Error",
              host: nconf.get('SMTP_HOST'),
              port: nconf.get('SMTP_PORT'),
              tls: nconf.get('SMTP_TLS'),
              username: nconf.get('SMTP_USER'),
              password: nconf.get('SMTP_PASS'),
              level: 'error'
          });
        }
    } else {
        logger.add(winston.transports.Console, {colorize:true});
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
