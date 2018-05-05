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

// @TODO skipped because on travis the client isn't available and the redirect fails
xdescribe('GET /user/auth/local/reset-password-set-new-one', () => {
  let endpoint = `http://localhost:${API_TEST_SERVER_PORT}/static/user/auth/local/reset-password-set-new-one`;

  // Tests to validate the validatePasswordResetCodeAndFindUser function

  it('renders an error page if the code is missing', async () => {
    const res = await superagent.get(endpoint);
    expect(res.req.path.indexOf('hasError=true') !== -1).to.equal(true);
  });

  it('renders an error page if the code is invalid json', async () => {
    const res = await superagent.get(`${endpoint}?code=invalid`);
    expect(res.req.path.indexOf('hasError=true') !== -1).to.equal(true);
  });

  it('renders an error page if the code cannot be decrypted', async () => {
    let user = await generateUser();

    let code = JSON.stringify({ // not encrypted
      userId: user._id,
      expiresAt: new Date(),
    });
    const res = await superagent.get(`${endpoint}?code=${code}`);
    expect(res.req.path.indexOf('hasError=true') !== -1).to.equal(true);
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

    const res = await superagent.get(`${endpoint}?code=${code}`);
    expect(res.req.path.indexOf('hasError=true') !== -1).to.equal(true);
  });

  it('renders an error page if the user does not exist', async () => {
    let code = encrypt(JSON.stringify({
      userId: Date.now().toString(),
      expiresAt: moment().add({days: 1}),
    }));

    const res = await superagent.get(`${endpoint}?code=${code}`);
    expect(res.req.path.indexOf('hasError=true') !== -1).to.equal(true);
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

    const res = await superagent.get(`${endpoint}?code=${code}`);
    expect(res.req.path.indexOf('hasError=true') !== -1).to.equal(true);
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

    const res = await superagent.get(`${endpoint}?code=${code}`);
    expect(res.req.path.indexOf('hasError=true') !== -1).to.equal(true);
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
    expect(res.req.path.indexOf('hasError=false') !== -1).to.equal(true);
    expect(res.req.path.indexOf('code=') !== -1).to.equal(true);
  });
});

