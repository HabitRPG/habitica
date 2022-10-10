import passport from 'passport';
import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  requester,
  translate as t,
  getProperty,
} from '../../../../../helpers/api-integration/v3';

describe('POST /user/auth/social', () => {
  let api;
  let user;
  const endpoint = '/user/auth/social';
  let randomAccessToken = '123456';
  let randomGoogleId = 'googleId';
  let network = 'NoNetwork';

  beforeEach(async () => {
    api = requester();
    user = await generateUser();
    randomAccessToken = generateUUID();
  });

  it('fails if network is not supported', async () => {
    await expect(api.post(endpoint, {
      authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
      network,
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('unsupportedNetwork'),
    });
  });

  describe('google', () => {
    beforeEach(async () => {
      randomGoogleId = generateUUID();
      const expectedResult = {
        id: randomGoogleId,
        displayName: 'a google user',
        emails: [
          { value: `${user.auth.local.username}+google@example.com` },
        ],
      };
      sandbox.stub(passport._strategies.google, 'userProfile').yields(null, expectedResult);
      network = 'google';
    });

    afterEach(async () => {
      passport._strategies.google.userProfile.restore();
    });

    it('registers a new user', async () => {
      const response = await api.post(endpoint, {
        authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
        network,
      });

      expect(response.apiToken).to.exist;
      expect(response.id).to.exist;
      expect(response.newUser).to.be.true;
      await expect(getProperty('users', response.id, 'auth.google.id')).to.eventually.equal(randomGoogleId);
      await expect(getProperty('users', response.id, 'auth.local.email')).to.eventually.equal(`${user.auth.local.username}+google@example.com`);
      await expect(getProperty('users', response.id, 'profile.name')).to.eventually.equal('a google user');
    });

    it('logs an existing user in', async () => {
      const registerResponse = await api.post(endpoint, {
        authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
        network,
      });

      const response = await api.post(endpoint, {
        authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
        network,
      });

      expect(response.apiToken).to.eql(registerResponse.apiToken);
      expect(response.id).to.eql(registerResponse.id);
      expect(response.newUser).to.be.false;
      expect(registerResponse.newUser).to.be.true;
    });

    it('logs an existing user in if they have local auth with matching email', async () => {
      passport._strategies.google.userProfile.restore();
      const expectedResult = {
        id: randomGoogleId,
        displayName: 'a google user',
        emails: [
          { value: user.auth.local.email },
        ],
      };
      sandbox.stub(passport._strategies.google, 'userProfile').yields(null, expectedResult);

      const response = await api.post(endpoint, {
        authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
        network,
      });

      expect(response.apiToken).to.eql(user.apiToken);
      expect(response.id).to.eql(user._id);
      expect(response.newUser).to.be.false;
    });

    it('logs an existing user into their social account if they have local auth with matching email', async () => {
      const registerResponse = await api.post(endpoint, {
        authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
        network,
      });
      expect(registerResponse.newUser).to.be.true;
      // This is important for existing accounts before the new social handling
      passport._strategies.google.userProfile.restore();
      const expectedResult = {
        id: randomGoogleId,
        displayName: 'a google user',
        emails: [
          { value: user.auth.local.email },
        ],
      };
      sandbox.stub(passport._strategies.google, 'userProfile').yields(null, expectedResult);

      const response = await api.post(endpoint, {
        authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
        network,
      });

      expect(response.apiToken).to.eql(registerResponse.apiToken);
      expect(response.id).to.eql(registerResponse.id);
      expect(response.apiToken).not.to.eql(user.apiToken);
      expect(response.id).not.to.eql(user._id);
      expect(response.newUser).to.be.false;
    });

    it('add social auth to an existing user', async () => {
      const response = await user.post(endpoint, {
        authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
        network,
      });

      expect(response.apiToken).to.eql(user.apiToken);
      expect(response.id).to.eql(user._id);
      expect(response.newUser).to.be.false;
    });

    it('does not log into other account if social auth already exists', async () => {
      const registerResponse = await api.post(endpoint, {
        authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
        network,
      });
      expect(registerResponse.newUser).to.be.true;

      await expect(user.post(endpoint, {
        authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
        network,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('socialAlreadyExists'),
      });
    });

    xit('enrolls a new user in an A/B test', async () => {
      await api.post(endpoint, {
        authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
        network,
      });

      await expect(getProperty('users', user._id, '_ABtests')).to.eventually.be.a('object');
    });
  });
});
