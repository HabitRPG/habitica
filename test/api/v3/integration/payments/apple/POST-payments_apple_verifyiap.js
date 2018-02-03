import {generateUser} from '../../../../../helpers/api-integration/v3';
import applePayments from '../../../../../../website/server/libs/applePayments';

describe('payments : apple #verify', () => {
  let endpoint = '/iap/ios/verify';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  describe('success', () => {
    let verifyStub;

    beforeEach(async () => {
      verifyStub = sinon.stub(applePayments, 'verifyGemPurchase').returnsPromise().resolves({});
    });

    afterEach(() => {
      applePayments.verifyGemPurchase.restore();
    });

    it('makes a purchase', async () => {
      user = await generateUser({
        balance: 2,
      });

      await user.post(endpoint, {
      transaction: {
        receipt: 'receipt',
      }});

      expect(verifyStub).to.be.calledOnce;
      expect(verifyStub.args[0][0]._id).to.eql(user._id);
      expect(verifyStub.args[0][1]).to.eql('receipt');
      expect(verifyStub.args[0][2]['x-api-key']).to.eql(user.apiToken);
      expect(verifyStub.args[0][2]['x-api-user']).to.eql(user._id);
    });
  });
});
