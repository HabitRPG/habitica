import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('payments - stripe - #subscribeCancel', () => {
  let endpoint = '/stripe/subscribe/cancel';
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
