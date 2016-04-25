import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('payments : amazon #subscribeCancel', () => {
  let endpoint = '/payments/amazon/subscribeCancel';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies subscription', async () => {
    await expect(user.get(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('missingSubscription'),
    });
  });

  it('succeeds', async () => {

  });
});
