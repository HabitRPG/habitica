import _ from 'lodash';
import nconf from 'nconf';
import pushNotify from 'push-notify';

const GCM_API_KEY = nconf.get('PUSH_CONFIGS:GCM_SERVER_API_KEY');

let gcm = GCM_API_KEY ? pushNotify.gcm({
  apiKey: GCM_API_KEY,
  retries: 3,
}) : undefined;

// TODO log
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

// TODO test
module.exports = function sendNotification (user, title, message, timeToLive = 15) {
  // TODO need investigation:
  // https://github.com/HabitRPG/habitrpg/issues/5252

  if (!user) throw new Error('User is required.');

  _.each(user.pushDevices, pushDevice => {
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
        // TODO implement
        break;
    }
  });
};
