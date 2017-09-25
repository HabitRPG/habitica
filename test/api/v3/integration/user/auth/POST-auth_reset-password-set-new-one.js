import {
  encrypt,
} from '../../../../../../website/server/libs/encryption';
import {
  compare,
  bcryptCompare,
  sha1MakeSalt,
  sha1Encrypt as sha1EncryptPassword,
} from '../../../../../../website/server/libs/password';
import moment from 'moment';
import {
  generateUser,
  requester,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('POST /user/auth/reset-password-set-new-one', () => {
  const endpoint = '/user/auth/reset-password-set-new-one';
  const api = requester();

  // Tests to validate the validatePasswordResetCodeAndFindUser function
  it('renders an error page if the code is missing', async () => {
    await expect(api.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('invalidPasswordResetCode'),
    });
  });

  it('renders an error page if the code is invalid json', async () => {
    await expect(api.post(`${endpoint}?code=invalid`)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('invalidPasswordResetCode'),
    });
  });

  it('renders an error page if the code cannot be decrypted', async () => {
    let user = await generateUser();

    let code = JSON.stringify({ // not encrypted
      userId: user._id,
      expiresAt: new Date(),
    });

    await expect(api.post(`${endpoint}`, {
      code,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('invalidPasswordResetCode'),
    });
  });

  it('renders an error page if the code is expired', async () => {
    let user = await generateUser();

    let code = encrypt(JSON.stringify({
      userId: user._id,
      expiresAt: moment().subtract({minutes: 1}),
    }));
    await user.update({
      'auth.local.passwordResetCode': code,
    });

    await expect(api.post(`${endpoint}`, {
      code,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('invalidPasswordResetCode'),
    });
  });

  it('renders an error page if the user does not exist', async () => {
    let code = encrypt(JSON.stringify({
      userId: Date.now().toString(),
      expiresAt: moment().add({days: 1}),
    }));

    await expect(api.post(`${endpoint}`, {
      code,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('invalidPasswordResetCode'),
    });
  });

  it('renders an error page if the user has no local auth', async () => {
    let user = await generateUser();

    let code = encrypt(JSON.stringify({
      userId: user._id,
      expiresAt: moment().add({days: 1}),
    }));
    await user.update({
      auth: 'not an object with valid fields',
    });

    await expect(api.post(`${endpoint}`, {
      code,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('invalidPasswordResetCode'),
    });
  });

  it('renders an error page if the code doesn\'t match the one saved at user.auth.passwordResetCode', async () => {
    let user = await generateUser();

    let code = encrypt(JSON.stringify({
      userId: user._id,
      expiresAt: moment().add({days: 1}),
    }));
    await user.update({
      'auth.local.passwordResetCode': 'invalid',
    });

    await expect(api.post(`${endpoint}`, {
      code,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('invalidPasswordResetCode'),
    });
  });

  //

  it('renders the error page if the new password is missing', async () => {
    let user = await generateUser();

    let code = encrypt(JSON.stringify({
      userId: user._id,
      expiresAt: moment().add({days: 1}),
    }));
    await user.update({
      'auth.local.passwordResetCode': code,
    });

    await expect(api.post(`${endpoint}`, {
      code,
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('renders the error page if the password confirmation is missing', async () => {
    let user = await generateUser();

    let code = encrypt(JSON.stringify({
      userId: user._id,
      expiresAt: moment().add({days: 1}),
    }));
    await user.update({
      'auth.local.passwordResetCode': code,
    });

    await expect(api.post(`${endpoint}`, {
      newPassword: 'my new password',
      code,
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('renders the error page if the password confirmation does not match', async () => {
    let user = await generateUser();

    let code = encrypt(JSON.stringify({
      userId: user._id,
      expiresAt: moment().add({days: 1}),
    }));
    await user.update({
      'auth.local.passwordResetCode': code,
    });

    await expect(api.post(`${endpoint}`, {
      newPassword: 'my new password',
      confirmPassword: 'not matching',
      code,
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('passwordConfirmationMatch'),
    });
  });

  it('renders the success page and save the user', async () => {
    let user = await generateUser();

    let code = encrypt(JSON.stringify({
      userId: user._id,
      expiresAt: moment().add({days: 1}),
    }));
    await user.update({
      'auth.local.passwordResetCode': code,
    });

    let res = await api.post(`${endpoint}`, {
      newPassword: 'my new password',
      confirmPassword: 'my new password',
      code,
    });

    expect(res.message).to.equal(t('passwordChangeSuccess'));

    await user.sync();
    expect(user.auth.local.passwordResetCode).to.equal(undefined);
    expect(user.auth.local.passwordHashMethod).to.equal('bcrypt');
    expect(user.auth.local.salt).to.be.undefined;
    let isPassValid = await compare(user, 'my new password');
    expect(isPassValid).to.equal(true);
  });

  it('renders the success page and convert the password from sha1 to bcrypt', async () => {
    let user = await generateUser();

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

    let code = encrypt(JSON.stringify({
      userId: user._id,
      expiresAt: moment().add({days: 1}),
    }));
    await user.update({
      'auth.local.passwordResetCode': code,
    });

    let res = await api.post(`${endpoint}`, {
      newPassword: 'my new password',
      confirmPassword: 'my new password',
      code,
    });

    expect(res.message).to.equal(t('passwordChangeSuccess'));

    await user.sync();
    expect(user.auth.local.passwordResetCode).to.equal(undefined);
    expect(user.auth.local.passwordHashMethod).to.equal('bcrypt');
    expect(user.auth.local.salt).to.be.undefined;
    expect(user.auth.local.hashed_password).not.to.equal(sha1HashedPassword);

    let isValidPassword = await bcryptCompare('my new password', user.auth.local.hashed_password);
    expect(isValidPassword).to.equal(true);
  });
});
