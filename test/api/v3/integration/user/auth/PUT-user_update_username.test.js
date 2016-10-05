import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-v3-integration.helper';

const ENDPOINT = '/user/auth/update-username';

describe('PUT /user/auth/update-username', async () => {
  let user;
  let newUsername = 'new-username';
  let password = 'password'; // from habitrpg/test/helpers/api-integration/v3/object-generators.js

  beforeEach(async () => {
    user = await generateUser();
  });

  it('successfully changes username', async () => {
    let response = await user.put(ENDPOINT, {
      username: newUsername,
      password,
    });
    expect(response).to.eql({ username: newUsername });
    await user.sync();
    expect(user.auth.local.username).to.eql(newUsername);
  });

  context('errors', async () => {
    it('prevents username update if new username is already taken', async () => {
      let existingUsername = 'existing-username';
      await generateUser({'auth.local.username': existingUsername, 'auth.local.lowerCaseUsername': existingUsername });

      await expect(user.put(ENDPOINT, {
        username: existingUsername,
        password,
      })).to.eventually.be.rejected.and.eql({
        code: 403,
        error: 'Forbidden',
        message: t('usernameTaken'),
      });
    });

    it('errors if password is wrong', async () => {
      await expect(user.put(ENDPOINT, {
        username: newUsername,
        password: 'wrong-password',
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('wrongPassword'),
      });
    });

    it('prevents social-only user from changing username', async () => {
      let socialUser = await generateUser({ 'auth.local': { ok: true } });

      await expect(socialUser.put(ENDPOINT, {
        username: newUsername,
        password,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('userHasNoLocalRegistration'),
      });
    });

    it('errors if new username is not provided', async () => {
      await expect(user.put(ENDPOINT, {
        password,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });
  });
});
