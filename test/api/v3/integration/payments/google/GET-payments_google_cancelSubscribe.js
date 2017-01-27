import {generateUser} from '../../../../../helpers/api-integration/v3';
import googlePayments from '../../../../../../website/server/libs/googlePayments';

describe('payments : google #cancelSubscribe', () => {
  let endpoint = '/iap/android/subscribe/cancel';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  describe('success', () => {
    let cancelStub;

    beforeEach(async () => {
      cancelStub = sinon.stub(googlePayments, 'cancelSubscribe').returnsPromise().resolves({});
    });

    afterEach(() => {
      googlePayments.cancelSubscribe.restore();
    });

    it('makes a purchase', async () => {
      user = await generateUser({
        'profile.name': 'sender',
        'purchased.plan.customerId': 'customer-id',
        'purchased.plan.planId': 'basic_3mo',
        'purchased.plan.lastBillingDate': new Date(),
        balance: 2,
      });

      await user.get(`${endpoint}`);

      expect(cancelStub).to.be.calledOnce;
    });
  });
});
