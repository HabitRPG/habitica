import { generateUser, translate as t } from '../../../../../helpers/api-integration/v3';
import applePayments from '../../../../../../website/server/libs/payments/apple';

describe('payments : apple #verify', () => {
  const endpoint = '/iap/ios/verify';
  let user;

  it('verifies receipt existence', async () => {
    user = await generateUser();
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('missingReceipt'),
    });
  });

  describe('success', () => {
    let verifyStub;

    beforeEach(async () => {
      verifyStub = sinon.stub(applePayments, 'verifyPurchase').resolves({});
      user = await generateUser({
        'preferences.analyticsConsent': true,
        balance: 2,
      });
    });

    afterEach(() => {
      applePayments.verifyPurchase.restore();
    });

    it('makes a purchase', async () => {
      await user.post(endpoint, {
        transaction: {
          receipt: 'receipt',
        },
      });

      expect(verifyStub).to.be.calledOnce;
      expect(verifyStub.args[0][0].user._id).to.eql(user._id);
      expect(verifyStub.args[0][0].receipt).to.eql('receipt');
      expect(verifyStub.args[0][0].headers['x-api-key']).to.eql(user.apiToken);
      expect(verifyStub.args[0][0].headers['x-api-user']).to.eql(user._id);
    });

    it('gifts a purchase', async () => {
      await user.post(endpoint, {
        transaction: {
          receipt: 'receipt',
        },
        gift: {
          uuid: '1',
        },
      });

      expect(verifyStub).to.be.calledOnce;
      expect(verifyStub.args[0][0].user._id).to.eql(user._id);
      expect(verifyStub.args[0][0].receipt).to.eql('receipt');
      expect(verifyStub.args[0][0].gift.uuid).to.eql('1');
      expect(verifyStub.args[0][0].headers['x-api-key']).to.eql(user.apiToken);
      expect(verifyStub.args[0][0].headers['x-api-user']).to.eql(user._id);
    });
  });
});
