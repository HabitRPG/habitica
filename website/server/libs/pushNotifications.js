import _ from 'lodash';
import nconf from 'nconf';
import apn from 'apn';
import gcmLib from 'node-gcm'; // works with FCM notifications too
import logger from './logger';

const FCM_API_KEY = nconf.get('PUSH_CONFIGS_FCM_SERVER_API_KEY');

const fcmSender = FCM_API_KEY ? new gcmLib.Sender(FCM_API_KEY) : undefined;

let apnProvider;
// Load APN certificate and key from S3
const APN_ENABLED = nconf.get('PUSH_CONFIGS_APN_ENABLED') === 'true';

if (APN_ENABLED) {
  apnProvider = APN_ENABLED ? new apn.Provider({
    token: {
      key: nconf.get('PUSH_CONFIGS_APN_KEY'),
      keyId: nconf.get('PUSH_CONFIGS_APN_KEY_ID'),
      teamId: nconf.get('PUSH_CONFIGS_APN_TEAM_ID'),
    },
    production: true,
  }) : undefined;
}

function sendNotification (user, details = {}) {
  if (!user) throw new Error('User is required.');
  if (user.preferences.pushNotifications.unsubscribeFromAll === true) return;
  const pushDevices = user.pushDevices.toObject ? user.pushDevices.toObject() : user.pushDevices;

  if (!details.identifier) throw new Error('details.identifier is required.');
  if (!details.title) throw new Error('details.title is required.');
  if (!details.message) throw new Error('details.message is required.');

  const payload = details.payload ? details.payload : {};
  payload.identifier = details.identifier;

  _.each(pushDevices, pushDevice => {
    switch (pushDevice.type) { // eslint-disable-line default-case
      case 'android':
        // Required for fcm to be received in background
        payload.title = details.title;
        payload.body = details.message;

        if (fcmSender) {
          const message = new gcmLib.Message({
            data: payload,
          });

          fcmSender.send(message, {
            registrationTokens: [pushDevice.regId],
          }, 10, err => {
            if (err) logger.error(err, 'FCM Error');
          });
        }
        break;

      case 'ios':
        if (apnProvider) {
          const notification = new apn.Notification({
            alert: {
              title: details.title,
              body: details.message,
            },
            sound: 'default',
            category: details.category,
            topic: 'com.habitrpg.ios.Habitica',
            payload,
          });
          apnProvider.send(notification, pushDevice.regId)
            .then(response => {
              response.failed.forEach(failure => {
                if (failure.error) {
                  logger.error(new Error('APN error'), { failure });
                } else {
                  logger.error(new Error('APN transmissionError'), { failure, notification });
                }
              });
            })
            .catch(err => logger.error(err, 'APN error'));
        }
        break;
    }
  });
}

export {
  sendNotification, // eslint-disable-line import/prefer-default-export
};
