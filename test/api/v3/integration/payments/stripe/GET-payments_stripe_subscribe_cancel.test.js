import {
  generateUser,
  generateGroup,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import stripePayments from '../../../../../../website/server/libs/stripePayments';

describe('payments - stripe - #subscribeCancel', () => {
  let endpoint = '/stripe/subscribe/cancel?redirect=none';
  let user, group, stripeCancelSubscriptionStub;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies credentials', async () => {
    await expect(user.get(endpoint)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('missingSubscription'),
    });
  });

  describe('success', () => {
    beforeEach(async () => {
      stripeCancelSubscriptionStub = sinon.stub(stripePayments, 'cancelSubscription').returnsPromise().resolves({});
    });

    afterEach(() => {
      stripePayments.cancelSubscription.restore();
    });

    it('cancels a user subscription', async () => {
      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      await user.get(`${endpoint}`);

      expect(stripeCancelSubscriptionStub).to.be.calledOnce;
      expect(stripeCancelSubscriptionStub.args[0][0].user._id).to.eql(user._id);
      expect(stripeCancelSubscriptionStub.args[0][0].groupId).to.eql(undefined);
    });

    it('cancels a group subscription', async () => {
      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      group = await generateGroup(user, {
        name: 'test group',
        type: 'guild',
        privacy: 'public',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
      });

      await user.get(`${endpoint}&groupId=${group._id}`);

      expect(stripeCancelSubscriptionStub).to.be.calledOnce;
      expect(stripeCancelSubscriptionStub.args[0][0].user._id).to.eql(user._id);
      expect(stripeCancelSubscriptionStub.args[0][0].groupId).to.eql(group._id);
    });
  });
});
