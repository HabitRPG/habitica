import {
  encrypt,
  decrypt,
} from '../../../../../website/server/libs/encryption';

describe('encryption', () => {
  it('can encrypt and decrypt', () => {
    let data = 'some secret text';
    let encrypted = encrypt(data);
    let decrypted = decrypt(encrypted);

    expect(encrypted).not.to.equal(data);
    expect(data).to.equal(decrypted);
  });
});
