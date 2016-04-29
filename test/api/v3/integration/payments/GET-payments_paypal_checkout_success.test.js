import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('payments : paypal #checkoutSuccess', () => {
  let endpoint = '/payments/paypal/checkout/success';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  // @TODO: this should actually pass
  it('verifies subscription', async () => {
    await expect(user.get(endpoint)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('missingAuthParams'),
    });
  });
});
