import apn from '@parse/node-apn/mock';
import _ from 'lodash';
import nconf from 'nconf';
import gcmLib from 'node-gcm'; // works with FCM notifications too
import { model as User } from '../../../../website/server/models/user';
import {
  sendNotification as sendPushNotification,
  MAX_MESSAGE_LENGTH,
} from '../../../../website/server/libs/pushNotifications';

describe('pushNotifications', () => {
  let user;
  let fcmSendSpy;
  let apnSendSpy;

  const identifier = 'identifier';
  const title = 'title';
  const message = 'message';

  beforeEach(() => {
    user = new User();
    fcmSendSpy = sinon.spy();
    apnSendSpy = sinon.spy();

    sandbox.stub(nconf, 'get').returns('true-key');

    sandbox.stub(gcmLib.Sender.prototype, 'send').callsFake(fcmSendSpy);

    sandbox.stub(apn.Provider.prototype, 'send').returns({
      on: () => null,
      send: apnSendSpy,
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

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

  // TODO disabled because APN relies on a Promise
  xit('uses APN for iOS devices', () => {
    user.pushDevices.push({
      type: 'ios',
      regId: '123',
    });

    const details = {
      identifier,
      title,
      message,
      category: 'fun',
      payload: {
        a: true,
        b: true,
      },
    };

    const expectedNotification = new apn.Notification({
      alert: message,
      sound: 'default',
      category: 'fun',
      payload: {
        identifier,
        a: true,
        b: true,
      },
    });

    sendPushNotification(user, details);
    expect(apnSendSpy).to.have.been.calledOnce;
    expect(apnSendSpy).to.have.been.calledWithMatch(expectedNotification, '123');
    expect(fcmSendSpy).to.not.have.been.called;
  });
});
