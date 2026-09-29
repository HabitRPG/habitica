import {
  generateUser,
  generateGroup,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import amzLib from '../../../../../../website/server/libs/payments/amazon';

describe('payments - amazon - #subscribe', () => {
  const endpoint = '/amazon/subscribe';
  let user; let group; let
    subscribeWithAmazonStub;

  it('verifies subscription code', async () => {
    user = await generateUser();
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('missingSubscriptionCode'),
    });
  });

  describe('success', () => {
    const billingAgreementId = 'billingAgreementId-example';
    const subscription = 'basic_3mo';
    let coupon;

    beforeEach(async () => {
      subscribeWithAmazonStub = sinon.stub(amzLib, 'subscribe').resolves({});
      user = await generateUser({
        'preferences.analyticsConsent': true,
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });
    });

    afterEach(() => {
      amzLib.subscribe.restore();
    });

    it('creates a user subscription', async () => {
      await user.post(endpoint, {
        billingAgreementId,
        subscription,
        coupon,
      });

      expect(subscribeWithAmazonStub).to.be.calledOnce;
      expect(subscribeWithAmazonStub.args[0][0].billingAgreementId).to.eql(billingAgreementId);
      expect(subscribeWithAmazonStub.args[0][0].sub).to.exist;
      expect(subscribeWithAmazonStub.args[0][0].coupon).to.eql(coupon);
      expect(subscribeWithAmazonStub.args[0][0].groupId).not.exist;
      expect(subscribeWithAmazonStub.args[0][0].headers['x-api-key']).to.eql(user.apiToken);
      expect(subscribeWithAmazonStub.args[0][0].headers['x-api-user']).to.eql(user._id);
    });

    it('creates a group subscription', async () => {
      group = await generateGroup(user, {
        name: 'test group',
        type: 'party',
        privacy: 'private',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
      });

      await user.post(endpoint, {
        billingAgreementId,
        subscription,
        coupon,
        groupId: group._id,
      });

      expect(subscribeWithAmazonStub).to.be.calledOnce;
      expect(subscribeWithAmazonStub.args[0][0].billingAgreementId).to.eql(billingAgreementId);
      expect(subscribeWithAmazonStub.args[0][0].sub).to.exist;
      expect(subscribeWithAmazonStub.args[0][0].coupon).to.eql(coupon);
      expect(subscribeWithAmazonStub.args[0][0].user._id).to.eql(user._id);
      expect(subscribeWithAmazonStub.args[0][0].groupId).to.eql(group._id);
      expect(subscribeWithAmazonStub.args[0][0].headers['x-api-key']).to.eql(user.apiToken);
      expect(subscribeWithAmazonStub.args[0][0].headers['x-api-user']).to.eql(user._id);
    });
  });
});
