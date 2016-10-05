import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

xdescribe('payments : paypal #subscribeSuccess', () => {
  let endpoint = '/paypal/subscribe/success';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies credentials', async () => {
    await expect(user.get(endpoint)).to.eventually.be.rejected.and.eql({
      code: 403,
      error: 'Forbidden',
      message: t('missingSubscription'),
    });
  });
});
