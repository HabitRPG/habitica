import _ from 'lodash';
import nconf from 'nconf';
import apn from 'apn';
import gcmLib from 'node-gcm'; // works with FCM notifications too
import logger from './logger';

const FCM_API_KEY = nconf.get('PUSH_CONFIGS_FCM_SERVER_API_KEY');
const fcmSender = FCM_API_KEY ? new gcmLib.Sender(FCM_API_KEY) : undefined;

const APN_ENABLED = nconf.get('PUSH_CONFIGS_APN_ENABLED') === 'true';
const apnProvider = APN_ENABLED ? new apn.Provider({
  token: {
    key: nconf.get('PUSH_CONFIGS_APN_KEY'),
    keyId: nconf.get('PUSH_CONFIGS_APN_KEY_ID'),
    teamId: nconf.get('PUSH_CONFIGS_APN_TEAM_ID'),
  },
  production: true,
}) : undefined;

function removePushDevice (user, pushDevice) {
  return user.update({
    $pull: { pushDevices: { regId: pushDevice.regId } },
  }).exec().catch(err => {
    logger.error(err, `Error removing push device ${pushDevice.regId} for user ${user._id}`);
  });
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
          }, 10, (err, response) => {
            if (err) logger.error(err, 'Unhandled FCM error.');

            // Handle failed push notifications deliveries
            // Note that we're always sending to one device, not multiple
            const failed = response.results[0].error;

            if (failed != null) {
              // See https://firebase.google.com/docs/cloud-messaging/http-server-ref#table9
              // for the list of errors

              // The regId is not valid anymore, remove it
              if (failed === 'NotRegistered') {
                removePushDevice(user, pushDevice);
                logger.error(new Error('FCM error, removing pushDevice'), {
                  response, regId: pushDevice.regId, userId: user._id,
                });
              } else {
                logger.error(new Error('FCM error'), {
                  response, regId: pushDevice.regId, userId: user._id,
                });
              }
            }
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
              // Handle failed push notifications deliveries
              response.failed.forEach(failure => {
                if (failure.error) { // generic error
                  logger.error(new Error('APN error'), {
                    response, regId: pushDevice.regId, userId: user._id,
                  });
                } else { // rejected
                  // see https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CommunicatingwithAPNs.html#//apple_ref/doc/uid/TP40008194-CH11-SW17
                  // for a list of rejection reasons
                  const { reason } = failure.response;
                  if (reason === 'Unregistered') {
                    logger.error(new Error('APN error, removing pushDevice'), {
                      response, regId: pushDevice.regId, userId: user._id,
                    });
                  } else {
                    logger.error(new Error('APN error'), {
                      response, regId: pushDevice.regId, userId: user._id,
                    });
                  }
                }
              });
            })
            .catch(err => logger.error(err, 'Unhandled APN error.'));
        }
        break;
    }
  });
}

export {
  sendNotification, // eslint-disable-line import/prefer-default-export
};
