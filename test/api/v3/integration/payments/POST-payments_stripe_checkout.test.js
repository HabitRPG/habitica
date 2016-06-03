import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('payments - stripe - #checkout', () => {
  let endpoint = '/stripe/checkout';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies credentials', async () => {
    await expect(user.post(endpoint, {id: 123})).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'Error',
      message: 'Invalid API Key provided: ****************************1111',
    });
  });
});
