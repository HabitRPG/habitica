import {
  encrypt,
} from '../../../../../../website/server/libs/encryption';
import moment from 'moment';
import {
  generateUser,
} from '../../../../../helpers/api-integration/v3';
import superagent from 'superagent';
import nconf from 'nconf';

const API_TEST_SERVER_PORT = nconf.get('PORT');

describe('GET /user/auth/local/reset-password-set-new-one', () => {
  let endpoint = `http://localhost:${API_TEST_SERVER_PORT}/user/auth/local/reset-password-set-new-one`;

  // Tests to validate the validatePasswordResetCodeAndFindUser function

  it('renders an error page if the code is missing', async () => {
    try {
      await superagent.get(endpoint);
      throw new Error('Request should fail.');
    } catch (err) {
      expect(err.status).to.equal(401);
    }
  });

  it('renders an error page if the code is invalid json', async () => {
    try {
      await superagent.get(`${endpoint}?code=invalid`);
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
      await superagent.get(`${endpoint}?code=${code}`);

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
      await superagent.get(`${endpoint}?code=${code}`);
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
      await superagent.get(`${endpoint}?code=${code}`);
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
      await superagent.get(`${endpoint}?code=${code}`);
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
      await superagent.get(`${endpoint}?code=${code}`);
      throw new Error('Request should fail.');
    } catch (err) {
      expect(err.status).to.equal(401);
    }
  });

  //

  it('returns the password reset page if the password reset code is valid', async () => {
    let user = await generateUser();

    let code = encrypt(JSON.stringify({
      userId: user._id,
      expiresAt: moment().add({days: 1}),
    }));
    await user.update({
      'auth.local.passwordResetCode': code,
    });

    let res = await superagent.get(`${endpoint}?code=${code}`);
    expect(res.status).to.equal(200);
  });
});

