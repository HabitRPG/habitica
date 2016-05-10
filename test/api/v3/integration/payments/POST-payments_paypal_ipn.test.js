import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('payments - paypal - #ipn', () => {
  let endpoint = '/paypal/ipn';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies credentials', async () => {
    let result = await user.post(endpoint);
    expect(result).to.eql({});
  });
});
