import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import paypalPayments from '../../../../../../website/server/libs/paypalPayments';
import shared from '../../../../../../website/common';

describe('payments : paypal #subscribe', () => {
  let endpoint = '/paypal/subscribe';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies sub key', async () => {
    await expect(user.get(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('missingSubKey'),
    });
  });

  describe('success', () => {
    let subscribeStub;

    beforeEach(async () => {
      subscribeStub = sinon.stub(paypalPayments, 'subscribe').returnsPromise().resolves('/');
    });

    afterEach(() => {
      paypalPayments.subscribe.restore();
    });

    it('makes a purchase', async () => {
      let subKey = 'basic_3mo';
      let sub = shared.content.subscriptionBlocks[subKey];

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
