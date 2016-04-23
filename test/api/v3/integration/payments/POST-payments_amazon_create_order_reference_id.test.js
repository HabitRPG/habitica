import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('payments - amazon - #createOrderReferenceId', () => {
  let endpoint = '/payments/amazon/createOrderReferenceId';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies billingAgreementId', async (done) => {
    try {
      await user.post(endpoint);
    } catch (e) {
      // Parameter AWSAccessKeyId cannot be empty.
      done();
    }
  });
});
