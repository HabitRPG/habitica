import _ from 'lodash';
import nconf from 'nconf';
import pushNotify from 'push-notify';
import apnLib from 'apn';
import logger from './logger';

const GCM_API_KEY = nconf.get('PUSH_CONFIGS:GCM_SERVER_API_KEY');

let gcm = GCM_API_KEY ? pushNotify.gcm({
  apiKey: GCM_API_KEY,
  retries: 3,
}) : undefined;

if (gcm) {
  gcm.on('transmissionError', (err, message, registrationId) => {
    logger.error('GCM Error', err, message, registrationId);
  });
}

const APN_CERT = nconf.get('PUSH_CONFIGS:APN_PEM_FILES:CERT');
const APN_KEY_PART_1 = (nconf.get('PUSH_CONFIGS:APN_PEM_FILES:KEY_PART_1') || '').trim();
const APN_KEY_PART_2 = (nconf.get('PUSH_CONFIGS:APN_PEM_FILES:KEY_PART_2') || '').trim();
const APN_KEY = APN_KEY_PART_1 + APN_KEY_PART_2;

// Split key into two parts, because we have to stay below 4096 bytes for env
// Variables.
let apn = APN_CERT ? pushNotify.apn({
  key: APN_KEY.trim(),
  cert: APN_CERT.trim(),
}) : undefined;

if (apn) {
  apn.on('error', err => logger.error('APN error', err));
  apn.on('transmissionError', (errorCode, notification, device) => {
    logger.error('APN transmissionError', errorCode, notification, device);
  });

  let feedback = new apnLib.Feedback({
    key: APN_KEY,
    cert: APN_CERT,
    batchFeedback: true,
    interval: 3600, // Check for feedback once an hour
  });

  feedback.on('feedback', (devices) => {
    logger.info('Delivery of push notifications failed for some Apple devices.', devices);
  });
}

module.exports = function sendNotification (user, details = {}) {
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
        if (gcm) {
          payload.title = details.title;
          payload.message = details.message;
          gcm.send({
            registrationId: pushDevice.regId,
            delayWhileIdle: true,
            timeToLive: details.timeToLive ? details.timeToLive : 15,
            data: payload,
          });
        }
        break;

      case 'ios':
        if (apn) {
          apn.send({
            token: pushDevice.regId,
            alert: details.message,
            sound: 'default',
            category: details.category,
            payload,
          });
        }
        break;
    }
  });
};
