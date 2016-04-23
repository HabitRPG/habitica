import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

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
