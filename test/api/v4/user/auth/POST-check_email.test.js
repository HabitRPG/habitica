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
    expect(response.valid).to.be.true;
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

    const response = await api.post(ENDPOINT, {
      email: user.auth.local.email,
    });
    expect(response).to.eql({
      valid: false,
      email: user.auth.local.email,
      error: t('cannotFulfillReq'),
    });
  });

  it('rejects if casing is different', async () => {
    const user = await generateUser();

    const response = await api.post(ENDPOINT, {
      email: user.auth.local.email.toUpperCase(),
    });
    expect(response).to.eql({
      valid: false,
      email: user.auth.local.email.toUpperCase(),
      error: t('cannotFulfillReq'),
    });
  });

  it('rejects if email uses restricted domain', async () => {
    const response = await api.post(ENDPOINT, {
      email: 'fake@habitica.com',
    });
    expect(response.valid).to.be.false;
  });
});
