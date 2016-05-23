var nodemailer = require('nodemailer');
var nconf = require('nconf');
var crypto = require('crypto');
var path = require("path");
var request = require('request');

const IS_PROD = nconf.get('IS_PROD');
const BASE_URL = nconf.get('BASE_URL');

module.exports.sendEmail = function(mailData) {
  var smtpTransport = nodemailer.createTransport({
    service: nconf.get('SMTP_SERVICE'),
    auth: {
      user: nconf.get('SMTP_USER'),
      pass: nconf.get('SMTP_PASS')
    }
  });

  smtpTransport.sendMail(mailData, function(error, response){
    var logging = require('./api-v2/logging');
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
      info.name = user.profile.name || user.auth.facebook.displayName || user.auth.facebook.username;
    }
  }

  if(fields.indexOf('email') != -1){
    if(user.auth.local && user.auth.local.email){
      info.email = user.auth.local.email;
    }else if(user.auth.facebook && user.auth.facebook.emails && user.auth.facebook.emails[0] && user.auth.facebook.emails[0].value){
      info.email = user.auth.facebook.emails[0].value;
    }
  }

  if(fields.indexOf('_id') != -1){
    info._id = user._id;
  }

  if(fields.indexOf('canSend') != -1){
    info.canSend = user.preferences.emailNotifications.unsubscribeFromAll !== true;
  }

  return info;
}

module.exports.getUserInfo = getUserInfo;

module.exports.txnEmail = function(mailingInfoArray, emailType, variables, personalVariables){
  var mailingInfoArray = Array.isArray(mailingInfoArray) ? mailingInfoArray : [mailingInfoArray];

  var variables = [
    {name: 'BASE_URL', content: BASE_URL}
  ].concat(variables || []);

  // It's important to pass at least a user with its `preferences` as we need to check if he unsubscribed
  mailingInfoArray = mailingInfoArray.map(function(mailingInfo){
    return mailingInfo._id ? getUserInfo(mailingInfo, ['_id', 'email', 'name', 'canSend']) : mailingInfo;
  }).filter(function(mailingInfo){
    // Always send reset-password emails
    // Don't check canSend for non registered users as already checked before
    return (mailingInfo.email && ((!mailingInfo._id || mailingInfo.canSend) || emailType === 'reset-password'));
  });

  // Personal variables are personal to each email recipient, if they are missing
  // we manually create a structure for them with RECIPIENT_NAME and RECIPIENT_UNSUB_URL
  // otherwise we just add RECIPIENT_NAME and RECIPIENT_UNSUB_URL to the existing personal variables
  if(!personalVariables || personalVariables.length === 0){
    personalVariables = mailingInfoArray.map(function(mailingInfo){
      return {
        rcpt: mailingInfo.email,
        vars: [
          {
            name: 'RECIPIENT_NAME',
            content: mailingInfo.name
          },
          {
            name: 'RECIPIENT_UNSUB_URL',
            content: '/unsubscribe?code=' + module.exports.encrypt(JSON.stringify({
              _id: mailingInfo._id,
              email: mailingInfo.email
            }))
          }
        ]
      }
    });
  }else{
    var temporaryPersonalVariables = {};

    mailingInfoArray.forEach(function(mailingInfo){
      temporaryPersonalVariables[mailingInfo.email] = {
        name: mailingInfo.name,
        _id: mailingInfo._id
      }
    });

    personalVariables.forEach(function(singlePersonalVariables){
      singlePersonalVariables.vars.push(
        {
          name: 'RECIPIENT_NAME',
          content: temporaryPersonalVariables[singlePersonalVariables.rcpt].name
        },
        {
          name: 'RECIPIENT_UNSUB_URL',
          content: '/unsubscribe?code=' + module.exports.encrypt(JSON.stringify({
            _id: temporaryPersonalVariables[singlePersonalVariables.rcpt]._id,
            email: singlePersonalVariables.rcpt
          }))
        }
      )
    });
  }

  if(IS_PROD && mailingInfoArray.length > 0){
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
          variables: variables,
          personalVariables: personalVariables
        },
        options: {
          priority: 'high',
          attempts: 5,
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

// Prepare to export analytics object
// Export emoty methods until the right ones are ready
module.exports.analytics = { track: function() { }, trackPurchase: function() { } };

/**
 * Load nconf and define default configuration values if config.json or ENV vars are not found
 */
module.exports.setupConfig = function(){
  if (nconf.get('IS_DEV'))
    Error.stackTraceLimit = Infinity;
  if (IS_PROD && nconf.get('NEW_RELIC_ENABLED') === 'true')
    require('newrelic');

  var analytics = IS_PROD && require('./api-v2/analytics');
  var analyticsTokens = {
    amplitudeToken: nconf.get('AMPLITUDE_KEY'),
    googleAnalytics: nconf.get('GA_ID')
  }

  if(analytics){
    analytics = analytics(analyticsTokens);
    // Use the right analytics methods, don't substitute the entire object
    // or all the require() across the code will keep the empty methods
    module.exports.analytics.track = analytics.track;
    module.exports.analytics.trackPurchase = analytics.trackPurchase;
  }
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
