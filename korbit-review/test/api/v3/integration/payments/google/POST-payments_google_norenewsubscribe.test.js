import { generateUser, translate as t } from '../../../../../helpers/api-integration/v3';
import googlePayments from '../../../../../../website/server/libs/payments/google';

describe('payments : google #norenewsubscribe', () => {
  const endpoint = '/iap/android/norenew-subscribe';
  const sku = 'com.habitrpg.android.habitica.subscription.3month';
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
      subscribeStub = sinon.stub(googlePayments, 'noRenewSubscribe').resolves({});
    });

    afterEach(() => {
      googlePayments.noRenewSubscribe.restore();
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
        transaction: {
          receipt: 'receipt',
          signature: 'signature',
        },
      });

      expect(subscribeStub).to.be.calledOnce;
      expect(subscribeStub.args[0][0].user._id).to.eql(user._id);
      expect(subscribeStub.args[0][0].sku).to.eql(sku);
      expect(subscribeStub.args[0][0].receipt).to.eql('receipt');
      expect(subscribeStub.args[0][0].signature).to.eql('signature');
      expect(subscribeStub.args[0][0].headers['x-api-key']).to.eql(user.apiToken);
      expect(subscribeStub.args[0][0].headers['x-api-user']).to.eql(user._id);
    });

    it('gifts a purchase', async () => {
      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      await user.post(endpoint, {
        sku,
        transaction: {
          receipt: 'receipt',
          signature: 'signature',
        },
        gift: {
          uuid: '1',
        },
      });

      expect(subscribeStub).to.be.calledOnce;
      expect(subscribeStub.args[0][0].user._id).to.eql(user._id);
      expect(subscribeStub.args[0][0].sku).to.eql(sku);
      expect(subscribeStub.args[0][0].receipt).to.eql('receipt');
      expect(subscribeStub.args[0][0].signature).to.eql('signature');
      expect(subscribeStub.args[0][0].headers['x-api-key']).to.eql(user.apiToken);
      expect(subscribeStub.args[0][0].headers['x-api-user']).to.eql(user._id);
    });
  });
});
