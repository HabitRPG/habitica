import {
  encrypt as encryptPassword,
  makeSalt,
} from '../../../../../website/server/libs/password';

describe('Password Utilities', () => {
  describe('Encrypt', () => {
    it('always encrypt the same password to the same value when using the same salt', () => {
      let textPassword = 'mySecretPassword';
      let salt = makeSalt();
      let encryptedPassword = encryptPassword(textPassword, salt);

      expect(encryptPassword(textPassword, salt)).to.eql(encryptedPassword);
    });

    it('never encrypt the same password to the same value when using a different salt', () => {
      let textPassword = 'mySecretPassword';
      let aSalt = makeSalt();
      let anotherSalt = makeSalt();
      let anEncryptedPassword = encryptPassword(textPassword, aSalt);
      let anotherEncryptedPassword = encryptPassword(textPassword, anotherSalt);

      expect(anEncryptedPassword).not.to.eql(anotherEncryptedPassword);
    });
  });

  describe('Make Salt', () => {
    it('creates a salt with length 10 by default', () => {
      let salt = makeSalt();

      expect(salt.length).to.eql(10);
    });

    it('can create a salt of any length', () => {
      let length = 24;
      let salt = makeSalt(length);

      expect(salt.length).to.eql(length);
    });
  });
});
