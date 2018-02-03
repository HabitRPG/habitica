import {
  generateUser,
} from '../../../../../helpers/api-integration/v3';

describe('payments : amazon', () => {
  let endpoint = '/amazon/verifyAccessToken';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies access token', async () => {
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Missing req.body.access_token',
    });
  });
});
