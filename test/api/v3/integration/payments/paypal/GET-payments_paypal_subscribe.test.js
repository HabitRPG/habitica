import {
  generateUser,
} from '../../../../../helpers/api-integration/v3';
import paypalPayments from '../../../../../../website/server/libs/payments/paypal';
import shared from '../../../../../../website/common';
import apiError from '../../../../../../website/server/libs/apiError';

describe('payments : paypal #subscribe', () => {
  const endpoint = '/paypal/subscribe';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies sub key', async () => {
    await expect(user.get(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: apiError('missingSubKey'),
    });
  });

  describe('success', () => {
    let subscribeStub;

    beforeEach(async () => {
      subscribeStub = sinon.stub(paypalPayments, 'subscribe').resolves('/');
    });

    afterEach(() => {
      paypalPayments.subscribe.restore();
    });

    it('makes a purchase', async () => {
      const subKey = 'basic_3mo';
      const sub = shared.content.subscriptionBlocks[subKey];

      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      await user.get(`${endpoint}?sub=${subKey}&noRedirect=true`);

      expect(subscribeStub).to.be.calledOnce;

      expect(subscribeStub.args[0][0].sub).to.eql(sub);
      expect(subscribeStub.args[0][0].coupon).to.eql(undefined);
    });
  });
});
