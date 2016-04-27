import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('payments - stripe - #subscribeCancel', () => {
  let endpoint = '/payments/stripe/subscribe/cancel';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies credentials', async (done) => {
    try {
      await user.get(endpoint);
    } catch (e) {
      expect(e.error).to.eql('BadRequest');
      expect(e.message.type).to.eql('InvalidParameterValue');
      done();
    }
  });
});
