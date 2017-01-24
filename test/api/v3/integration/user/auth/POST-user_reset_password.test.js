import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import {
  sha1MakeSalt,
  sha1Encrypt as sha1EncryptPassword,
} from '../../../../../../website/server/libs/password';

describe('POST /user/reset-password', async () => {
  let endpoint = '/user/reset-password';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('resets password', async () => {
    let previousPassword = user.auth.local.hashed_password;
    let response = await user.post(endpoint, {
      email: user.auth.local.email,
    });
    expect(response).to.eql({ data: {}, message: t('passwordReset') });
    await user.sync();
    expect(user.auth.local.hashed_password).to.not.eql(previousPassword);
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

    // update email
    await user.post(endpoint, {
      email: user.auth.local.email,
    });

    await user.sync();
    expect(user.auth.local.passwordHashMethod).to.equal('bcrypt');
    expect(user.auth.local.salt).to.be.undefined;
    expect(user.auth.local.hashed_password).not.to.equal(sha1HashedPassword);
  });

  it('same message on error as on success', async () => {
    let response = await user.post(endpoint, {
      email: 'nonExistent@email.com',
    });
    expect(response).to.eql({ data: {}, message: t('passwordReset') });
  });

  it('errors if email is not provided', async () => {
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });
});
