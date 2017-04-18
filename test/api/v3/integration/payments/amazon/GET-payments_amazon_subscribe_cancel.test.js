import {
  generateUser,
  generateGroup,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import amzLib from '../../../../../../website/server/libs/amazonPayments';

describe('payments : amazon #subscribeCancel', () => {
  let endpoint = '/amazon/subscribe/cancel?noRedirect=true';
  let user, group, amazonSubscribeCancelStub;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('throws error when there users has no subscription', async () => {
    await expect(user.get(endpoint)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('missingSubscription'),
    });
  });

  describe('success', () => {
    beforeEach(() => {
      amazonSubscribeCancelStub = sinon.stub(amzLib, 'cancelSubscription').returnsPromise().resolves({});
    });

    afterEach(() => {
      amzLib.cancelSubscription.restore();
    });

    it('cancels a user subscription', async () => {
      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      await user.get(endpoint);

      expect(amazonSubscribeCancelStub).to.be.calledOnce;
      expect(amazonSubscribeCancelStub.args[0][0].user._id).to.eql(user._id);
      expect(amazonSubscribeCancelStub.args[0][0].groupId).to.eql(undefined);
      expect(amazonSubscribeCancelStub.args[0][0].headers['x-api-key']).to.eql(user.apiToken);
      expect(amazonSubscribeCancelStub.args[0][0].headers['x-api-user']).to.eql(user._id);
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

      expect(amazonSubscribeCancelStub).to.be.calledOnce;
      expect(amazonSubscribeCancelStub.args[0][0].user._id).to.eql(user._id);
      expect(amazonSubscribeCancelStub.args[0][0].groupId).to.eql(group._id);
      expect(amazonSubscribeCancelStub.args[0][0].headers['x-api-key']).to.eql(user.apiToken);
      expect(amazonSubscribeCancelStub.args[0][0].headers['x-api-user']).to.eql(user._id);
    });
  });
});
