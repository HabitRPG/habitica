/* eslint-disable camelcase */

import moment from 'moment';
import {
  encrypt,
} from '../../../../website/server/libs/encryption';
import {
  generateUser,
} from '../../../helpers/api-integration/v3';
import {
  sha1Encrypt as sha1EncryptPassword,
  sha1MakeSalt,
  bcryptHash,
  bcryptCompare,
  compare,
  convertToBcrypt,
  validatePasswordResetCodeAndFindUser,
} from '../../../../website/server/libs/password';

describe('Password Utilities', () => {
  describe('compare', () => {
    it('can compare a correct password hashed with SHA1', async () => {
      const textPassword = 'mySecretPassword';
      const salt = sha1MakeSalt();
      const hashedPassword = sha1EncryptPassword(textPassword, salt);

      const user = {
        auth: {
          local: {
            hashed_password: hashedPassword,
            salt,
            passwordHashMethod: 'sha1',
          },
        },
      };

      const isValidPassword = await compare(user, textPassword);
      expect(isValidPassword).to.eql(true);
    });

    it('can compare an invalid password hashed with SHA1', async () => {
      const textPassword = 'mySecretPassword';
      const salt = sha1MakeSalt();
      const hashedPassword = sha1EncryptPassword(textPassword, salt);

      const user = {
        auth: {
          local: {
            hashed_password: hashedPassword,
            salt,
            passwordHashMethod: 'sha1',
          },
        },
      };

      const isValidPassword = await compare(user, 'wrongPassword');
      expect(isValidPassword).to.eql(false);
    });

    it('can compare a correct password hashed with bcrypt', async () => {
      const textPassword = 'mySecretPassword';
      const hashedPassword = await bcryptHash(textPassword);

      const user = {
        auth: {
          local: {
            hashed_password: hashedPassword,
            passwordHashMethod: 'bcrypt',
          },
        },
      };

      const isValidPassword = await compare(user, textPassword);
      expect(isValidPassword).to.eql(true);
    });

    it('can compare an invalid password hashed with bcrypt', async () => {
      const textPassword = 'mySecretPassword';
      const hashedPassword = await bcryptHash(textPassword);

      const user = {
        auth: {
          local: {
            hashed_password: hashedPassword,
            passwordHashMethod: 'bcrypt',
          },
        },
      };

      const isValidPassword = await compare(user, 'wrongPassword');
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
        await compare({ a: true });
      } catch (e) {
        expect(e.toString()).to.equal('Error: user and passwordToCheck are required parameters.');
      }
    });

    it('defaults to SHA1 encryption if salt is provided', async () => {
      const textPassword = 'mySecretPassword';
      const salt = sha1MakeSalt();
      const hashedPassword = sha1EncryptPassword(textPassword, salt);

      const user = {
        auth: {
          local: {
            hashed_password: hashedPassword,
            salt,
            passwordHashMethod: '',
          },
        },
      };

      const isValidPassword = await compare(user, textPassword);
      expect(isValidPassword).to.eql(true);
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
      const textPassword = 'mySecretPassword';
      const hashedPassword = await bcryptHash(textPassword);

      const isValidPassword = await bcryptCompare(textPassword, hashedPassword);
      expect(isValidPassword).to.eql(true);
    });

    it('returns true if comparing a different password', async () => {
      const textPassword = 'mySecretPassword';
      const hashedPassword = await bcryptHash(textPassword);

      const isValidPassword = await bcryptCompare('anotherPassword', hashedPassword);
      expect(isValidPassword).to.eql(false);
    });
  });

  describe('convertToBcrypt', () => {
    it('converts an user password hashed with sha1 to bcrypt', async () => {
      const textPassword = 'mySecretPassword';
      const salt = sha1MakeSalt();
      const hashedPassword = sha1EncryptPassword(textPassword, salt);

      const user = {
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

      const isValidPassword = await compare(user, textPassword);
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
        await convertToBcrypt({ a: true });
      } catch (e) {
        expect(e.toString()).to.equal('Error: user and plainTextPassword are required parameters.');
      }
    });
  });

  describe('validatePasswordResetCodeAndFindUser', () => {
    it('returns false if the code is missing', async () => {
      const res = await validatePasswordResetCodeAndFindUser();
      expect(res).to.equal(false);
    });

    it('returns false if the code is invalid json', async () => {
      const res = await validatePasswordResetCodeAndFindUser('invalid json');
      expect(res).to.equal(false);
    });

    it('returns false if the code cannot be decrypted', async () => {
      const user = await generateUser();
      const res = await validatePasswordResetCodeAndFindUser(JSON.stringify({ // not encrypted
        userId: user._id,
        expiresAt: new Date(),
      }));
      expect(res).to.equal(false);
    });

    it('returns false if the code is expired', async () => {
      const user = await generateUser();

      const code = encrypt(JSON.stringify({
        userId: user._id,
        expiresAt: moment().subtract({ minutes: 1 }),
      }));

      await user.update({
        'auth.local.passwordResetCode': code,
      });

      const res = await validatePasswordResetCodeAndFindUser(code);
      expect(res).to.equal(false);
    });

    it('returns false if the user does not exist', async () => {
      const res = await validatePasswordResetCodeAndFindUser(encrypt(JSON.stringify({
        userId: Date.now().toString(),
        expiresAt: moment().add({ days: 1 }),
      })));
      expect(res).to.equal(false);
    });

    it('returns false if the user has no local auth', async () => {
      const user = await generateUser({
        auth: {
          google: {},
        },
      });
      const res = await validatePasswordResetCodeAndFindUser(encrypt(JSON.stringify({
        userId: user._id,
        expiresAt: moment().add({ days: 1 }),
      })));
      expect(res).to.equal(false);
    });

    it('returns false if the code doesn\'t match the one saved at user.auth.passwordResetCode', async () => {
      const user = await generateUser();

      const code = encrypt(JSON.stringify({
        userId: user._id,
        expiresAt: moment().add({ days: 1 }),
      }));

      await user.update({
        'auth.local.passwordResetCode': 'invalid',
      });

      const res = await validatePasswordResetCodeAndFindUser(code);
      expect(res).to.equal(false);
    });

    it('returns the user if the password reset code is valid', async () => {
      const user = await generateUser();

      const code = encrypt(JSON.stringify({
        userId: user._id,
        expiresAt: moment().add({ days: 1 }),
      }));

      await user.update({
        'auth.local.passwordResetCode': code,
      });

      const res = await validatePasswordResetCodeAndFindUser(code);
      expect(res).not.to.equal(false);
      expect(res._id).to.equal(user._id);
    });
  });

  describe('bcrypt', () => {
    describe('Hash', () => {
      it('returns a hashed string', async () => {
        const textPassword = 'mySecretPassword';
        const hashedPassword = await bcryptHash(textPassword);

        expect(hashedPassword).to.be.a.string;
      });
    });

    describe('Compare', () => {
      it('returns true if comparing the same password', async () => {
        const textPassword = 'mySecretPassword';
        const hashedPassword = await bcryptHash(textPassword);

        const isValidPassword = await bcryptCompare(textPassword, hashedPassword);
        expect(isValidPassword).to.eql(true);
      });

      it('returns true if comparing a different password', async () => {
        const textPassword = 'mySecretPassword';
        const hashedPassword = await bcryptHash(textPassword);

        const isValidPassword = await bcryptCompare('anotherPassword', hashedPassword);
        expect(isValidPassword).to.eql(false);
      });
    });
  });

  describe('SHA1', () => {
    describe('Encrypt', () => {
      it('always encrypt the same password to the same value when using the same salt', () => {
        const textPassword = 'mySecretPassword';
        const salt = sha1MakeSalt();
        const encryptedPassword = sha1EncryptPassword(textPassword, salt);

        expect(sha1EncryptPassword(textPassword, salt)).to.eql(encryptedPassword);
      });

      it('never encrypt the same password to the same value when using a different salt', () => {
        const textPassword = 'mySecretPassword';
        const aSalt = sha1MakeSalt();
        const anotherSalt = sha1MakeSalt();
        const anEncryptedPassword = sha1EncryptPassword(textPassword, aSalt);
        const anotherEncryptedPassword = sha1EncryptPassword(textPassword, anotherSalt);

        expect(anEncryptedPassword).not.to.eql(anotherEncryptedPassword);
      });
    });

    describe('Make Salt', () => {
      it('creates a salt with length 10 by default', () => {
        const salt = sha1MakeSalt();

        expect(salt.length).to.eql(10);
      });

      it('can create a salt of any length', () => {
        const length = 24;
        const salt = sha1MakeSalt(length);

        expect(salt.length).to.eql(length);
      });
    });
  });
});
