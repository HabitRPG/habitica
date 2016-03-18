import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-v3-integration.helper';

describe('PUT /user/auth/update-username', async () => {
  let endpoint = '/user/auth/update-username';
  let user;
  let newUsername = 'new-username';
  let existingUsername = 'existing-username';
  let password = 'password'; // from habitrpg/test/helpers/api-integration/v3/object-generators.js
  let wrongPassword = 'wrong-password';

  beforeEach(async () => {
    user = await generateUser();
  });

  it('successfully changes username', async () => {
    let response = await user.put(endpoint, {
      username: newUsername,
      password,
    });
    expect(response).to.eql({ username: newUsername });
    await user.sync();
    expect(user.auth.local.username).to.eql(newUsername);
  });

  context('errors', async () => {
    describe('new username is unavailable', async () => {
      beforeEach(async () => {
        user = await generateUser();
        await user.update({'auth.local.username': existingUsername, 'auth.local.lowerCaseUsername': existingUsername });
      });

      it('prevents username update', async () => {
        await expect(user.put(endpoint, {
          username: existingUsername,
          password,
        })).to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('usernameTaken'),
        });
      });
    });

    it('password is wrong', async () => {
      await expect(user.put(endpoint, {
        username: newUsername,
        password: wrongPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('wrongPassword'),
      });
    });

    describe('social-only user', async () => {
      beforeEach(async () => {
        user = await generateUser();
        await user.update({ 'auth.local': { ok: true } });
      });

      it('prevents username update', async () => {
        await expect(user.put(endpoint, {
          username: newUsername,
          password,
        })).to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('userHasNoLocalRegistration'),
        });
      });
    });

    it('new username is not provided', async () => {
      await expect(user.put(endpoint, {
        password,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });
  });
});
