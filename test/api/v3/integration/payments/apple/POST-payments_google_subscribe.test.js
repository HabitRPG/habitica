import {generateUser, translate as t} from '../../../../../helpers/api-integration/v3';
import applePayments from '../../../../../../website/server/libs/applePayments';

describe('payments : apple #subscribe', () => {
  let endpoint = '/iap/ios/subscribe';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies sub key', async () => {
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('missingSubscriptionCode'),
    });
  });

  describe('success', () => {
    let subscribeStub;

    beforeEach(async () => {
      subscribeStub = sinon.stub(applePayments, 'subscribe').returnsPromise().resolves({});
    });

    afterEach(() => {
      applePayments.subscribe.restore();
    });

    it('makes a purchase', async () => {
      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      let sku = 'com.habitrpg.ios.habitica.subscription.3month';

      await user.post(endpoint, {
        sku,
        receipt: 'receipt',
      });

      expect(subscribeStub).to.be.calledOnce;
      expect(subscribeStub.args[0][0]).to.eql(sku);
      expect(subscribeStub.args[0][1]._id).to.eql(user._id);
      expect(subscribeStub.args[0][2]).to.eql('receipt');
      expect(subscribeStub.args[0][3]['x-api-key']).to.eql(user.apiToken);
      expect(subscribeStub.args[0][3]['x-api-user']).to.eql(user._id);
    });
  });
});
