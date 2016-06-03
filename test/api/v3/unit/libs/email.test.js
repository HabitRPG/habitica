/* eslint-disable global-require */
import request from 'request';
import nconf from 'nconf';
import nodemailer from 'nodemailer';
import Bluebird from 'bluebird';
import requireAgain from 'require-again';
import logger from '../../../../../website/server/libs/api-v3/logger';
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

function getGroup (type) {
  if (type === 'tavern') {
    return {
      _id: TAVERN_ID,
      type: 'guild',
    };
  } else if (type === 'guild') {
    return {
      _id: 'random _id',
      type: 'guild',
    };
  } else return {
    _id: 'random _id',
    type: 'group',
  };
}

describe('emails', () => {
  let pathToEmailLib = '../../../../../website/server/libs/api-v3/email';

  describe('sendEmail', () => {
    it('can send an email using the default transport', () => {
      let sendMailSpy = sandbox.stub().returns(defer().promise);

      sandbox.stub(nodemailer, 'createTransport').returns({
        sendMail: sendMailSpy,
      });

      let attachEmail = requireAgain(pathToEmailLib);
      attachEmail.send();
      expect(sendMailSpy).to.be.calledOnce;
    });

    it('logs errors', (done) => {
      let deferred = defer();
      let sendMailSpy = sandbox.stub().returns(deferred.promise);

      sandbox.stub(nodemailer, 'createTransport').returns({
        sendMail: sendMailSpy,
      });
      sandbox.stub(logger, 'error');

      let attachEmail = requireAgain(pathToEmailLib);
      attachEmail.send();
      expect(sendMailSpy).to.be.calledOnce;
      deferred.reject();

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
      let attachEmail = requireAgain(pathToEmailLib);
      let getGroupUrl = attachEmail.getGroupUrl;
      let group = getGroup('tavern');
      expect(getGroupUrl(group)).to.eql('/#/options/groups/tavern');
    });

    it('returns correct url if group is a guild', () => {
      let attachEmail = requireAgain(pathToEmailLib);
      let getGroupUrl = attachEmail.getGroupUrl;
      let group = getGroup('guild');
      expect(getGroupUrl(group)).to.eql(`/#/options/groups/guilds/${group._id}`);
    });

    it('returns correct url if group is a party', () => {
      let attachEmail = requireAgain(pathToEmailLib);
      let getGroupUrl = attachEmail.getGroupUrl;
      let group = getGroup('party');
      expect(getGroupUrl(group)).to.eql('party');
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
