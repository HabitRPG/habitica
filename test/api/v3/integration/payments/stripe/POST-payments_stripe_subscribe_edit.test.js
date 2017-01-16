import {
  generateUser,
  generateGroup,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import stripePayments from '../../../../../../website/server/libs/stripePayments';

describe('payments - stripe - #subscribeEdit', () => {
  let endpoint = '/stripe/subscribe/edit';
  let user, group;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies credentials', async () => {
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('missingSubscription'),
    });
  });

  describe('success', () => {
    let stripeEditSubscriptionStub;

    beforeEach(async () => {
      stripeEditSubscriptionStub = sinon.stub(stripePayments, 'editSubscription').returnsPromise().resolves({});
    });

    afterEach(() => {
      stripePayments.editSubscription.restore();
    });

    it('cancels a user subscription', async () => {
      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      await user.post(endpoint);

      expect(stripeEditSubscriptionStub).to.be.calledOnce;
      expect(stripeEditSubscriptionStub.args[0][0].user._id).to.eql(user._id);
      expect(stripeEditSubscriptionStub.args[0][0].groupId).to.eql(undefined);
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

      await user.post(endpoint, {
        groupId: group._id,
      });

      expect(stripeEditSubscriptionStub).to.be.calledOnce;
      expect(stripeEditSubscriptionStub.args[0][0].user._id).to.eql(user._id);
      expect(stripeEditSubscriptionStub.args[0][0].groupId).to.eql(group._id);
    });
  });
});
