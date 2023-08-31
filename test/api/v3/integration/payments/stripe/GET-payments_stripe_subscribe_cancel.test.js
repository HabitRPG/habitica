import {
  generateUser,
  translate as t,
  createAndPopulateGroup,
} from '../../../../../helpers/api-integration/v3';
import stripePayments from '../../../../../../website/server/libs/payments/stripe';

describe('payments - stripe - #subscribeCancel', () => {
  const endpoint = '/stripe/subscribe/cancel?noRedirect=true';
  let user; let group; let
    stripeCancelSubscriptionStub;

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
      stripeCancelSubscriptionStub = sinon.stub(stripePayments, 'cancelSubscription').resolves({});
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
      ({ group, groupLeader: user } = await createAndPopulateGroup({
        groupDetails: {
          name: 'test group',
          type: 'guild',
          privacy: 'private',
        },
        leaderDetails: {
          'profile.name': 'sender',
          'purchased.plan.customerId': 'customer-id',
          'purchased.plan.planId': 'basic_3mo',
          'purchased.plan.lastBillingDate': new Date(),
          balance: 2,
        },
        upgradeToGroupPlan: true,
      }));

      await user.get(`${endpoint}&groupId=${group._id}`);

      expect(stripeCancelSubscriptionStub).to.be.calledOnce;
      expect(stripeCancelSubscriptionStub.args[0][0].user._id).to.eql(user._id);
      expect(stripeCancelSubscriptionStub.args[0][0].groupId).to.eql(group._id);
    });
  });
});
