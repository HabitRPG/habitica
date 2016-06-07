import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-v3-integration.helper';

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
});
