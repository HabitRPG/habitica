import {generateUser} from '../../../../../helpers/api-integration/v3';
import googlePayments from '../../../../../../website/server/libs/googlePayments';

describe('payments : google #verify', () => {
  let endpoint = '/iap/android/verify';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  describe('success', () => {
    let verifyStub;

    beforeEach(async () => {
      verifyStub = sinon.stub(googlePayments, 'verifyGemPurchase').returnsPromise().resolves({});
    });

    afterEach(() => {
      googlePayments.verifyGemPurchase.restore();
    });

    it('makes a purchase', async () => {
      user = await generateUser({
        balance: 2,
      });

      await user.post(`${endpoint}`, {
        transaction: {receipt: '', signature: ''},
      });

      expect(verifyStub).to.be.calledOnce;
    });
  });
});
