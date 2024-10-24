import apn from '@parse/node-apn';
import _ from 'lodash';
import nconf from 'nconf';
import admin from 'firebase-admin';
import { model as User } from '../../../../website/server/models/user';
import {
  MAX_MESSAGE_LENGTH,
} from '../../../../website/server/libs/pushNotifications';

let sendPushNotification;

describe('pushNotifications', () => {
  let user;
  let fcmSendSpy;
  let apnSendSpy;
  let updateStub;
  let classStubbedInstance;

  const identifier = 'identifier';
  const title = 'title';
  const message = 'message';

  beforeEach(() => {
    user = new User();
    fcmSendSpy = sinon.stub().returns(Promise.resolve('success'));
    apnSendSpy = sinon.stub().returns(Promise.resolve());

    nconf.set('PUSH_CONFIGS_APN_ENABLED', 'true');

    classStubbedInstance = sandbox.createStubInstance(apn.Provider, {
      send: apnSendSpy,
    });
    sandbox.stub(apn, 'Provider').returns(classStubbedInstance);

    delete require.cache[require.resolve('../../../../website/server/libs/pushNotifications')];
    // eslint-disable-next-line global-require
    sendPushNotification = require('../../../../website/server/libs/pushNotifications').sendNotification;

    updateStub = sandbox.stub(User, 'updateOne').resolves();
    sandbox.stub(admin, 'messaging').get(() => () => ({ send: fcmSendSpy }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('validates supplied data', () => {
    it('throws if user is not supplied', () => {
      expect(sendPushNotification).to.throw;
      expect(fcmSendSpy).to.not.have.been.called;
      expect(apnSendSpy).to.not.have.been.called;
    });

    it('throws if user.preferences.pushNotifications.unsubscribeFromAll is true', () => {
      user.preferences.pushNotifications.unsubscribeFromAll = true;
      expect(() => sendPushNotification(user)).to.throw;
      expect(fcmSendSpy).to.not.have.been.called;
      expect(apnSendSpy).to.not.have.been.called;
    });

    it('throws if details.identifier is not supplied', () => {
      expect(() => sendPushNotification(user, {
        title,
        message,
      })).to.throw;
      expect(fcmSendSpy).to.not.have.been.called;
      expect(apnSendSpy).to.not.have.been.called;
    });

    it('throws if details.title is not supplied', () => {
      expect(() => sendPushNotification(user, {
        identifier,
        message,
      })).to.throw;
      expect(fcmSendSpy).to.not.have.been.called;
      expect(apnSendSpy).to.not.have.been.called;
    });

    it('throws if details.message is not supplied', () => {
      expect(() => sendPushNotification(user, {
        identifier,
        title,
      })).to.throw;
      expect(fcmSendSpy).to.not.have.been.called;
      expect(apnSendSpy).to.not.have.been.called;
    });

    it('returns if no device is registered', () => {
      sendPushNotification(user, {
        identifier,
        title,
        message,
      });
      expect(fcmSendSpy).to.not.have.been.called;
      expect(apnSendSpy).to.not.have.been.called;
    });
  });

  it('cuts the message to 300 chars', () => {
    const longMessage = `12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345`;

    expect(longMessage.length > MAX_MESSAGE_LENGTH).to.equal(true);

    const details = {
      identifier,
      title,
      message: longMessage,
      payload: {
        message: longMessage,
      },
    };

    sendPushNotification(user, details);

    expect(details.message).to.equal(_.truncate(longMessage, { length: MAX_MESSAGE_LENGTH }));
    expect(details.payload.message)
      .to.equal(_.truncate(longMessage, { length: MAX_MESSAGE_LENGTH }));

    expect(details.message.length).to.equal(MAX_MESSAGE_LENGTH);
    expect(details.payload.message.length).to.equal(MAX_MESSAGE_LENGTH);
  });

  it('cuts the message to 300 chars (no payload)', () => {
    const longMessage = `12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345
      12345 12345 12345 12345 12345 12345 12345 12345 12345 12345`;

    expect(longMessage.length > MAX_MESSAGE_LENGTH).to.equal(true);

    const details = {
      identifier,
      title,
      message: longMessage,
    };

    sendPushNotification(user, details);

    expect(details.message).to.equal(_.truncate(longMessage, { length: MAX_MESSAGE_LENGTH }));
    expect(details.message.length).to.equal(MAX_MESSAGE_LENGTH);
  });

  describe('sends notifications', () => {
    let details;

    beforeEach(() => {
      details = {
        identifier,
        title,
        message,
        category: 'fun',
        payload: {
          a: true,
          b: true,
        },
      };
    });

    it('uses APN for iOS devices', async () => {
      user.pushDevices.push({
        type: 'ios',
        regId: '123',
      });

      const expectedNotification = new apn.Notification({
        alert: {
          title,
          body: message,
        },
        sound: 'default',
        category: 'fun',
        payload: {
          identifier,
          a: true,
          b: true,
        },
      });

      await sendPushNotification(user, details);
      expect(apnSendSpy).to.have.been.calledOnce;
      expect(apnSendSpy).to.have.been.calledWithMatch(expectedNotification, '123');
      expect(fcmSendSpy).to.not.have.been.called;
    });

    it('uses FCM for Android devices', async () => {
      user.pushDevices.push({
        type: 'android',
        regId: '123',
      });

      const expectedMessage = {
        notification: {
          title,
          body: message,
        },
        data: {
          identifier,
          notificationIdentifier: identifier,
        },
        token: '123',
      };

      await sendPushNotification(user, details);
      expect(fcmSendSpy).to.have.been.calledOnce;
      expect(fcmSendSpy).to.have.been.calledWithMatch(expectedMessage);
      expect(apnSendSpy).to.not.have.been.called;
    });

    it('handles multiple devices', async () => {
      user.pushDevices.push({
        type: 'android',
        regId: '123',
      });
      user.pushDevices.push({
        type: 'ios',
        regId: '456',
      });
      user.pushDevices.push({
        type: 'android',
        regId: '789',
      });

      await sendPushNotification(user, details);
      expect(fcmSendSpy).to.have.been.calledTwice;
      expect(apnSendSpy).to.have.been.calledOnce;
    });
  });

  describe('handles sending errors', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      clock.restore();
    });

    it('removes unregistered fcm devices', async () => {
      user.pushDevices.push({
        type: 'android',
        regId: '123',
      });

      const error = new Error();
      error.code = 'messaging/registration-token-not-registered';
      fcmSendSpy.rejects(error);

      await sendPushNotification(user, {
        identifier,
        title,
        message,
      });

      expect(fcmSendSpy).to.have.been.calledOnce;
      expect(apnSendSpy).to.not.have.been.called;
      await clock.tick(10);
      expect(updateStub).to.have.been.calledOnce;
    });

    it('removes invalid fcm devices', async () => {
      user.pushDevices.push({
        type: 'android',
        regId: '123',
      });

      const error = new Error();
      error.code = 'messaging/registration-token-not-registered';
      fcmSendSpy.rejects(error);

      await sendPushNotification(user, {
        identifier,
        title,
        message,
      });

      expect(fcmSendSpy).to.have.been.calledOnce;
      expect(apnSendSpy).to.not.have.been.called;
      expect(updateStub).to.have.been.calledOnce;
    });

    it('removes unregistered apn devices', async () => {
      user.pushDevices.push({
        type: 'ios',
        regId: '123',
      });

      const error = {
        failed: [
          {
            device: '123',
            response: { reason: 'Unregistered' },
          },
        ],
      };
      apnSendSpy.resolves(error);

      await sendPushNotification(user, {
        identifier,
        title,
        message,
      });

      expect(fcmSendSpy).to.not.have.been.called;
      expect(apnSendSpy).to.have.been.calledOnce;
      expect(updateStub).to.have.been.calledOnce;
    });

    it('removes invalid apn devices', async () => {
      user.pushDevices.push({
        type: 'ios',
        regId: '123',
      });

      const error = {
        failed: [
          {
            device: '123',
            response: { reason: 'BadDeviceToken' },
          },
        ],
      };
      apnSendSpy.resolves(error);

      await sendPushNotification(user, {
        identifier,
        title,
        message,
      });

      expect(fcmSendSpy).to.not.have.been.called;
      expect(apnSendSpy).to.have.been.calledOnce;
      expect(updateStub).to.have.been.calledOnce;
    });
  });
});
