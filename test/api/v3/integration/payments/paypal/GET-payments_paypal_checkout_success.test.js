import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import paypalPayments from '../../../../../../website/server/libs/paypalPayments';

describe('payments : paypal #checkoutSuccess', () => {
  let endpoint = '/paypal/checkout/success';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies paymentId', async () => {
    await expect(user.get(endpoint))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('missingPaymentId'),
      });
  });

  it('verifies customerId', async () => {
    await expect(user.get(`${endpoint}?paymentId=test-paymentid`))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('missingCustomerId'),
      });
  });

  describe('success', () => {
    let checkoutSuccessStub;

    beforeEach(async () => {
      checkoutSuccessStub = sinon.stub(paypalPayments, 'checkoutSuccess').returnsPromise().resolves({});
    });

    afterEach(() => {
      paypalPayments.checkoutSuccess.restore();
    });

    it('makes a purchase', async () => {
      let paymentId = 'test-paymentid';
      let customerId = 'test-customerId';

      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      await user.get(`${endpoint}?PayerID=${customerId}&paymentId=${paymentId}&noRedirect=true`);

      expect(checkoutSuccessStub).to.be.calledOnce;

      expect(checkoutSuccessStub.args[0][0].user._id).to.eql(user._id);
      expect(checkoutSuccessStub.args[0][0].gift).to.eql(undefined);
      expect(checkoutSuccessStub.args[0][0].paymentId).to.eql(paymentId);
      expect(checkoutSuccessStub.args[0][0].customerId).to.eql(customerId);
    });
  });
});
