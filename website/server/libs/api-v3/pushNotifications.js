/* eslint-disable */

import _ from 'lodash';
import nconf from 'nconf';
import pushNotify from 'push-notify';
import apnLib from 'apn';

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
  let feedback = apnLib.Feedback({
    key: nconf.get('PUSH_CONFIGS:APN_PEM_FILES:KEY'),
    cert: nconf.get('PUSH_CONFIGS:APN_PEM_FILES:CERT'),
    batchFeedback: true,
    interval: 3600, //Check for feedback once an hour
  });
  feedback.on("feedback", function(devices) {
    //console.log("GOT FEEDBACK");
    //console.log(devices);
  });
}

module.exports = function sendNotification (user, details={}) {
  if (!user) return;
  if (user.preferences.pushNotifications.unsubscribeFromAll === true) return;
  let pushDevices = user.pushDevices.toObject ? user.pushDevices.toObject() : user.pushDevices;

  if (!details.identifier) return;
  if (!details.title) return;
  if (!details.message) return;

  let payload = details.payload ? details.payload : {};
  payload.identifier = details.identifier;
  _.each(pushDevices, pushDevice => {
    switch (pushDevice.type) {
      case 'android':
        if (gcm) {
          payload.title = details.title;
          payload.message = details.message;
          gcm.send({
            registrationId: pushDevice.regId,
            delayWhileIdle: true,
            timeToLive: details.timeToLive ? details.timeToLive : 15,
            data: payload
          });
        }
        break;

      case 'ios':
        if (apn) {
          apn.send({
            token: pushDevice.regId,
            alert: details.message,
            sound: "default",
            category: details.category,
            payload
          });
        }
        break;
    }
  });
};
