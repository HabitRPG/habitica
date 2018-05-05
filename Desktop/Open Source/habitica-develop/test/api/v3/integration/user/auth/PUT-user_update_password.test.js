import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-v3-integration.helper';
import {
  bcryptCompare,
  sha1MakeSalt,
  sha1Encrypt as sha1EncryptPassword,
} from '../../../../../../website/server/libs/password';

const ENDPOINT = '/user/auth/update-password';

describe('PUT /user/auth/update-password', async () => {
  let user;
  let password = 'password'; // from habitrpg/test/helpers/api-integration/v3/object-generators.js
  let wrongPassword = 'wrong-password';
  let newPassword = 'new-password';

  beforeEach(async () => {
    user = await generateUser();
  });

  it('successfully changes the password', async () => {
    let previousHashedPassword = user.auth.local.hashed_password;
    let response = await user.put(ENDPOINT, {
      password,
      newPassword,
      confirmPassword: newPassword,
    });
    expect(response).to.eql({});
    await user.sync();
    expect(user.auth.local.hashed_password).to.not.eql(previousHashedPassword);
  });

  it('returns an error when confirmPassword does not match newPassword', async () => {
    await expect(user.put(ENDPOINT, {
      password,
      newPassword,
      confirmPassword: `${newPassword}-wrong-confirmation`,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('passwordConfirmationMatch'),
    });
  });

  it('returns an error when existing password is wrong', async () => {
    await expect(user.put(ENDPOINT, {
      password: wrongPassword,
      newPassword,
      confirmPassword: newPassword,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('wrongPassword'),
    });
  });

  it('returns an error when password is missing', async () => {
    let body = {
      newPassword,
      confirmPassword: newPassword,
    };

    await expect(user.put(ENDPOINT, body)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns an error when newPassword is missing', async () => {
    let body = {
      password,
      confirmPassword: newPassword,
    };

    await expect(user.put(ENDPOINT, body)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns an error when confirmPassword is missing', async () => {
    let body = {
      password,
      newPassword,
    };

    await expect(user.put(ENDPOINT, body)).to.eventually.be.rejected.and.eql({
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

    user.sync();
    expect(user.auth.local.passwordHashMethod).to.equal('sha1');
    expect(user.auth.local.salt).to.equal(salt);
    expect(user.auth.local.hashed_password).to.equal(sha1HashedPassword);

    // update email
    await user.put(ENDPOINT, {
      password: textPassword,
      newPassword,
      confirmPassword: newPassword,
    });

    await user.sync();
    expect(user.auth.local.passwordHashMethod).to.equal('bcrypt');
    expect(user.auth.local.salt).to.be.undefined;
    expect(user.auth.local.hashed_password).not.to.equal(sha1HashedPassword);

    let isValidPassword = await bcryptCompare(newPassword, user.auth.local.hashed_password);
    expect(isValidPassword).to.equal(true);
  });
});
