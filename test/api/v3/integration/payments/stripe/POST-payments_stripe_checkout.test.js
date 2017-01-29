import {
  generateUser,
  generateGroup,
} from '../../../../../helpers/api-integration/v3';
import stripePayments from '../../../../../../website/server/libs/stripePayments';

describe('payments - stripe - #checkout', () => {
  let endpoint = '/stripe/checkout';
  let user, group;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies credentials', async () => {
    await expect(user.post(endpoint, {id: 123})).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'Error',
      message: 'Invalid API Key provided: ****************************1111',
    });
  });

  describe('success', () => {
    let stripeCheckoutSubscriptionStub;

    beforeEach(async () => {
      stripeCheckoutSubscriptionStub = sinon.stub(stripePayments, 'checkout').returnsPromise().resolves({});
    });

    afterEach(() => {
      stripePayments.checkout.restore();
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

      expect(stripeCheckoutSubscriptionStub).to.be.calledOnce;
      expect(stripeCheckoutSubscriptionStub.args[0][0].user._id).to.eql(user._id);
      expect(stripeCheckoutSubscriptionStub.args[0][0].groupId).to.eql(undefined);
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

      await user.post(`${endpoint}?groupId=${group._id}`);

      expect(stripeCheckoutSubscriptionStub).to.be.calledOnce;
      expect(stripeCheckoutSubscriptionStub.args[0][0].user._id).to.eql(user._id);
      expect(stripeCheckoutSubscriptionStub.args[0][0].groupId).to.eql(group._id);
    });
  });
});
