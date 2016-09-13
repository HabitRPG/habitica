import {
  generateUser,
  requester,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import passport from 'passport';

describe('POST /user/auth/social', () => {
  let api;
  let user;
  let endpoint = '/user/auth/social';
  let randomAccessToken = '123456';
  let facebookId = 'facebookId';
  let network = 'facebook';

  before(async () => {
    api = requester();
    user = await generateUser();

    let expectedResult = {id: facebookId};
    let passportFacebookProfile = sandbox.stub(passport._strategies.facebook, 'userProfile');
    passportFacebookProfile.yields(null, expectedResult);
  });

  it('fails if network is not facebook', async () => {
    await expect(api.post(endpoint, {
      authResponse: {access_token: randomAccessToken}, // eslint-disable-line camelcase
      network: 'NotFacebook',
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('onlyFbSupported'),
    });
  });

  it('registers a new user', async () => {
    let response = await api.post(endpoint, {
      authResponse: {access_token: randomAccessToken}, // eslint-disable-line camelcase
      network,
    });

    expect(response.apiToken).to.exist;
    expect(response.id).to.exist;
    expect(response.newUser).to.be.true;
  });

  it('logs an existing user in', async () => {
    await user.update({ 'auth.facebook.id': facebookId });

    let response = await api.post(endpoint, {
      authResponse: {access_token: randomAccessToken}, // eslint-disable-line camelcase
      network,
    });

    expect(response.apiToken).to.eql(user.apiToken);
    expect(response.id).to.eql(user._id);
    expect(response.newUser).to.be.false;
  });
});
