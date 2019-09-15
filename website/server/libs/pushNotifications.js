import _ from 'lodash';
import nconf from 'nconf';
import apn from 'apn';
import logger from './logger';
import gcmLib from 'node-gcm'; // works with FCM notifications too

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
    production: nconf.get('IS_PROD'),
  }) : undefined;
}

function sendNotification (user, details = {}) {
  if (!user) throw new Error('User is required.');
  if (user.preferences.pushNotifications.unsubscribeFromAll === true) return;
  let pushDevices = user.pushDevices.toObject ? user.pushDevices.toObject() : user.pushDevices;

  if (!details.identifier) throw new Error('details.identifier is required.');
  if (!details.title) throw new Error('details.title is required.');
  if (!details.message) throw new Error('details.message is required.');

  let payload = details.payload ? details.payload : {};
  payload.identifier = details.identifier;

  _.each(pushDevices, pushDevice => {
    switch (pushDevice.type) {
      case 'android':
        // Required for fcm to be received in background
        payload.title = details.title;
        payload.body = details.message;

        if (fcmSender) {
          let message = new gcmLib.Message({
            data: payload,
          });

          fcmSender.send(message, {
            registrationTokens: [pushDevice.regId],
          }, 10, (err) => logger.error(err, 'FCM Error'));
        }
        break;

      case 'ios':
        if (apnProvider) {
          const notification = new apn.Notification({
            alert: details.message,
            sound: 'default',
            category: details.category,
            topic: 'com.habitrpg.ios.Habitica',
            payload,
          });
          apnProvider.send(notification, pushDevice.regId)
            .then((response) => {
              response.failed.forEach((failure) => {
                if (failure.error) {
                  logger.error('APN error', failure.error);
                } else {
                  logger.error('APN transmissionError', failure.status, notification, failure.device);
                }
              });
            });
        }
        break;
    }
  });
}

module.exports = {
  sendNotification,
};
