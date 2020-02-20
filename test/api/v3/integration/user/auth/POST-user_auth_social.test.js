import passport from 'passport';
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
  const randomAccessToken = '123456';
  const facebookId = 'facebookId';
  const googleId = 'googleId';
  let network = 'NoNetwork';

  beforeEach(async () => {
    api = requester();
    user = await generateUser();
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

  describe('facebook', () => {
    before(async () => {
      const expectedResult = { id: facebookId, displayName: 'a facebook user' };
      sandbox.stub(passport._strategies.facebook, 'userProfile').yields(null, expectedResult);
      network = 'facebook';
    });

    it('registers a new user', async () => {
      const response = await api.post(endpoint, {
        authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
        network,
      });

      expect(response.apiToken).to.exist;
      expect(response.id).to.exist;
      expect(response.newUser).to.be.true;
      expect(response.username).to.exist;

      await expect(getProperty('users', response.id, 'profile.name')).to.eventually.equal('a facebook user');
      await expect(getProperty('users', response.id, 'auth.local.lowerCaseUsername')).to.exist;
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
    });

    it('add social auth to an existing user', async () => {
      const response = await user.post(endpoint, {
        authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
        network,
      });

      expect(response.apiToken).to.exist;
      expect(response.id).to.exist;
      expect(response.newUser).to.be.false;
    });

    xit('enrolls a new user in an A/B test', async () => {
      await api.post(endpoint, {
        authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
        network,
      });

      await expect(getProperty('users', user._id, '_ABtests')).to.eventually.be.a('object');
    });
  });

  describe('google', () => {
    before(async () => {
      const expectedResult = { id: googleId, displayName: 'a google user' };
      sandbox.stub(passport._strategies.google, 'userProfile').yields(null, expectedResult);
      network = 'google';
    });

    it('registers a new user', async () => {
      const response = await api.post(endpoint, {
        authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
        network,
      });

      expect(response.apiToken).to.exist;
      expect(response.id).to.exist;
      expect(response.newUser).to.be.true;
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
    });

    it('add social auth to an existing user', async () => {
      const response = await user.post(endpoint, {
        authResponse: { access_token: randomAccessToken }, // eslint-disable-line camelcase
        network,
      });

      expect(response.apiToken).to.exist;
      expect(response.id).to.exist;
      expect(response.newUser).to.be.false;
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
