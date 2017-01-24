import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-v3-integration.helper';
import {
  bcryptCompare,
  sha1MakeSalt,
  sha1Encrypt as sha1EncryptPassword,
} from '../../../../../../website/server/libs/password';

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

  it('converts user with SHA1 encrypted password to bcrypt encryption', async () => {
    let myNewUsername = 'my-new-username';
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
    let response = await user.put(ENDPOINT, {
      username: myNewUsername,
      password: textPassword,
    });
    expect(response).to.eql({ username: myNewUsername });

    await user.sync();

    expect(user.auth.local.username).to.eql(myNewUsername);
    expect(user.auth.local.passwordHashMethod).to.equal('bcrypt');
    expect(user.auth.local.salt).to.be.undefined;
    expect(user.auth.local.hashed_password).not.to.equal(sha1HashedPassword);

    let isValidPassword = await bcryptCompare(textPassword, user.auth.local.hashed_password);
    expect(isValidPassword).to.equal(true);
  });

  context('errors', async () => {
    it('prevents username update if new username is already taken', async () => {
      let existingUsername = 'existing-username';
      await generateUser({'auth.local.username': existingUsername, 'auth.local.lowerCaseUsername': existingUsername });

      await expect(user.put(ENDPOINT, {
        username: existingUsername,
        password,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
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
