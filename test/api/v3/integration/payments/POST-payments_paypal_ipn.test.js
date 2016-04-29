import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('payments - paypal - #ipn', () => {
  let endpoint = '/payments/paypal/ipn';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  // @TODO: this will definitely not pass
  it('verifies credentials', async () => {
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'Error',
      message: 'Invalid API Key provided: ****************************1111',
    });
  });
});
