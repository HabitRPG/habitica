import {
  generateUser,
} from '../../../../../helpers/api-integration/v3';
import paypalPayments from '../../../../../../website/server/libs/payments/paypal';

describe('payments - paypal - #ipn', () => {
  const endpoint = '/paypal/ipn';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies credentials', async () => {
    const result = await user.post(endpoint);
    expect(result).to.eql('OK');
  });

  describe('success', () => {
    let ipnStub;

    beforeEach(async () => {
      ipnStub = sinon.stub(paypalPayments, 'ipn').resolves({});
    });

    afterEach(() => {
      paypalPayments.ipn.restore();
    });

    it('makes a purchase', async () => {
      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      await user.post(endpoint);

      expect(ipnStub).to.be.calledOnce;
    });
  });
});
