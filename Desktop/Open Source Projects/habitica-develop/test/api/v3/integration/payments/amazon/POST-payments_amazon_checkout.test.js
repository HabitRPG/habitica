import {
  generateUser,
} from '../../../../../helpers/api-integration/v3';
import amzLib from '../../../../../../website/server/libs/amazonPayments';

describe('payments - amazon - #checkout', () => {
  let endpoint = '/amazon/checkout';
  let user, amazonCheckoutStub;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies credentials', async () => {
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Missing req.body.orderReferenceId',
    });
  });

  describe('success', () => {
    beforeEach(async () => {
      amazonCheckoutStub = sinon.stub(amzLib, 'checkout').returnsPromise().resolves({});
    });

    afterEach(() => {
      amzLib.checkout.restore();
    });

    it('makes a purcahse with amazon checkout', async () => {
      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      let gift = {
        type: 'gems',
        gems: {
          amount: 16,
          uuid: user._id,
        },
      };

      let orderReferenceId = 'orderReferenceId-example';

      await user.post(endpoint, {
        gift,
        orderReferenceId,
      });

      expect(amazonCheckoutStub).to.be.calledOnce;
      expect(amazonCheckoutStub.args[0][0].user._id).to.eql(user._id);
      expect(amazonCheckoutStub.args[0][0].gift).to.eql(gift);
      expect(amazonCheckoutStub.args[0][0].orderReferenceId).to.eql(orderReferenceId);
      expect(amazonCheckoutStub.args[0][0].headers['x-api-key']).to.eql(user.apiToken);
      expect(amazonCheckoutStub.args[0][0].headers['x-api-user']).to.eql(user._id);
    });
  });
});
