import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { model as User } from '../../../../../website/src/models/user';

describe('POST /user/update-password', async () => {
  let endpoint = '/user/update-password';
  let user;
  let password = 'password';
  let wrongPassword = 'wrong-password';
  let newPassword = 'new-password';

  beforeEach(async () => {
    user = await generateUser();
  });

  it('successfully changes the password', async () => {
    let previousHashedPassword = user.auth.local.hashed_password;
    let response = await user.post(endpoint, {
      password,
      newPassword,
      confirmPassword: newPassword,
    });
    expect(response).to.eql({});
    user = await User.findOne({ _id: user._id });
    expect(user.auth.local.hashed_password).to.not.eql(previousHashedPassword);
  });

  it('new passwords mismatch', async () => {
    await expect(user.post(endpoint, {
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
    await expect(user.post(endpoint, {
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
