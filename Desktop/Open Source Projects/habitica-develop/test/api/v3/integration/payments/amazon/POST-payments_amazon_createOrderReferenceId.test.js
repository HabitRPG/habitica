import {
  generateUser,
} from '../../../../../helpers/api-integration/v3';

describe('payments - amazon - #createOrderReferenceId', () => {
  let endpoint = '/amazon/createOrderReferenceId';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies billingAgreementId', async () => {
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Missing req.body.billingAgreementId',
    });
  });
});
