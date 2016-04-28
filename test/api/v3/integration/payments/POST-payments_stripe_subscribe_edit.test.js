import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('payments - stripe - #subscribeEdit', () => {
  let endpoint = '/payments/stripe/subscribe/edit';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies credentials', async () => {
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('missingAuthHeaders'),
    });
  });
});
