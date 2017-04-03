import _ from 'lodash';
import nconf from 'nconf';
// TODO remove this lib and use directly the apn module
import pushNotify from 'push-notify';
import apnLib from 'apn';
import logger from './logger';
import Bluebird from 'bluebird';
import {
  S3,
} from './aws';
import gcmLib from 'node-gcm'; // works with FCM notifications too

const FCM_API_KEY = nconf.get('PUSH_CONFIGS:FCM_SERVER_API_KEY');

const fcmSender = FCM_API_KEY ? new gcmLib.Sender(FCM_API_KEY) : undefined;

let apn;

// Load APN certificate and key from S3
const APN_ENABLED = nconf.get('PUSH_CONFIGS:APN_ENABLED') === 'true';
const S3_BUCKET = nconf.get('S3:bucket');

if (APN_ENABLED) {
  Bluebird.all([
    S3.getObject({
      Bucket: S3_BUCKET,
      Key: 'apple_apn/cert.pem',
    }).promise(),
    S3.getObject({
      Bucket: S3_BUCKET,
      Key: 'apple_apn/key.pem',
    }).promise(),
  ])
  .then(([certObj, keyObj]) => {
    let cert = certObj.Body.toString();
    let key = keyObj.Body.toString();

    apn = pushNotify.apn({
      key,
      cert,
    });

    apn.on('error', err => logger.error('APN error', err));
    apn.on('transmissionError', (errorCode, notification, device) => {
      logger.error('APN transmissionError', errorCode, notification, device);
    });

    let feedback = new apnLib.Feedback({
      key,
      cert,
      batchFeedback: true,
      interval: 3600, // Check for feedback once an hour
    });

    feedback.on('feedback', (devices) => {
      if (devices && devices.length > 0) {
        logger.info('Delivery of push notifications failed for some Apple devices.', devices);
      }
    });
  });
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
          }, 10, (err) => logger.error('FCM Error', err));
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
}

module.exports = {
  sendNotification,
};
