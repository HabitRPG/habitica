/* eslint-disable global-require */
import request from 'request';
import nconf from 'nconf';
import nodemailer from 'nodemailer';
import Bluebird from 'bluebird';
import requireAgain from 'require-again';
import logger from '../../../../../website/server/libs/logger';
import { TAVERN_ID } from '../../../../../website/server/models/group';

function defer () {
  let resolve;
  let reject;

  let promise = new Bluebird((resolveParam, rejectParam) => {
    resolve = resolveParam;
    reject = rejectParam;
  });

  return {
    resolve,
    reject,
    promise,
  };
}

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
          value: 'email@facebook',
        }],
        displayName: 'fb display name',
      },
    },
    profile: {
      name: 'profile name',
    },
    preferences: {
      emailNotifications: {
        unsubscribeFromAll: false,
      },
    },
  };
}

describe('emails', () => {
  let pathToEmailLib = '../../../../../website/server/libs/email';

  describe('sendEmail', () => {
    let sendMailSpy;

    beforeEach(() => {
      sendMailSpy = sandbox.stub().returns(defer().promise);
      sandbox.stub(nodemailer, 'createTransport').returns({
        sendMail: sendMailSpy,
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('can send an email using the default transport', () => {
      let attachEmail = requireAgain(pathToEmailLib);
      attachEmail.send();
      expect(sendMailSpy).to.be.calledOnce;
    });

    it('logs errors', (done) => {
      sandbox.stub(logger, 'error');

      let attachEmail = requireAgain(pathToEmailLib);
      attachEmail.send();
      expect(sendMailSpy).to.be.calledOnce;
      defer().reject();

      // wait for unhandledRejection event to fire
      setTimeout(() => {
        expect(logger.error).to.be.calledOnce;
        done();
      }, 20);
    });
  });

  describe('getUserInfo', () => {
    it('returns an empty object if no field request', () => {
      let attachEmail = requireAgain(pathToEmailLib);
      let getUserInfo = attachEmail.getUserInfo;
      expect(getUserInfo({}, [])).to.be.empty;
    });

    it('returns correct user data', () => {
      let attachEmail = requireAgain(pathToEmailLib);
      let getUserInfo = attachEmail.getUserInfo;
      let user = getUser();
      let data = getUserInfo(user, ['name', 'email', '_id', 'canSend']);

      expect(data).to.have.property('name', user.profile.name);
      expect(data).to.have.property('email', user.auth.local.email);
      expect(data).to.have.property('_id', user._id);
      expect(data).to.have.property('canSend', true);
    });

    it('returns correct user data [facebook users]', () => {
      let attachEmail = requireAgain(pathToEmailLib);
      let getUserInfo = attachEmail.getUserInfo;
      let user = getUser();
      delete user.profile.name;
      delete user.auth.local;

      let data = getUserInfo(user, ['name', 'email', '_id', 'canSend']);

      expect(data).to.have.property('name', user.auth.facebook.displayName);
      expect(data).to.have.property('email', user.auth.facebook.emails[0].value);
      expect(data).to.have.property('_id', user._id);
      expect(data).to.have.property('canSend', true);
    });

    it('has fallbacks for missing data', () => {
      let attachEmail = requireAgain(pathToEmailLib);
      let getUserInfo = attachEmail.getUserInfo;
      let user = getUser();
      delete user.profile.name;
      delete user.auth.local.email;
      delete user.auth.facebook;

      let data = getUserInfo(user, ['name', 'email', '_id', 'canSend']);

      expect(data).to.have.property('name', user.auth.local.username);
      expect(data).not.to.have.property('email');
      expect(data).to.have.property('_id', user._id);
      expect(data).to.have.property('canSend', true);
    });
  });

  describe('getGroupUrl', () => {
    it('returns correct url if group is the tavern', () => {
      let getGroupUrl = require(pathToEmailLib).getGroupUrl;
      expect(getGroupUrl({_id: TAVERN_ID, type: 'guild'})).to.eql('/groups/tavern');
    });

    it('returns correct url if group is a guild', () => {
      let getGroupUrl = require(pathToEmailLib).getGroupUrl;
      expect(getGroupUrl({_id: 'random _id', type: 'guild'})).to.eql('/groups/guild/random _id');
    });

    it('returns correct url if group is a party', () => {
      let getGroupUrl = require(pathToEmailLib).getGroupUrl;
      expect(getGroupUrl({_id: 'random _id', type: 'party'})).to.eql('party');
    });
  });

  describe('sendTxnEmail', () => {
    beforeEach(() => {
      sandbox.stub(request, 'post');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('can send a txn email to one recipient', () => {
      sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(true);
      let attachEmail = requireAgain(pathToEmailLib);
      let sendTxnEmail = attachEmail.sendTxn;
      let emailType = 'an email type';
      let mailingInfo = {
        name: 'my name',
        email: 'my@email',
      };

      sendTxnEmail(mailingInfo, emailType);
      expect(request.post).to.be.calledWith(sinon.match({
        json: {
          data: {
            emailType: sinon.match.same(emailType),
            to: sinon.match((value) => {
              return Array.isArray(value) && value[0].name === mailingInfo.name;
            }, 'matches mailing info array'),
          },
        },
      }));
    });

    it('does not send email if address is missing', () => {
      sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(true);
      let attachEmail = requireAgain(pathToEmailLib);
      let sendTxnEmail = attachEmail.sendTxn;
      let emailType = 'an email type';
      let mailingInfo = {
        name: 'my name',
        // email: 'my@email',
      };

      sendTxnEmail(mailingInfo, emailType);
      expect(request.post).not.to.be.called;
    });

    it('uses getUserInfo in case of user data', () => {
      sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(true);
      let attachEmail = requireAgain(pathToEmailLib);
      let sendTxnEmail = attachEmail.sendTxn;
      let emailType = 'an email type';
      let mailingInfo = getUser();

      sendTxnEmail(mailingInfo, emailType);
      expect(request.post).to.be.calledWith(sinon.match({
        json: {
          data: {
            emailType: sinon.match.same(emailType),
            to: sinon.match(val => val[0]._id === mailingInfo._id),
          },
        },
      }));
    });

    it('sends email with some default variables', () => {
      sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(true);
      let attachEmail = requireAgain(pathToEmailLib);
      let sendTxnEmail = attachEmail.sendTxn;
      let emailType = 'an email type';
      let mailingInfo = {
        name: 'my name',
        email: 'my@email',
      };
      let variables = [1, 2, 3];

      sendTxnEmail(mailingInfo, emailType, variables);
      expect(request.post).to.be.calledWith(sinon.match({
        json: {
          data: {
            variables: sinon.match((value) => {
              return value[0].name === 'BASE_URL';
            }, 'matches variables'),
            personalVariables: sinon.match((value) => {
              return value[0].rcpt === mailingInfo.email &&
                value[0].vars[0].name === 'RECIPIENT_NAME' &&
                value[0].vars[1].name === 'RECIPIENT_UNSUB_URL';
            }, 'matches personal variables'),
          },
        },
      }));
    });
  });
});
