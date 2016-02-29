// TODO move to /api-v2
var api = module.exports;
var _ = require('lodash');
var nconf = require('nconf');

var pushNotify = require('push-notify');

var gcmApiKey = nconf.get("PUSH_CONFIGS:GCM_SERVER_API_KEY");

var gcm = gcmApiKey ? pushNotify.gcm({
  apiKey: gcmApiKey,
  retries: 3
}) : undefined;

if(gcm){
  gcm.on('transmitted', function (result, message, registrationId) {
    //console.info("transmitted", result, message, registrationId);
  });

  gcm.on('transmissionError', function (error, message, registrationId) {
    //console.info("transmissionError", error, message, registrationId);
  });
  gcm.on('updated', function (result, registrationId) {
    //console.info("updated", result, registrationId);
  });
}

api.sendNotify = function(user, title, msg, timeToLive){
  timeToLive = timeToLive || 15;

  // need investigation:
  // https://github.com/HabitRPG/habitrpg/issues/5252
  if(!user)
    return;

  _.forEach(user.pushDevices, function(pushDevice){
    switch(pushDevice.type){
      case "android":
        if(gcm){
          gcm.send({
            registrationId: pushDevice.regId,
            //collapseKey: 'COLLAPSE_KEY',
            delayWhileIdle: true,
            timeToLive: timeToLive,
            data: {
              title: title,
              message: msg
            }
        });
      }

      break;

      case "ios":
        break;
    }
  });
};
