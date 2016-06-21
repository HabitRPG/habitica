import { model as User } from '../../../../../website/server/models/user';
import requireAgain from 'require-again';
import pushNotify from 'push-notify';
import nconf from 'nconf';

describe('pushNotifications', () => {
  let user;
  let sendPushNotification;
  let pathToPushNotifications = '../../../../../website/server/libs/api-v3/pushNotifications';
  let gcmSendSpy;
  let apnSendSpy;

  let identifier = 'identifier';
  let title = 'title';
  let message = 'message';

  beforeEach(() => {
    user = new User();
    gcmSendSpy = sinon.spy();
    apnSendSpy = sinon.spy();

    sandbox.stub(nconf, 'get').returns('true');

    sandbox.stub(pushNotify, 'gcm').returns({
      on: () => null,
      send: gcmSendSpy,
    });

    sandbox.stub(pushNotify, 'apn').returns({
      on: () => null,
      send: apnSendSpy,
    });

    sendPushNotification = requireAgain(pathToPushNotifications);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('throws if user is not supplied', () => {
    expect(sendPushNotification).to.throw;
    expect(gcmSendSpy).to.not.have.been.called;
    expect(apnSendSpy).to.not.have.been.called;
  });

  it('throws if user.preferences.pushNotifications.unsubscribeFromAll is true', () => {
    user.preferences.pushNotifications.unsubscribeFromAll = true;
    expect(() => sendPushNotification(user)).to.throw;
    expect(gcmSendSpy).to.not.have.been.called;
    expect(apnSendSpy).to.not.have.been.called;
  });

  it('throws if details.identifier is not supplied', () => {
    expect(() => sendPushNotification(user, {
      title,
      message,
    })).to.throw;
    expect(gcmSendSpy).to.not.have.been.called;
    expect(apnSendSpy).to.not.have.been.called;
  });

  it('throws if details.title is not supplied', () => {
    expect(() => sendPushNotification(user, {
      identifier,
      message,
    })).to.throw;
    expect(gcmSendSpy).to.not.have.been.called;
    expect(apnSendSpy).to.not.have.been.called;
  });

  it('throws if details.message is not supplied', () => {
    expect(() => sendPushNotification(user, {
      identifier,
      title,
    })).to.throw;
    expect(gcmSendSpy).to.not.have.been.called;
    expect(apnSendSpy).to.not.have.been.called;
  });

  it('returns if no device is registered', () => {
    sendPushNotification(user, {
      identifier,
      title,
      message,
    });
    expect(gcmSendSpy).to.not.have.been.called;
    expect(apnSendSpy).to.not.have.been.called;
  });

  it('uses GCM for Android devices', () => {
    user.pushDevices.push({
      type: 'android',
      regId: '123',
    });

    let details = {
      identifier,
      title,
      message,
      payload: {
        a: true,
        b: true,
      },
      timeToLive: 23,
    };

    sendPushNotification(user, details);
    expect(gcmSendSpy).to.have.been.calledOnce;
    expect(gcmSendSpy).to.have.been.calledWithMatch({
      registrationId: '123',
      delayWhileIdle: true,
      timeToLive: 23,
      data: {
        identifier,
        title,
        message,
        a: true,
        b: true,
      },
    });
    expect(apnSendSpy).to.not.have.been.called;
  });

  it('defaults timeToLive to 15', () => {
    user.pushDevices.push({
      type: 'android',
      regId: '123',
    });

    let details = {
      identifier,
      title,
      message,
    };

    sendPushNotification(user, details);
    expect(gcmSendSpy).to.have.been.calledOnce;
    expect(gcmSendSpy).to.have.been.calledWithMatch({
      registrationId: '123',
      delayWhileIdle: true,
      timeToLive: 15,
      data: {
        identifier,
        title,
        message,
      },
    });
    expect(apnSendSpy).to.not.have.been.called;
  });

  it('uses APN for iOS devices', () => {
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
    expect(gcmSendSpy).to.not.have.been.called;
  });
});
