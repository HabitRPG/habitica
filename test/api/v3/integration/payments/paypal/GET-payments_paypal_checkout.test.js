import {
  generateUser,
} from '../../../../../helpers/api-integration/v3';
import paypalPayments from '../../../../../../website/server/libs/paypalPayments';

describe('payments : paypal #checkout', () => {
  let endpoint = '/paypal/checkout';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  describe('success', () => {
    let checkoutStub;

    beforeEach(async () => {
      checkoutStub = sinon.stub(paypalPayments, 'checkout').returnsPromise().resolves('/');
    });

    afterEach(() => {
      paypalPayments.checkout.restore();
    });

    it('creates a purchase link', async () => {
      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      await user.get(`${endpoint}?noRedirect=true`);

      expect(checkoutStub).to.be.calledOnce;
      expect(checkoutStub.args[0][0].gift).to.eql(undefined);
    });
  });
});
