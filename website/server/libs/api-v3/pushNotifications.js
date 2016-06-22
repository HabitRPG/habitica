import _ from 'lodash';
import nconf from 'nconf';
import pushNotify from 'push-notify';
import apnLib from 'apn';
import logger from './logger';
import Bluebird from 'bluebird';
import {
  S3,
} from './aws';

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
      Key: 'apple_apn/cert.pem',
    }).promise(),
  ])
  .then(([certObj, keyObj]) => {
    let cert = certObj.Body.toString();
    let key = keyObj.Body.toString();

    console.log(cert, key);
    apn = pushNotify.apn({
      key: cert,
      cert: key,
    });

    apn.on('error', err => logger.error('APN error', err));
    apn.on('transmissionError', (errorCode, notification, device) => {
      logger.error('APN transmissionError', errorCode, notification, device);
    });

    let feedback = new apnLib.Feedback({
      key: cert,
      cert: key,
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
