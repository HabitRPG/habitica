/* eslint-disable global-require */
import got from 'got';
import nconf from 'nconf';
import requireAgain from 'require-again';
import { TAVERN_ID } from '../../../../website/server/models/group';
import { defer } from '../../../helpers/api-unit.helper';

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
      },
      google: {
        emails: [{
          value: 'email@google',
        }],
      },
      apple: {
        emails: [{
          value: 'email@apple',
        }],
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
  const pathToEmailLib = '../../../../website/server/libs/email';

  describe('getUserInfo', () => {
    it('returns an empty object if no field request', () => {
      const attachEmail = requireAgain(pathToEmailLib);
      const { getUserInfo } = attachEmail;
      expect(getUserInfo({}, [])).to.be.empty;
    });

    it('returns correct user data', () => {
      const attachEmail = requireAgain(pathToEmailLib);
      const { getUserInfo } = attachEmail;
      const user = getUser();
      const data = getUserInfo(user, ['name', 'email', '_id', 'canSend']);

      expect(data).to.have.property('name', user.auth.local.username);
      expect(data).to.have.property('email', user.auth.local.email);
      expect(data).to.have.property('_id', user._id);
      expect(data).to.have.property('canSend', true);
    });

    it('returns correct user data [facebook users]', () => {
      const attachEmail = requireAgain(pathToEmailLib);
      const { getUserInfo } = attachEmail;
      const user = getUser();
      delete user.profile.name;
      delete user.auth.local.email;
      delete user.auth.google.emails;
      delete user.auth.apple.emails;

      const data = getUserInfo(user, ['name', 'email', '_id', 'canSend']);

      expect(data).to.have.property('name', user.auth.local.username);
      expect(data).to.have.property('email', user.auth.facebook.emails[0].value);
      expect(data).to.have.property('_id', user._id);
      expect(data).to.have.property('canSend', true);
    });

    it('returns correct user data [google users]', () => {
      const attachEmail = requireAgain(pathToEmailLib);
      const { getUserInfo } = attachEmail;
      const user = getUser();
      delete user.profile.name;
      delete user.auth.local.email;
      delete user.auth.facebook.emails;
      delete user.auth.apple.emails;

      const data = getUserInfo(user, ['name', 'email', '_id', 'canSend']);

      expect(data).to.have.property('name', user.auth.local.username);
      expect(data).to.have.property('email', user.auth.google.emails[0].value);
      expect(data).to.have.property('_id', user._id);
      expect(data).to.have.property('canSend', true);
    });

    it('returns correct user data [apple users]', () => {
      const attachEmail = requireAgain(pathToEmailLib);
      const { getUserInfo } = attachEmail;
      const user = getUser();
      delete user.profile.name;
      delete user.auth.local.email;
      delete user.auth.google.emails;
      delete user.auth.facebook.emails;

      const data = getUserInfo(user, ['name', 'email', '_id', 'canSend']);

      expect(data).to.have.property('name', user.auth.local.username);
      expect(data).to.have.property('email', user.auth.apple.emails[0].value);
      expect(data).to.have.property('_id', user._id);
      expect(data).to.have.property('canSend', true);
    });

    it('has fallbacks for missing data', () => {
      const attachEmail = requireAgain(pathToEmailLib);
      const { getUserInfo } = attachEmail;
      const user = getUser();
      delete user.auth.local.email;
      delete user.auth.facebook;
      delete user.auth.google;
      delete user.auth.apple;

      const data = getUserInfo(user, ['name', 'email', '_id', 'canSend']);

      expect(data).to.have.property('name', user.auth.local.username);
      expect(data).not.to.have.property('email');
      expect(data).to.have.property('_id', user._id);
      expect(data).to.have.property('canSend', true);
    });
  });

  describe('getGroupUrl', () => {
    it('returns correct url if group is the tavern', () => {
      const { getGroupUrl } = require(pathToEmailLib); // eslint-disable-line import/no-dynamic-require, max-len
      expect(getGroupUrl({ _id: TAVERN_ID, type: 'guild' })).to.eql('/groups/tavern');
    });

    it('returns correct url if group is a guild', () => {
      const { getGroupUrl } = require(pathToEmailLib); // eslint-disable-line import/no-dynamic-require, max-len
      expect(getGroupUrl({ _id: 'random _id', type: 'guild' })).to.eql('/groups/guild/random _id');
    });

    it('returns correct url if group is a party', () => {
      const { getGroupUrl } = require(pathToEmailLib); // eslint-disable-line import/no-dynamic-require, max-len
      expect(getGroupUrl({ _id: 'random _id', type: 'party' })).to.eql('party');
    });
  });

  describe('sendTxnEmail', () => {
    beforeEach(() => {
      sandbox.stub(got, 'post').returns(defer().promise);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('can send a txn email to one recipient', () => {
      sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(true);
      const attachEmail = requireAgain(pathToEmailLib);
      const sendTxnEmail = attachEmail.sendTxn;
      const emailType = 'an email type';
      const mailingInfo = {
        name: 'my name',
        email: 'my@email',
      };

      sendTxnEmail(mailingInfo, emailType);
      expect(got.post).to.be.calledWith('undefined/job', sinon.match({
        json: {
          data: {
            emailType: sinon.match.same(emailType),
            to: sinon.match(value => Array.isArray(value) && value[0].name === mailingInfo.name, 'matches mailing info array'),
          },
        },
      }));
    });

    it('does not send email if address is missing', () => {
      sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(true);
      const attachEmail = requireAgain(pathToEmailLib);
      const sendTxnEmail = attachEmail.sendTxn;
      const emailType = 'an email type';
      const mailingInfo = {
        name: 'my name',
        // email: 'my@email',
      };

      sendTxnEmail(mailingInfo, emailType);
      expect(got.post).not.to.be.called;
    });

    it('uses getUserInfo in case of user data', () => {
      sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(true);
      const attachEmail = requireAgain(pathToEmailLib);
      const sendTxnEmail = attachEmail.sendTxn;
      const emailType = 'an email type';
      const mailingInfo = getUser();

      sendTxnEmail(mailingInfo, emailType);
      expect(got.post).to.be.calledWith('undefined/job', sinon.match({
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
      const attachEmail = requireAgain(pathToEmailLib);
      const sendTxnEmail = attachEmail.sendTxn;
      const emailType = 'an email type';
      const mailingInfo = {
        name: 'my name',
        email: 'my@email',
      };
      const variables = [1, 2, 3];

      sendTxnEmail(mailingInfo, emailType, variables);
      expect(got.post).to.be.calledWith('undefined/job', sinon.match({
        json: {
          data: {
            variables: sinon.match(value => value[0].name === 'BASE_URL', 'matches variables'),
            personalVariables: sinon.match(value => value[0].rcpt === mailingInfo.email
                && value[0].vars[0].name === 'RECIPIENT_NAME'
                && value[0].vars[1].name === 'RECIPIENT_UNSUB_URL', 'matches personal variables'),
          },
        },
      }));
    });
  });
});
