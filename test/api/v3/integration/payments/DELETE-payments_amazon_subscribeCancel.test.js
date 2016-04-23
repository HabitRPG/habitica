import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('payments : amazon', () => {
  let endpoint = '/payments/amazon/subscribeCancel';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('#subscribeCancel', async () => {
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('missingAccessToken'),
    });
  });
});
