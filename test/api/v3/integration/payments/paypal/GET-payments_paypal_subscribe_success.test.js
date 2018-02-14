import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import paypalPayments from '../../../../../../website/server/libs/paypalPayments';

describe('payments : paypal #subscribeSuccess', () => {
  let endpoint = '/paypal/subscribe/success';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies Paypal Block', async () => {
    await expect(user.get(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('missingPaypalBlock'),
    });
  });

  xdescribe('success', () => {
    let subscribeSuccessStub;

    beforeEach(async () => {
      subscribeSuccessStub = sinon.stub(paypalPayments, 'subscribeSuccess').returnsPromise().resolves({});
    });

    afterEach(() => {
      paypalPayments.subscribeSuccess.restore();
    });

    it('creates a subscription', async () => {
      let token = 'test-token';

      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      await user.get(`${endpoint}?token=${token}&noRedirect=true`);

      expect(subscribeSuccessStub).to.be.calledOnce;

      expect(subscribeSuccessStub.args[0][0].user._id).to.eql(user._id);
      expect(subscribeSuccessStub.args[0][0].block).to.eql(undefined);
      expect(subscribeSuccessStub.args[0][0].groupId).to.eql(undefined);
      expect(subscribeSuccessStub.args[0][0].token).to.eql(token);
      expect(subscribeSuccessStub.args[0][0].headers).to.exist;
    });
  });
});
