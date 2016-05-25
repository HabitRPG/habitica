/* eslint-disable */

import _ from 'lodash';
import nconf from 'nconf';
import pushNotify from 'push-notify';

const GCM_API_KEY = nconf.get('PUSH_CONFIGS:GCM_SERVER_API_KEY');

let gcm = GCM_API_KEY ? pushNotify.gcm({
  apiKey: GCM_API_KEY,
  retries: 3,
}) : undefined;

// TODO review and test this file when push notifications are added back

if (gcm) {
  gcm.on('transmitted', (/* result, message, registrationId */) => {
    // console.info("transmitted", result, message, registrationId);
  });

  gcm.on('transmissionError', (/* error, message, registrationId */) => {
    // console.info("transmissionError", error, message, registrationId);
  });

  gcm.on('updated', (/* result, registrationId */) => {
    // console.info("updated", result, registrationId);
  });
}

module.exports = function sendNotification (user, title, message, timeToLive = 15) {
  return; // TODO push notifications are not currently enabled

  if (!user) return;
  let pushDevices = user.pushDevices.toObject ? user.pushDevices.toObject() : user.pushDevices;

  _.each(pushDevices, pushDevice => {
    switch (pushDevice.type) {
      case 'android':
        if (gcm) {
          gcm.send({
            registrationId: pushDevice.regId,
            // collapseKey: 'COLLAPSE_KEY',
            delayWhileIdle: true,
            timeToLive,
            data: {
              title,
              message,
            },
          });
        }

        break;

      case 'ios':
        break;
    }
  });
};
