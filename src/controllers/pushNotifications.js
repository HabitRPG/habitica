var api = module.exports;
var _ = require('lodash');
var nconf = require('nconf');

var pushNotify = require('push-notify');

var gcmApiKey = nconf.get("PUSH_CONFIGS:GCM_SERVER_API_KEY");

var gcm = gcmApiKey ? pushNotify.gcm({
    apiKey: gcmApiKey,
    retries: 1
}) : undefined;

if(gcm){
    gcm.on('transmitted', function (result, message, registrationId) {
        console.info("transmitted", result, message, registrationId);
    });

    gcm.on('transmissionError', function (error, message, registrationId) {
        console.info("transmissionError", error, message, registrationId);
    });
    gcm.on('updated', function (result, registrationId) {
        console.info("updated", result, registrationId);
    });
}

api.sendNotify = function(user, title, msg){
    _.forEach(user.pushDevices, function(pushDevice){
       switch(pushDevice.type){
           case "android":
               if(gcm){
                   console.info("sending", title, msg);
                   console.info(pushDevice);


                   gcm.send({
                       registrationId: pushDevice.regId,
                       //collapseKey: 'COLLAPSE_KEY',
                       delayWhileIdle: true,
                       timeToLive: 3,
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