import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-v3-integration.helper';
import {
  bcryptCompare,
  sha1MakeSalt,
  sha1Encrypt as sha1EncryptPassword,
} from '../../../../../../website/server/libs/password';

import nconf from 'nconf';

const ENDPOINT = '/user/auth/update-email';

describe('PUT /user/auth/update-email', () => {
  let newEmail = 'some-new-email_2@example.net';
  let oldPassword = 'password'; // from habitrpg/test/helpers/api-integration/v3/object-generators.js

  context('Local Authenticaion User', async () => {
    let user;

    beforeEach(async () => {
      user = await generateUser();
    });

    it('does not change email if email is not provided', async () => {
      await expect(user.put(ENDPOINT)).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('does not change email if password is not provided', async () => {
      await expect(user.put(ENDPOINT, {
        newEmail,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('does not change email if wrong password is provided', async () => {
      await expect(user.put(ENDPOINT, {
        newEmail,
        password: 'wrong password',
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('wrongPassword'),
      });
    });

    it('changes email if new email and existing password are provided', async () => {
      let response = await user.put(ENDPOINT, {
        newEmail,
        password: oldPassword,
      });
      expect(response).to.eql({ email: 'some-new-email_2@example.net' });

      await user.sync();
      expect(user.auth.local.email).to.eql(newEmail);
    });

    it('rejects if email is already taken', async () => {
      await expect(user.put(ENDPOINT, {
        newEmail: user.auth.local.email,
        password: oldPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('cannotFulfillReq', { techAssistanceEmail: nconf.get('EMAILS:TECH_ASSISTANCE_EMAIL') }),
      });
    });

    it('converts user with SHA1 encrypted password to bcrypt encryption', async () => {
      let textPassword = 'mySecretPassword';
      let salt = sha1MakeSalt();
      let sha1HashedPassword = sha1EncryptPassword(textPassword, salt);
      let myNewEmail = 'my-new-random-email@example.net';

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
        newEmail: myNewEmail,
        password: textPassword,
      });
      expect(response).to.eql({ email: myNewEmail });

      await user.sync();

      expect(user.auth.local.email).to.equal(myNewEmail);
      expect(user.auth.local.passwordHashMethod).to.equal('bcrypt');
      expect(user.auth.local.salt).to.be.undefined;
      expect(user.auth.local.hashed_password).not.to.equal(sha1HashedPassword);

      let isValidPassword = await bcryptCompare(textPassword, user.auth.local.hashed_password);
      expect(isValidPassword).to.equal(true);
    });
  });

  context('Social Login User', async () => {
    let socialUser;

    beforeEach(async () => {
      socialUser = await generateUser();
      await socialUser.update({ 'auth.local': { ok: true } });
    });

    it('does not change email if user.auth.local.email does not exist for this user', async () => {
      await expect(socialUser.put(ENDPOINT, {
        newEmail,
        password: oldPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('userHasNoLocalRegistration'),
      });
    });
  });
});
