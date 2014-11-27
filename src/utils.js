var nodemailer = require('nodemailer');
var nconf = require('nconf');
var crypto = require('crypto');
var path = require("path");
var request = require('request');

module.exports.ga = undefined; // set Google Analytics on nconf init

module.exports.sendEmail = function(mailData) {
  var smtpTransport = nodemailer.createTransport("SMTP",{
    service: nconf.get('SMTP_SERVICE'),
    auth: {
      user: nconf.get('SMTP_USER'),
      pass: nconf.get('SMTP_PASS')
    }
  });
  smtpTransport.sendMail(mailData, function(error, response){
      var logging = require('./logging');
    if(error) logging.error(error);
    else logging.info("Message sent: " + response.message);
    smtpTransport.close(); // shut down the connection pool, no more messages
  });
}

function getMailingInfo(user) {
  var email, name;
  if(user.auth.local && user.auth.local.email){
    email = user.auth.local.email;
    name = user.profile.name || user.auth.local.username;
  }else if(user.auth.facebook && user.auth.facebook.emails && user.auth.facebook.emails[0] && user.auth.facebook.emails[0].value){
    email = user.auth.facebook.emails[0].value;
    name = user.auth.facebook.displayName || user.auth.facebook.username;
  }
  return {email: email, name: name};
}

module.exports.txnEmail = function(mailingInfo, emailType, variables){
  if (mailingInfo._id) mailingInfo = getMailingInfo(mailingInfo);
  if (!mailingInfo.email) return;
  request({
    url: nconf.get('EMAIL_SERVER:url') + '/job',
    method: 'POST',
    auth: {
      user: nconf.get('EMAIL_SERVER:authUser'),
      pass: nconf.get('EMAIL_SERVER:authPassword')
    },
    json: {
      type: 'email',
      data: {
        emailType: emailType,
        to: {
          name: mailingInfo.name,
          email: mailingInfo.email
        },
        variables: variables
      },
      options: {
        attemps: 5,
        backoff: {delay: 10*60*1000, type: 'fixed'}
      }
    }
  });
}

// Encryption using http://dailyjs.com/2010/12/06/node-tutorial-5/
// Note: would use [password-hash](https://github.com/davidwood/node-password-hash), but we need to run
// model.query().equals(), so it's a PITA to work in their verify() function

module.exports.encryptPassword = function(password, salt) {
  return crypto.createHmac('sha1', salt).update(password).digest('hex');
}

module.exports.makeSalt = function() {
  var len = 10;
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').substring(0, len);
}

/**
 * Load nconf and define default configuration values if config.json or ENV vars are not found
 */
module.exports.setupConfig = function(){
  nconf.argv()
    .env()
    //.file('defaults', path.join(path.resolve(__dirname, '../config.json.example')))
    .file('user', path.join(path.resolve(__dirname, '../config.json')));

  if (nconf.get('NODE_ENV') === "development")
    Error.stackTraceLimit = Infinity;
  if (nconf.get('NODE_ENV') === 'production')
    require('newrelic');

  module.exports.ga = require('universal-analytics')(nconf.get('GA_ID'));
};

var algorithm = 'aes-256-ctr';
module.exports.encrypt = function(text){
  var cipher = crypto.createCipher(algorithm,nconf.get('SESSION_SECRET'))
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

module.exports.decrypt = function(text){
  var decipher = crypto.createDecipher(algorithm,nconf.get('SESSION_SECRET'))
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}