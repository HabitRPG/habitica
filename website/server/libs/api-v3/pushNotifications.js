/* eslint-disable */

import _ from 'lodash';
import nconf from 'nconf';
import pushNotify from 'push-notify';
var apnLib = require('apn');

const GCM_API_KEY = nconf.get('PUSH_CONFIGS:GCM_SERVER_API_KEY');

let gcm = GCM_API_KEY ? pushNotify.gcm({
  apiKey: GCM_API_KEY,
  retries: 3,
}) : undefined;

let APN_KEY = nconf.get('PUSH_CONFIGS:APN_PEM_FILES:KEY');

let apn = APN_KEY ? pushNotify.apn({
  key: nconf.get('PUSH_CONFIGS:APN_PEM_FILES:KEY'),
  cert: nconf.get('PUSH_CONFIGS:APN_PEM_FILES:CERT')
}) : undefined;

if (apn) {
  var feedback = apnLib.Feedback({
    key: nconf.get('PUSH_CONFIGS:APN_PEM_FILES:KEY'),
    cert: nconf.get('PUSH_CONFIGS:APN_PEM_FILES:CERT'),
    "batchFeedback": true,
    "interval": 3600, //Check for feedback once an hour
  });
  feedback.on("feedback", function(devices) {
    console.log("GOT FEEDBACK");
    console.log(devices);
  });
}

module.exports = function sendNotification (user, title, message, identifier, category = "", payload = {}, timeToLive = 15) {

  if (!user) return;
  if (user.preferences && user.preferences.pushNotifications && user.preferences.pushNotifications.unsubscribeFromAll === true) return;
  let pushDevices = user.pushDevices.toObject ? user.pushDevices.toObject() : user.pushDevices;

  payload.identifier = identifier;
  _.each(pushDevices, pushDevice => {
    switch (pushDevice.type) {
      case 'android':
        if (gcm) {
          payload.title = title;
          payload.message = message;
          gcm.send({
            registrationId: pushDevice.regId,
            // collapseKey: 'COLLAPSE_KEY',
            delayWhileIdle: true,
            timeToLive,
            data: payload
          });
        }

        break;

      case 'ios':
        apn.send({
          token: pushDevice.regId,
          alert: message,
          sound: "default",
          category,
          payload
        });
        break;
    }
  });
};
