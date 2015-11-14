import request from 'request';
import nconf from 'nconf';
import nodemailer from 'nodemailer';
import Q from 'q';
import logger from '../../../../../website/src/libs/api-v3/logger';

function getUser () {
  return {
    _id: 'random _id',
    auth: {
      local: {
        username: 'username',
        email: 'email@email',
      },
      facebook: {
        emails: [{
          value: 'email@facebook'
        }],
        displayName: 'fb display name',
      }
    },
    profile: {
      name: 'profile name',
    },
    preferences: {
      emailNotifications: {
        unsubscribeFromAll: false
      },
    },
  };
};

describe('emails', () => {
  let pathToEmailLib = '../../../../../website/src/libs/api-v3/email';

  beforeEach(() => {
    delete require.cache[require.resolve(pathToEmailLib)];
    sandbox.stub(request, 'post');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('sendEmail', () => {
    it('can send an email using the default transport', () => {
      let sendMailSpy = sandbox.stub().returns(Q.defer().promise);

      sandbox.stub(nodemailer, 'createTransport').returns({
        sendMail: sendMailSpy,
      });

      let attachEmail = require(pathToEmailLib);
      attachEmail.send();
      expect(sendMailSpy).to.be.calledOnce;
    });

    it('logs errors', (done) => {
      let deferred = Q.defer();
      let sendMailSpy = sandbox.stub().returns(deferred.promise);

      sandbox.stub(nodemailer, 'createTransport').returns({
        sendMail: sendMailSpy,
      });
      sandbox.stub(logger, 'error');

      let attachEmail = require(pathToEmailLib);
      attachEmail.send();
      expect(sendMailSpy).to.be.calledOnce;
      deferred.reject();
      deferred.promise.catch((err) => {
        expect(logger.error).to.be.calledOnce;
        done();
      });
    });
  });

  describe('getUserInfo', () => {
    it('returns an empty object if no field request', () => {
      let attachEmail = require(pathToEmailLib);
      let getUserInfo = attachEmail.getUserInfo;
      expect(getUserInfo({}, [])).to.be.empty;
    });

    it('returns correct user data', () => {
      let attachEmail = require(pathToEmailLib);
      let getUserInfo = attachEmail.getUserInfo;
      let user = getUser();
      let data = getUserInfo(user, ['name', 'email', '_id', 'canSend']);

      expect(data).to.have.property('name', user.profile.name);
      expect(data).to.have.property('email', user.auth.local.email);
      expect(data).to.have.property('_id', user._id);
      expect(data).to.have.property('canSend', true);
    });

    it('returns correct user data [facebook users]', () => {
      let attachEmail = require(pathToEmailLib);
      let getUserInfo = attachEmail.getUserInfo;
      let user = getUser();
      delete user.profile['name'];
      delete user.auth['local'];

      let data = getUserInfo(user, ['name', 'email', '_id', 'canSend']);
      
      expect(data).to.have.property('name', user.auth.facebook.displayName);
      expect(data).to.have.property('email', user.auth.facebook.emails[0].value);
      expect(data).to.have.property('_id', user._id);
      expect(data).to.have.property('canSend', true);
    });

    it('has fallbacks for missing data', () => {
      let attachEmail = require(pathToEmailLib);
      let getUserInfo = attachEmail.getUserInfo;
      let user = getUser();
      delete user.profile['name'];
      delete user.auth.local['email']
      delete user.auth['facebook'];

      let data = getUserInfo(user, ['name', 'email', '_id', 'canSend']);
      
      expect(data).to.have.property('name', user.auth.local.username);
      expect(data).not.to.have.property('email');
      expect(data).to.have.property('_id', user._id);
      expect(data).to.have.property('canSend', true);
    });
  });

  describe('sendTxnEmail', () => {
    it
  });
});
