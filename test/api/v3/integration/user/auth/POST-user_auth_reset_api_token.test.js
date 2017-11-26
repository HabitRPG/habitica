import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import passport from 'passport';

describe.only('POST /user/auth/reset-api-token', () => {
  let endpoint = '/user/auth/reset-api-token';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  describe('error handling', () => {
    it('Bad parameters are rejected', async() => {
      await expect(user.post(endpoint, {
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });
  });

  describe('local', () => {
    it('resets api token given valid password', async() => {
      let originalApiToken = user.apiToken;
      let response = await user.post(endpoint, {
        password: 'password',
      });

      await user.sync();
      expect(response.apiToken).to.exist;
      expect(user.apiToken).to.not.equal(originalApiToken);
      expect(response.apiToken).to.equal(user.apiToken);
      expect(response.apiToken).to.not.equal(originalApiToken);
    });

    it('invalid req params given no password', async() => {
      await expect(user.post(endpoint, {
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('does not reset api token given invalid password', async() => {
      await expect(user.post(endpoint, {
        password: 'wrongpassword',
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('wrongPassword'),
      });
    });
  });

  describe('facebook', () => {
    before(async () => {
      let expectedResult = {id: '123456', displayName: 'a facebook user'};
      sandbox.stub(passport._strategies.facebook, 'userProfile').yields(null, expectedResult);
    });

    it('resets api token given valid token', async() => {
      await user.update({
        'auth.local': {},
        'auth.facebook': {
          id: '123456',
        },
      });
      let originalApiToken = user.apiToken;

      let response = await user.post(endpoint, {
        password: '123456',
      });

      expect(response.apiToken).to.exist;
      expect(user.apiToken).to.not.equal(originalApiToken);
      expect(response.apiToken).to.equal(user.apiToken);
      expect(response.apiToken).to.not.equal(originalApiToken);
    });

    it('does not reset api token given invalid token', async() => {
      await user.update({
        'auth.facebook.id': '123456',
        'auth.local': {},
      });
      await expect(user.post(endpoint, {
        password: 'MR.RESETTI',
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('wrongPassword'),
      });
    });
  });

  describe('google', () => {
    before(async () => {
      let expectedResult = {id: '123456', displayName: 'a google user'};
      sandbox.stub(passport._strategies.google, 'userProfile').yields(null, expectedResult);
    });

    it('resets api token given valid token', async() => {
      await user.update({
        'auth.google.id': '123456',
        'auth.local': {},
      });
      let originalApiToken = user.apiToken;
      let response = await user.post(endpoint, {
        password: '123456',
      });

      await user.sync();

      expect(response.apiToken).to.exist;
      expect(response.apiToken).to.equal(user.apiToken);
      expect(response.apiToken).to.not.equal(originalApiToken);
    });

    it('does not reset api token given invalid token', async() => {
      await user.update({
        'auth.google.id': '123456',
        'auth.local': {},
      });
      await expect(user.post(endpoint, {
        password: 'MR.RESETTI',
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('wrongPassword'),
      });
    });
  });
});
