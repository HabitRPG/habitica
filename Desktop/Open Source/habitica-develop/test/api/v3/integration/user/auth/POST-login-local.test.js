import {
  generateUser,
  requester,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import {
  bcryptCompare,
  sha1MakeSalt,
  sha1Encrypt as sha1EncryptPassword,
} from '../../../../../../website/server/libs/password';

import nconf from 'nconf';

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
      message: t('accountSuspended', { communityManagerEmail: nconf.get('EMAILS:COMMUNITY_MANAGER_EMAIL'), userId: user._id }),
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

  it('converts user with SHA1 encrypted password to bcrypt encryption', async () => {
    let textPassword = 'mySecretPassword';
    let salt = sha1MakeSalt();
    let sha1HashedPassword = sha1EncryptPassword(textPassword, salt);

    await user.update({
      'auth.local.hashed_password': sha1HashedPassword,
      'auth.local.passwordHashMethod': 'sha1',
      'auth.local.salt': salt,
    });

    await user.sync();
    expect(user.auth.local.passwordHashMethod).to.equal('sha1');
    expect(user.auth.local.salt).to.equal(salt);
    expect(user.auth.local.hashed_password).to.equal(sha1HashedPassword);

    // login
    await api.post(endpoint, {
      username: user.auth.local.email,
      password: textPassword,
    });

    await user.sync();
    expect(user.auth.local.passwordHashMethod).to.equal('bcrypt');
    expect(user.auth.local.salt).to.be.undefined;
    expect(user.auth.local.hashed_password).not.to.equal(sha1HashedPassword);

    let isValidPassword = await bcryptCompare(textPassword, user.auth.local.hashed_password);
    expect(isValidPassword).to.equal(true);
  });
});
