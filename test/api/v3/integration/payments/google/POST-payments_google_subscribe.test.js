import { generateUser } from '../../../../../helpers/api-integration/v3';
import googlePayments from '../../../../../../website/server/libs/payments/google';

describe('payments : google #subscribe', () => {
  const endpoint = '/iap/android/subscribe';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  describe('success', () => {
    let subscribeStub;

    beforeEach(async () => {
      subscribeStub = sinon.stub(googlePayments, 'subscribe').resolves({});
    });

    afterEach(() => {
      googlePayments.subscribe.restore();
    });

    it('makes a purchase', async () => {
      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      const sku = 'com.habitrpg.android.habitica.subscription.3month';

      await user.post(endpoint, {
        sku,
        transaction: { receipt: 'receipt', signature: 'signature' },
      });

      expect(subscribeStub).to.be.calledOnce;
      expect(subscribeStub.args[0][0]._id).to.eql(user._id);
      expect(subscribeStub.args[0][1]).to.eql('receipt');
      expect(subscribeStub.args[0][2]).to.eql('signature');
      expect(subscribeStub.args[0][3]['x-api-key']).to.eql(user.apiToken);
      expect(subscribeStub.args[0][3]['x-api-user']).to.eql(user._id);
    });
  });
});
