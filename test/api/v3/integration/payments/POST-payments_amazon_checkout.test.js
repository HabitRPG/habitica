import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('payments - amazon - #checkout', () => {
  let endpoint = '/amazon/checkout';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies credentials', async () => {
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Missing req.body.orderReferenceId',
    });
  });
});
