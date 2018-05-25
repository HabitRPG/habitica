import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import paypalPayments from '../../../../../../website/server/libs/paypalPayments';

describe('payments : paypal #subscribeCancel', () => {
  let endpoint = '/paypal/subscribe/cancel';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies credentials', async () => {
    await expect(user.get(endpoint))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('missingSubscription'),
      });
  });

  describe('success', () => {
    let subscribeCancelStub;

    beforeEach(async () => {
      subscribeCancelStub = sinon.stub(paypalPayments, 'subscribeCancel').returnsPromise().resolves('/');
    });

    afterEach(() => {
      paypalPayments.subscribeCancel.restore();
    });

    it('cancels a subscription', async () => {
      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      await user.get(`${endpoint}?noRedirect=true`);

      expect(subscribeCancelStub).to.be.calledOnce;

      expect(subscribeCancelStub.args[0][0].user._id).to.eql(user._id);
      expect(subscribeCancelStub.args[0][0].groupId).to.eql(undefined);
    });
  });
});
