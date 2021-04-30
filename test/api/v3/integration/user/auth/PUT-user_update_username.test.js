import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import {
  bcryptCompare,
  sha1MakeSalt,
  sha1Encrypt as sha1EncryptPassword,
} from '../../../../../../website/server/libs/password';

const ENDPOINT = '/user/auth/update-username';

describe('PUT /user/auth/update-username', async () => {
  let user;
  const password = 'password'; // from habitrpg/test/helpers/api-integration/v4/object-generators.js

  beforeEach(async () => {
    user = await generateUser();
  });

  it('successfully changes username with password', async () => {
    const newUsername = 'new-username';
    const response = await user.put(ENDPOINT, {
      username: newUsername,
      password,
    });
    expect(response).to.eql({ username: newUsername });
    await user.sync();
    expect(user.auth.local.username).to.eql(newUsername);
  });

  it('successfully changes username without password', async () => {
    const newUsername = 'new-username-nopw';
    const response = await user.put(ENDPOINT, {
      username: newUsername,
    });
    expect(response).to.eql({ username: newUsername });
    await user.sync();
    expect(user.auth.local.username).to.eql(newUsername);
  });

  it('successfully changes username containing number and underscore', async () => {
    const newUsername = 'new_username9';
    const response = await user.put(ENDPOINT, {
      username: newUsername,
    });
    expect(response).to.eql({ username: newUsername });
    await user.sync();
    expect(user.auth.local.username).to.eql(newUsername);
  });

  it('sets verifiedUsername when changing username', async () => {
    user.flags.verifiedUsername = false;
    await user.sync();
    const newUsername = 'new-username-verify';
    const response = await user.put(ENDPOINT, {
      username: newUsername,
    });
    expect(response).to.eql({ username: newUsername });
    await user.sync();
    expect(user.flags.verifiedUsername).to.eql(true);
  });

  it('converts user with SHA1 encrypted password to bcrypt encryption', async () => {
    const myNewUsername = 'my-new-username';
    const textPassword = 'mySecretPassword';
    const salt = sha1MakeSalt();
    const sha1HashedPassword = sha1EncryptPassword(textPassword, salt);

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
    const response = await user.put(ENDPOINT, {
      username: myNewUsername,
      password: textPassword,
    });
    expect(response).to.eql({ username: myNewUsername });

    await user.sync();

    expect(user.auth.local.username).to.eql(myNewUsername);
    expect(user.auth.local.passwordHashMethod).to.equal('bcrypt');
    expect(user.auth.local.salt).to.be.undefined;
    expect(user.auth.local.hashed_password).not.to.equal(sha1HashedPassword);

    const isValidPassword = await bcryptCompare(textPassword, user.auth.local.hashed_password);
    expect(isValidPassword).to.equal(true);
  });

  context('errors', async () => {
    it('prevents username update if new username is already taken', async () => {
      const existingUsername = 'existing-username';
      await generateUser({ 'auth.local.username': existingUsername, 'auth.local.lowerCaseUsername': existingUsername });

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
      const newUsername = 'new-username';
      await expect(user.put(ENDPOINT, {
        username: newUsername,
        password: 'wrong-password',
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('wrongPassword'),
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

    it('errors if new username is a slur', async () => {
      await expect(user.put(ENDPOINT, {
        username: 'TESTPLACEHOLDERSLURWORDHERE',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: [t('usernameIssueLength'), t('bannedSlurUsedInProfile')].join(' '),
      });
    });

    it('errors if new username contains a slur', async () => {
      await expect(user.put(ENDPOINT, {
        username: 'TESTPLACEHOLDERSLURWORDHERE_otherword',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: [t('usernameIssueLength'), t('bannedSlurUsedInProfile')].join(' '),
      });
      await expect(user.put(ENDPOINT, {
        username: 'something_TESTPLACEHOLDERSLURWORDHERE',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: [t('usernameIssueLength'), t('bannedSlurUsedInProfile')].join(' '),
      });
    });

    it('errors if new username is not allowed', async () => {
      await expect(user.put(ENDPOINT, {
        username: 'support',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('usernameIssueForbidden'),
      });
    });

    it('errors if new username is not allowed regardless of casing', async () => {
      await expect(user.put(ENDPOINT, {
        username: 'SUppORT',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('usernameIssueForbidden'),
      });
    });

    it('errors if username has incorrect length', async () => {
      await expect(user.put(ENDPOINT, {
        username: 'thisisaverylongusernameover20characters',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('usernameIssueLength'),
      });
    });

    it('errors if new username contains invalid characters', async () => {
      await expect(user.put(ENDPOINT, {
        username: 'Eichhörnchen',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('usernameIssueInvalidCharacters'),
      });
      await expect(user.put(ENDPOINT, {
        username: 'test.name',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('usernameIssueInvalidCharacters'),
      });
      await expect(user.put(ENDPOINT, {
        username: '🤬',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('usernameIssueInvalidCharacters'),
      });
    });
  });
});
