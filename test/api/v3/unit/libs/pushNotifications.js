import { model as User } from '../../../../../website/server/models/user';
import requireAgain from 'require-again';
import pushNotify from 'push-notify';
import nconf from 'nconf';
import gcmLib from 'node-gcm'; // works with FCM notifications too

describe('pushNotifications', () => {
  let user;
  let sendPushNotification;
  let pathToPushNotifications = '../../../../../website/server/libs/pushNotifications';
  let fcmSendSpy;
  let apnSendSpy;

  let identifier = 'identifier';
  let title = 'title';
  let message = 'message';

  beforeEach(() => {
    user = new User();
    fcmSendSpy = sinon.spy();
    apnSendSpy = sinon.spy();

    sandbox.stub(nconf, 'get').returns('true-key');

    sandbox.stub(gcmLib.Sender.prototype, 'send', fcmSendSpy);

    sandbox.stub(pushNotify, 'apn').returns({
      on: () => null,
      send: apnSendSpy,
    });

    sendPushNotification = requireAgain(pathToPushNotifications).sendNotification;
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

  // TODO disabled because APN relies on a Promise
  xit('uses APN for iOS devices', () => {
    user.pushDevices.push({
      type: 'ios',
      regId: '123',
    });

    let details = {
      identifier,
      title,
      message,
      category: 'fun',
      payload: {
        a: true,
        b: true,
      },
    };

    sendPushNotification(user, details);
    expect(apnSendSpy).to.have.been.calledOnce;
    expect(apnSendSpy).to.have.been.calledWithMatch({
      token: '123',
      alert: message,
      sound: 'default',
      category: 'fun',
      payload: {
        identifier,
        a: true,
        b: true,
      },
    });
    expect(fcmSendSpy).to.not.have.been.called;
  });
});
