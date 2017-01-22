import {
  sha1Encrypt as sha1EncryptPassword,
  sha1MakeSalt,
} from '../../../../../website/server/libs/password';

describe('Password Utilities', () => {
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
