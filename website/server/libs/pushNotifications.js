import _ from 'lodash';
import nconf from 'nconf';
import apn from '@parse/node-apn';
import gcmLib from 'node-gcm'; // works with FCM notifications too
import logger from './logger';
import { // eslint-disable-line import/no-cycle
  model as User,
} from '../models/user';

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
  return User.updateOne({ _id: user._id }, {
    $pull: { pushDevices: { regId: pushDevice.regId } },
  }).exec().catch(err => {
    logger.error(err, `Error removing pushDevice ${pushDevice.regId} for user ${user._id}`);
  });
}

export const MAX_MESSAGE_LENGTH = 300;

export function sendNotification (user, details = {}) {
  if (!user) throw new Error('User is required.');
  if (user.preferences.pushNotifications.unsubscribeFromAll === true) return;
  const pushDevices = user.pushDevices.toObject ? user.pushDevices.toObject() : user.pushDevices;

  if (!details.identifier) throw new Error('details.identifier is required.');
  if (!details.title) throw new Error('details.title is required.');
  if (!details.message) throw new Error('details.message is required.');

  const payload = details.payload ? details.payload : {};
  payload.identifier = details.identifier;

  // Cut the message to 300 characters to avoid going over the limit of 4kb per notifications
  if (details.message.length > MAX_MESSAGE_LENGTH) {
    details.message = _.truncate(details.message, { length: MAX_MESSAGE_LENGTH });
  }

  if (payload.message && payload.message.length > MAX_MESSAGE_LENGTH) {
    payload.message = _.truncate(payload.message, { length: MAX_MESSAGE_LENGTH });
  }

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
          }, 5, (err, response) => {
            if (err) {
              logger.error(err, 'Unhandled FCM error.');
              return;
            }

            // Handle failed push notifications deliveries
            // Note that we're always sending to one device, not multiple
            const failed = response
              && response.results && response.results[0] && response.results[0].error;

            if (failed) {
              // See https://firebase.google.com/docs/cloud-messaging/http-server-ref#table9
              // for the list of errors

              // The regId is not valid anymore, remove it
              if (failed === 'NotRegistered') {
                removePushDevice(user, pushDevice);
                logger.error(new Error('FCM error, unregistered pushDevice'), {
                  regId: pushDevice.regId, userId: user._id,
                });
              } else {
                // An invalid token was registered by mistake
                // Remove it but log the error differently so that it can be distinguished
                // from when failed === NotRegistered
                // Blacklisted can happen in some rare cases,
                // see https://stackoverflow.com/questions/42136122/why-does-firebase-push-token-return-blacklisted
                // MismatchSenderId could be due to old tokens,
                // see https://stackoverflow.com/questions/11313342/why-do-i-get-mismatchsenderid-from-gcm-server-side
                if (
                  failed === 'InvalidRegistration'
                  || failed === 'MismatchSenderId'
                  || pushDevice.regId === 'BLACKLISTED'
                ) {
                  removePushDevice(user, pushDevice);
                }
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
                  logger.error(new Error('Unhandled APN error'), {
                    response, regId: pushDevice.regId, userId: user._id,
                  });
                } else { // rejected
                  // see https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CommunicatingwithAPNs.html#//apple_ref/doc/uid/TP40008194-CH11-SW17
                  // for a list of rejection reasons
                  const { reason } = failure.response;
                  if (reason === 'Unregistered') {
                    removePushDevice(user, pushDevice);
                    logger.error(new Error('APN error, unregistered pushDevice'), {
                      regId: pushDevice.regId, userId: user._id,
                    });
                  } else {
                    if (reason === 'BadDeviceToken') {
                      // An invalid token was registered by mistake
                      // Remove it but log the error differently so that it can be distinguished
                      // from when reason === Unregistered
                      removePushDevice(user, pushDevice);
                    }
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
