import {
  translate as t,
  requester,
  generateUser,
} from '../../../../helpers/api-integration/v4';

const ENDPOINT = '/user/auth/check-email';

describe('POST /user/auth/check-email', () => {
  const email = 'SOmE-nEw-emAIl_2@example.net';
  let api;

  beforeEach(async () => {
    api = requester();
  });

  it('returns email if it is not used yet', async () => {
    const response = await api.post(ENDPOINT, {
      email,
    });
    expect(response.email).to.eql(email);
  });

  it('rejects if email is not provided', async () => {
    await expect(api.post(ENDPOINT, {
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid request parameters.',
    });
  });

  it('rejects if email is already taken', async () => {
    const user = await generateUser();

    await expect(api.post(ENDPOINT, {
      email: user.auth.local.email,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('emailTaken'),
    });
  });

  it('rejects if casing is different', async () => {
    const user = await generateUser();

    await expect(api.post(ENDPOINT, {
      email: user.auth.local.email.toUpperCase(),
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('emailTaken'),
    });
  });
});
