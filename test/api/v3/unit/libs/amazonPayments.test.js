import nconf from 'nconf';

import amzLib from '../../../../../website/server/libs/amazonPayments';
import payments from '../../../../../website/server/libs/payments';

describe.only('Amazon Payments', () => {
  describe('checkout', () => {
    let setOrderReferenceDetailsSpy;
    let confirmOrderReferenceSpy;
    let authorizeSpy;
    let closeOrderReferenceSpy;
    let nconfStub;

    let paymentBuyGemsStub;
    let paymentCreateSubscritionStub;

    beforeEach(function () {
      setOrderReferenceDetailsSpy = sinon.stub(amzLib, 'setOrderReferenceDetails');
      setOrderReferenceDetailsSpy.returnsPromise().resolves({});

      confirmOrderReferenceSpy = sinon.stub(amzLib, 'confirmOrderReference');
      confirmOrderReferenceSpy.returnsPromise().resolves({});

      authorizeSpy = sinon.stub(amzLib, 'authorize');
      authorizeSpy.returnsPromise().resolves({});

      closeOrderReferenceSpy = sinon.stub(amzLib, 'closeOrderReference');
      closeOrderReferenceSpy.returnsPromise().resolves({});

      nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('AMAZON_PAYMENTS:SELLER_ID').returns('SELLER_ID');
      nconfStub.withArgs('AMAZON_PAYMENTS:MWS_KEY').returns('MWS_KEY');
      nconfStub.withArgs('AMAZON_PAYMENTS:MWS_SECRET').returns('MWS_SECRET');
      nconfStub.withArgs('AMAZON_PAYMENTS:CLIENT_ID').returns('CLIENT_ID');

      paymentBuyGemsStub = sinon.stub(payments, 'buyGems');
      paymentBuyGemsStub.returnsPromise().resolves({});

      paymentCreateSubscritionStub = sinon.stub(payments, 'createSubscription');
      paymentCreateSubscritionStub.returnsPromise().resolves({});
    });

    afterEach(function () {
      amzLib.setOrderReferenceDetails.restore();
      amzLib.confirmOrderReference.restore();
      amzLib.authorize.restore();
      amzLib.closeOrderReference.restore();
      nconf.get.restore();
      payments.buyGems.restore();
      payments.createSubscription.restore();
    });

    it('should purchase gems', async () => {
      await amzLib.checkout();

      // @TODO: Check all amazon stubs

      expect(paymentBuyGemsStub).to.be.calledOnce;

      // @TODO: Add called with checks
    });

    it('should gift gems', async () => {
      await amzLib.checkout();

      // @TODO: Check all amazon stubs

      expect(paymentBuyGemsStub).to.be.calledOnce;

      // @TODO: Add called with checks
    });

    it('should gift a subscription', async () => {
      let gift = {
        type: 'subscription',
        subscription: {
          key: 'basic_3mo',
        },
      };

      await amzLib.checkout({gift});

      // @TODO: Check all amazon stubs

      expect(paymentCreateSubscritionStub).to.be.calledOnce;

      // @TODO: Add called with checks
    });
  });
});
