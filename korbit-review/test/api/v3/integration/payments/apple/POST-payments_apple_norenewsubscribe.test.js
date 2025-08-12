import { generateUser, translate as t } from '../../../../../helpers/api-integration/v3';
import applePayments from '../../../../../../website/server/libs/payments/apple';

describe('payments : apple #norenewsubscribe', () => {
  const endpoint = '/iap/ios/norenew-subscribe';
  const sku = 'com.habitrpg.ios.habitica.subscription.3month';
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

  it('verifies receipt existence', async () => {
    await expect(user.post(endpoint, {
      sku,
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('missingReceipt'),
    });
  });

  describe('success', () => {
    let subscribeStub;

    beforeEach(async () => {
      subscribeStub = sinon.stub(applePayments, 'noRenewSubscribe').resolves({});
    });

    afterEach(() => {
      applePayments.noRenewSubscribe.restore();
    });

    it('makes a purchase', async () => {
      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      await user.post(endpoint, {
        sku,
        transaction: { receipt: 'receipt' },
        gift: {
          uuid: '1',
        },
      });

      expect(subscribeStub).to.be.calledOnce;
      expect(subscribeStub.args[0][0].user._id).to.eql(user._id);
      expect(subscribeStub.args[0][0].sku).to.eql(sku);
      expect(subscribeStub.args[0][0].receipt).to.eql('receipt');
      expect(subscribeStub.args[0][0].headers['x-api-key']).to.eql(user.apiToken);
      expect(subscribeStub.args[0][0].headers['x-api-user']).to.eql(user._id);
    });
  });
});
