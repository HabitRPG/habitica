import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-v3-integration.helper';

describe('PUT /user/auth/update-password', async () => {
  let endpoint = '/user/auth/update-password';
  let user;
  let password = 'password';
  let wrongPassword = 'wrong-password';
  let newPassword = 'new-password';

  beforeEach(async () => {
    user = await generateUser();
  });

  it('successfully changes the password', async () => {
    let previousHashedPassword = user.auth.local.hashed_password;
    let response = await user.put(endpoint, {
      password,
      newPassword,
      confirmPassword: newPassword,
    });
    expect(response).to.eql({});
    await user.sync();
    expect(user.auth.local.hashed_password).to.not.eql(previousHashedPassword);
  });

  it('new passwords mismatch', async () => {
    await expect(user.put(endpoint, {
      password,
      newPassword,
      confirmPassword: `${newPassword}-wrong-confirmation`,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('passwordConfirmationMatch'),
    });
  });

  it('existing password is wrong', async () => {
    await expect(user.put(endpoint, {
      password: wrongPassword,
      newPassword,
      confirmPassword: newPassword,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('wrongPassword'),
    });
  });
});
