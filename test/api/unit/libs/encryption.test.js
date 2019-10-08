import {
  encrypt,
  decrypt,
} from '../../../../website/server/libs/encryption';

describe('encryption', () => {
  it('can encrypt and decrypt', () => {
    const data = 'some secret text';
    const encrypted = encrypt(data);
    const decrypted = decrypt(encrypted);

    expect(encrypted).not.to.equal(data);
    expect(data).to.equal(decrypted);
  });
});
