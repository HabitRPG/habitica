var nodemailer = require('nodemailer');
var nconf = require('nconf');
var crypto = require('crypto');
var path = require("path");
var request = require('request');

// Set when utils.setupConfig is run
var isProd, baseUrl;

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

function getUserInfo(user, fields) {
  var info = {};

  if(fields.indexOf('name') != -1){
    if(user.auth.local){
      info.name = user.profile.name || user.auth.local.username;
    }else if(user.auth.facebook){
      info.name = user.auth.facebook.displayName || user.auth.facebook.username;
    }
  }

  if(fields.indexOf('email') != -1){
    if(user.auth.local){
      info.email = user.auth.local.email;
    }else if(user.auth.facebook && user.auth.facebook.emails && user.auth.facebook.emails[0] && user.auth.facebook.emails[0].value){
      info.email = user.auth.facebook.emails[0].value;
    }
  }

  if(fields.indexOf('canSend') != -1){
    info.canSend = user.preferences.emailNotifications.unsubscribeFromAll !== true;
  }

  return info;
}

module.exports.getUserInfo = getUserInfo;

module.exports.txnEmail = function(mailingInfoArray, emailType, variables){
  var mailingInfoArray = Array.isArray(mailingInfoArray) ? mailingInfoArray : [mailingInfoArray];
  var variables = [
    {name: 'BASE_URL', content: baseUrl},
    {name: 'EMAIL_SETTINGS_URL', content: baseUrl + '/#/options/settings/notifications'}
  ].concat(variables || []);

  // It's important to pass at least a user with its `preferences` as we need to check if he unsubscribed
  mailingInfoArray = mailingInfoArray.map(function(mailingInfo){
    return mailingInfo._id ? getUserInfo(mailingInfo, ['email', 'name', 'canSend']) : mailingInfo;
  }).filter(function(mailingInfo){
    return (mailingInfo.email && mailingInfo.canSend);
  });

  // When only one recipient send his info as variables
  if(mailingInfoArray.length === 1 && mailingInfoArray[0].name){
    variables.push({name: 'RECIPIENT_NAME', content: mailingInfoArray[0].name});
  }  

  if(isProd && mailingInfoArray.length > 0){
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
          to: mailingInfoArray,
          variables: variables
        },
        options: {
          attemps: 5,
          backoff: {delay: 10*60*1000, type: 'fixed'}
        }
      }
    });
  }
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

  isProd = nconf.get('NODE_ENV') === 'production';
  baseUrl = nconf.get('BASE_URL');

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