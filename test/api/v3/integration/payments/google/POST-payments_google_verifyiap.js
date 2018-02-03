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

      await user.post(endpoint, {
        transaction: {receipt: 'receipt', signature: 'signature'},
      });

      expect(verifyStub).to.be.calledOnce;
      expect(verifyStub.args[0][0]._id).to.eql(user._id);
      expect(verifyStub.args[0][1]).to.eql('receipt');
      expect(verifyStub.args[0][2]).to.eql('signature');
      expect(verifyStub.args[0][3]['x-api-key']).to.eql(user.apiToken);
      expect(verifyStub.args[0][3]['x-api-user']).to.eql(user._id);
    });
  });
});
