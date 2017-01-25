import {generateUser, translate as t} from '../../../../../helpers/api-integration/v3';
import googlePayments from '../../../../../../website/server/libs/googlePayments';

describe('payments : google #subscribe', () => {
  let endpoint = '/iap/android/subscribe';
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
      subscribeStub = sinon.stub(googlePayments, 'subscribe').returnsPromise().resolves({});
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

      await user.post(`${endpoint}`, {
        sku: 'com.habitrpg.android.habitica.subscription.3month',
        transaction: {receipt: '', signature: ''},
      });

      expect(subscribeStub).to.be.calledOnce;
    });
  });
});
