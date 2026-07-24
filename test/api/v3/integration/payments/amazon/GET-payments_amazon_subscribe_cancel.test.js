import {
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import amzLib from '../../../../../../website/server/libs/payments/amazon';

describe('payments : amazon #subscribeCancel', () => {
  const endpoint = '/amazon/subscribe/cancel?noRedirect=true';
  let user; let group; let
    amazonSubscribeCancelStub;

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
      amazonSubscribeCancelStub = sinon.stub(amzLib, 'cancelSubscription').resolves({});
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

      expect(amazonSubscribeCancelStub).to.be.calledOnce;
      expect(amazonSubscribeCancelStub.args[0][0].user._id).to.eql(user._id);
      expect(amazonSubscribeCancelStub.args[0][0].groupId).to.eql(group._id);
      expect(amazonSubscribeCancelStub.args[0][0].headers['x-api-key']).to.eql(user.apiToken);
      expect(amazonSubscribeCancelStub.args[0][0].headers['x-api-user']).to.eql(user._id);
    });
  });
});
