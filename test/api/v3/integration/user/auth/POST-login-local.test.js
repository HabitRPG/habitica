import {
  generateUser,
  requester,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('POST /user/auth/local/login', () => {
  let api;
  let user;
  let endpoint = '/user/auth/local/login';
  let password = 'password';
  beforeEach(async () => {
    api = requester();
    user = await generateUser();
  });

  it('success with username', async () => {
    let response = await api.post(endpoint, {
      username: user.auth.local.username,
      password,
    });
    expect(response.apiToken).to.eql(user.apiToken);
  });

  it('success with email', async () => {
    let response = await api.post(endpoint, {
      username: user.auth.local.email,
      password,
    });
    expect(response.apiToken).to.eql(user.apiToken);
  });

  it('user is blocked', async () => {
    await user.update({ 'auth.blocked': 1 });
    await expect(api.post(endpoint, {
      username: user.auth.local.username,
      password,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('accountSuspended', { userId: user._id }),
    });
  });

  it('wrong password', async () => {
    await expect(api.post(endpoint, {
      username: user.auth.local.username,
      password: 'wrong-password',
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('invalidLoginCredentialsLong'),
    });
  });

  it('missing username', async () => {
    await expect(api.post(endpoint, {
      password: 'wrong-password',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('missing password', async () => {
    await expect(api.post(endpoint, {
      username: user.auth.local.username,
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });
});
