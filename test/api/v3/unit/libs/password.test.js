/* eslint-disable camelcase */

import {
  encrypt,
} from '../../../../../website/server/libs/encryption';
import moment from 'moment';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';
import {
  sha1Encrypt as sha1EncryptPassword,
  sha1MakeSalt,
  bcryptHash,
  bcryptCompare,
  compare,
  convertToBcrypt,
  validatePasswordResetCodeAndFindUser,
} from '../../../../../website/server/libs/password';

describe('Password Utilities', () => {
  describe('compare', () => {
    it('can compare a correct password hashed with SHA1', async () => {
      let textPassword = 'mySecretPassword';
      let salt = sha1MakeSalt();
      let hashedPassword = sha1EncryptPassword(textPassword, salt);

      let user = {
        auth: {
          local: {
            hashed_password: hashedPassword,
            salt,
            passwordHashMethod: 'sha1',
          },
        },
      };

      let isValidPassword = await compare(user, textPassword);
      expect(isValidPassword).to.eql(true);
    });

    it('can compare an invalid password hashed with SHA1', async () => {
      let textPassword = 'mySecretPassword';
      let salt = sha1MakeSalt();
      let hashedPassword = sha1EncryptPassword(textPassword, salt);

      let user = {
        auth: {
          local: {
            hashed_password: hashedPassword,
            salt,
            passwordHashMethod: 'sha1',
          },
        },
      };

      let isValidPassword = await compare(user, 'wrongPassword');
      expect(isValidPassword).to.eql(false);
    });

    it('can compare a correct password hashed with bcrypt', async () => {
      let textPassword = 'mySecretPassword';
      let hashedPassword = await bcryptHash(textPassword);

      let user = {
        auth: {
          local: {
            hashed_password: hashedPassword,
            passwordHashMethod: 'bcrypt',
          },
        },
      };

      let isValidPassword = await compare(user, textPassword);
      expect(isValidPassword).to.eql(true);
    });

    it('can compare an invalid password hashed with bcrypt', async () => {
      let textPassword = 'mySecretPassword';
      let hashedPassword = await bcryptHash(textPassword);

      let user = {
        auth: {
          local: {
            hashed_password: hashedPassword,
            passwordHashMethod: 'bcrypt',
          },
        },
      };

      let isValidPassword = await compare(user, 'wrongPassword');
      expect(isValidPassword).to.eql(false);
    });

    it('throws an error if user is missing', async () => {
      try {
        await compare(null, 'some password');
      } catch (e) {
        expect(e.toString()).to.equal('Error: user and passwordToCheck are required parameters.');
      }
    });

    it('throws an error if passwordToCheck is missing', async () => {
      try {
        await compare({a: true});
      } catch (e) {
        expect(e.toString()).to.equal('Error: user and passwordToCheck are required parameters.');
      }
    });

    it('throws an error if an invalid hashing method is used', async () => {
      try {
        await compare({
          auth: {
            local: {
              passwordHashMethod: 'invalid',
            },
          },
        }, 'pass');
      } catch (e) {
        expect(e.toString()).to.equal('Error: Invalid password hash method.');
      }
    });

    it('returns true if comparing the same password', async () => {
      let textPassword = 'mySecretPassword';
      let hashedPassword = await bcryptHash(textPassword);

      let isValidPassword = await bcryptCompare(textPassword, hashedPassword);
      expect(isValidPassword).to.eql(true);
    });

    it('returns true if comparing a different password', async () => {
      let textPassword = 'mySecretPassword';
      let hashedPassword = await bcryptHash(textPassword);

      let isValidPassword = await bcryptCompare('anotherPassword', hashedPassword);
      expect(isValidPassword).to.eql(false);
    });
  });

  describe('convertToBcrypt', () => {
    it('converts an user password hashed with sha1 to bcrypt', async () => {
      let textPassword = 'mySecretPassword';
      let salt = sha1MakeSalt();
      let hashedPassword = sha1EncryptPassword(textPassword, salt);

      let user = {
        auth: {
          local: {
            hashed_password: hashedPassword,
            salt,
            passwordHashMethod: 'sha1',
          },
        },
      };

      await convertToBcrypt(user, textPassword);
      expect(user.auth.local.salt).to.be.undefined;
      expect(user.auth.local.passwordHashMethod).to.equal('bcrypt');
      expect(user.auth.local.hashed_password).to.be.a.string;

      let isValidPassword = await compare(user, textPassword);
      expect(isValidPassword).to.eql(true);
    });

    it('throws an error if user is missing', async () => {
      try {
        await convertToBcrypt(null, 'string');
      } catch (e) {
        expect(e.toString()).to.equal('Error: user and plainTextPassword are required parameters.');
      }
    });

    it('throws an error if plainTextPassword is missing', async () => {
      try {
        await convertToBcrypt({a: true});
      } catch (e) {
        expect(e.toString()).to.equal('Error: user and plainTextPassword are required parameters.');
      }
    });
  });

  describe('validatePasswordResetCodeAndFindUser', () => {
    it('returns false if the code is missing', async () => {
      let res = await validatePasswordResetCodeAndFindUser();
      expect(res).to.equal(false);
    });

    it('returns false if the code is invalid json', async () => {
      let res = await validatePasswordResetCodeAndFindUser('invalid json');
      expect(res).to.equal(false);
    });

    it('returns false if the code cannot be decrypted', async () => {
      let user = await generateUser();
      let res = await validatePasswordResetCodeAndFindUser(JSON.stringify({ // not encrypted
        userId: user._id,
        expiresAt: new Date(),
      }));
      expect(res).to.equal(false);
    });

    it('returns false if the code is expired', async () => {
      let user = await generateUser();

      let code = encrypt(JSON.stringify({
        userId: user._id,
        expiresAt: moment().subtract({minutes: 1}),
      }));

      await user.update({
        'auth.local.passwordResetCode': code,
      });

      let res = await validatePasswordResetCodeAndFindUser(code);
      expect(res).to.equal(false);
    });

    it('returns false if the user does not exist', async () => {
      let res = await validatePasswordResetCodeAndFindUser(encrypt(JSON.stringify({
        userId: Date.now().toString(),
        expiresAt: moment().add({days: 1}),
      })));
      expect(res).to.equal(false);
    });

    it('returns false if the user has no local auth', async () => {
      let user = await generateUser({
        auth: 'not an object with valid fields',
      });
      let res = await validatePasswordResetCodeAndFindUser(encrypt(JSON.stringify({
        userId: user._id,
        expiresAt: moment().add({days: 1}),
      })));
      expect(res).to.equal(false);
    });

    it('returns false if the code doesn\'t match the one saved at user.auth.passwordResetCode', async () => {
      let user = await generateUser();

      let code = encrypt(JSON.stringify({
        userId: user._id,
        expiresAt: moment().add({days: 1}),
      }));

      await user.update({
        'auth.local.passwordResetCode': 'invalid',
      });

      let res = await validatePasswordResetCodeAndFindUser(code);
      expect(res).to.equal(false);
    });

    it('returns the user if the password reset code is valid', async () => {
      let user = await generateUser();

      let code = encrypt(JSON.stringify({
        userId: user._id,
        expiresAt: moment().add({days: 1}),
      }));

      await user.update({
        'auth.local.passwordResetCode': code,
      });

      let res = await validatePasswordResetCodeAndFindUser(code);
      expect(res).not.to.equal(false);
      expect(res._id).to.equal(user._id);
    });
  });

  describe('bcrypt', () => {
    describe('Hash', () => {
      it('returns a hashed string', async () => {
        let textPassword = 'mySecretPassword';
        let hashedPassword = await bcryptHash(textPassword);

        expect(hashedPassword).to.be.a.string;
      });
    });

    describe('Compare', () => {
      it('returns true if comparing the same password', async () => {
        let textPassword = 'mySecretPassword';
        let hashedPassword = await bcryptHash(textPassword);

        let isValidPassword = await bcryptCompare(textPassword, hashedPassword);
        expect(isValidPassword).to.eql(true);
      });

      it('returns true if comparing a different password', async () => {
        let textPassword = 'mySecretPassword';
        let hashedPassword = await bcryptHash(textPassword);

        let isValidPassword = await bcryptCompare('anotherPassword', hashedPassword);
        expect(isValidPassword).to.eql(false);
      });
    });
  });

  describe('SHA1', () => {
    describe('Encrypt', () => {
      it('always encrypt the same password to the same value when using the same salt', () => {
        let textPassword = 'mySecretPassword';
        let salt = sha1MakeSalt();
        let encryptedPassword = sha1EncryptPassword(textPassword, salt);

        expect(sha1EncryptPassword(textPassword, salt)).to.eql(encryptedPassword);
      });

      it('never encrypt the same password to the same value when using a different salt', () => {
        let textPassword = 'mySecretPassword';
        let aSalt = sha1MakeSalt();
        let anotherSalt = sha1MakeSalt();
        let anEncryptedPassword = sha1EncryptPassword(textPassword, aSalt);
        let anotherEncryptedPassword = sha1EncryptPassword(textPassword, anotherSalt);

        expect(anEncryptedPassword).not.to.eql(anotherEncryptedPassword);
      });
    });

    describe('Make Salt', () => {
      it('creates a salt with length 10 by default', () => {
        let salt = sha1MakeSalt();

        expect(salt.length).to.eql(10);
      });

      it('can create a salt of any length', () => {
        let length = 24;
        let salt = sha1MakeSalt(length);

        expect(salt.length).to.eql(length);
      });
    });
  });
});
