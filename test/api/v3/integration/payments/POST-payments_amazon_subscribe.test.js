import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('payments - amazon - #subscribe', () => {
  let endpoint = '/amazon/subscribe';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies subscription code', async () => {
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('missingSubscriptionCode'),
    });
  });
});
