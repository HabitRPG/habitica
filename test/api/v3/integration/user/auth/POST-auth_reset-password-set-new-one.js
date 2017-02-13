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
} from '../../../../../helpers/api-integration/v3';
import superagent from 'superagent';
import nconf from 'nconf';

const API_TEST_SERVER_PORT = nconf.get('PORT');

describe('POST /user/auth/local/reset-password-set-new-one', () => {
  let endpoint = `http://localhost:${API_TEST_SERVER_PORT}/user/auth/local/reset-password-set-new-one`;

  // Tests to validate the validatePasswordResetCodeAndFindUser function

  it('renders an error page if the code is missing', async () => {
    try {
      await superagent.post(endpoint);
      throw new Error('Request should fail.');
    } catch (err) {
      expect(err.status).to.equal(401);
    }
  });

  it('renders an error page if the code is invalid json', async () => {
    try {
      await superagent.post(`${endpoint}?code=invalid`);
      throw new Error('Request should fail.');
    } catch (err) {
      expect(err.status).to.equal(401);
    }
  });

  it('renders an error page if the code cannot be decrypted', async () => {
    let user = await generateUser();

    try {
      let code = JSON.stringify({ // not encrypted
        userId: user._id,
        expiresAt: new Date(),
      });
      await superagent.post(`${endpoint}?code=${code}`);

      throw new Error('Request should fail.');
    } catch (err) {
      expect(err.status).to.equal(401);
    }
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

    try {
      await superagent.post(`${endpoint}?code=${code}`);
      throw new Error('Request should fail.');
    } catch (err) {
      expect(err.status).to.equal(401);
    }
  });

  it('renders an error page if the user does not exist', async () => {
    let code = encrypt(JSON.stringify({
      userId: Date.now().toString(),
      expiresAt: moment().add({days: 1}),
    }));

    try {
      await superagent.post(`${endpoint}?code=${code}`);
      throw new Error('Request should fail.');
    } catch (err) {
      expect(err.status).to.equal(401);
    }
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

    try {
      await superagent.post(`${endpoint}?code=${code}`);
      throw new Error('Request should fail.');
    } catch (err) {
      expect(err.status).to.equal(401);
    }
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

    try {
      await superagent.post(`${endpoint}?code=${code}`);
      throw new Error('Request should fail.');
    } catch (err) {
      expect(err.status).to.equal(401);
    }
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

    try {
      await superagent.post(`${endpoint}?code=${code}`);
      throw new Error('Request should fail.');
    } catch (err) {
      expect(err.status).to.equal(401);
    }
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

    try {
      await superagent
        .post(`${endpoint}?code=${code}`)
        .send({newPassword: 'my new password'});
      throw new Error('Request should fail.');
    } catch (err) {
      expect(err.status).to.equal(401);
    }
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

    try {
      await superagent
        .post(`${endpoint}?code=${code}`)
        .send({
          newPassword: 'my new password',
          confirmPassword: 'not matching',
        });
      throw new Error('Request should fail.');
    } catch (err) {
      expect(err.status).to.equal(401);
    }
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

    let res = await superagent
      .post(`${endpoint}?code=${code}`)
      .send({
        newPassword: 'my new password',
        confirmPassword: 'my new password',
      });

    expect(res.status).to.equal(200);

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

    let res = await superagent
      .post(`${endpoint}?code=${code}`)
      .send({
        newPassword: 'my new password',
        confirmPassword: 'my new password',
      });

    expect(res.status).to.equal(200);

    await user.sync();
    expect(user.auth.local.passwordResetCode).to.equal(undefined);
    expect(user.auth.local.passwordHashMethod).to.equal('bcrypt');
    expect(user.auth.local.salt).to.be.undefined;
    expect(user.auth.local.hashed_password).not.to.equal(sha1HashedPassword);

    let isValidPassword = await bcryptCompare('my new password', user.auth.local.hashed_password);
    expect(isValidPassword).to.equal(true);
  });
});
