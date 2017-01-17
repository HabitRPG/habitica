import nconf from 'nconf';

import payments from '../../../../../website/server/libs/payments';
import paypalPayments from '../../../../../website/server/libs/paypalPayments';
import { model as User } from '../../../../../website/server/models/user';

const BASE_URL = nconf.get('BASE_URL');

describe.only('Paypal Payments', ()  => {
  let subKey = 'basic_3mo';

  describe('checkout', () => {
    let paypalPaymentCreateStub;
    let approvalHerf;

    function getPaypalCreateOptions (description, amount) {
      return {
        intent: 'sale',
        payer: { payment_method: 'Paypal' },
        redirect_urls: {
          return_url: `${BASE_URL}/paypal/checkout/success`,
          cancel_url: `${BASE_URL}`,
        },
        transactions: [{
          item_list: {
            items: [{
              name: description,
              price: amount,
              currency: 'USD',
              quantity: 1,
            }],
          },
          amount: {
            currency: 'USD',
            total: amount,
          },
          description,
        }],
      };
    }

    beforeEach(() => {
      approvalHerf = 'approval_href';
      paypalPaymentCreateStub = sinon.stub(paypalPayments, 'paypalPaymentCreate')
        .returnsPromise().resolves({
          links: [{ rel: 'approval_url', href: approvalHerf }],
        });
    });

    afterEach(() => {
      paypalPayments.paypalPaymentCreate.restore();
    });

    it('creates a link for gem purchases', async () => {
      let link = await paypalPayments.checkout();

      expect(paypalPaymentCreateStub).to.be.calledOnce;
      expect(paypalPaymentCreateStub).to.be.calledWith(getPaypalCreateOptions('Habitica Gems', 5.00));
      expect(link).to.eql(approvalHerf);
    });

    it('creates a link for gifting gems', async () => {
      let receivingUser = new User();
      let gift = {
        type: 'gems',
        gems: {
          amount: 16,
          uuid: receivingUser._id,
        },
      };

      let link = await paypalPayments.checkout({gift});

      expect(paypalPaymentCreateStub).to.be.calledOnce;
      expect(paypalPaymentCreateStub).to.be.calledWith(getPaypalCreateOptions('Habitica Gems (Gift)', "4.00"));
      expect(link).to.eql(approvalHerf);
    });

    it('creates a link for gifting a subscription', async () => {
      let receivingUser = new User();
      receivingUser.save();
      let gift = {
        type: 'subscription',
        subscription: {
          key: subKey,
          uuid: receivingUser._id,
        },
      };

      let link = await paypalPayments.checkout({gift});

      expect(paypalPaymentCreateStub).to.be.calledOnce;
      expect(paypalPaymentCreateStub).to.be.calledWith(getPaypalCreateOptions('mo. Habitica Subscription (Gift)', "15.00"));
      expect(link).to.eql(approvalHerf);
    });
  });

  describe('checkout success', () => {
    let user, gift, customerId, paymentId;
    let paypalPaymentExecuteStub, paymentBuyGemsStub, paymentsCreateSubscritionStub;

    beforeEach(() => {
      user = new User();
      customerId = 'customerId-test';
      paymentId = 'paymentId-test';

      paypalPaymentExecuteStub = sinon.stub(paypalPayments, 'paypalPaymentExecute').returnsPromise().resolves({});
      paymentBuyGemsStub = sinon.stub(payments, 'buyGems').returnsPromise().resolves({});
      paymentsCreateSubscritionStub = sinon.stub(payments, 'createSubscription').returnsPromise().resolves({});
    });

    afterEach(() => {
      paypalPayments.paypalPaymentExecute.restore();
      payments.buyGems.restore();
      payments.createSubscription.restore();
    });

    it('purchases gems', async () => {
      await paypalPayments.checkoutSuccess({user, gift, paymentId, customerId});

      expect(paypalPaymentExecuteStub).to.be.calledOnce;
      expect(paypalPaymentExecuteStub).to.be.calledWith(paymentId, { payer_id: customerId });
      expect(paymentBuyGemsStub).to.be.calledOnce;
      expect(paymentBuyGemsStub).to.be.calledWith({
        user,
        customerId,
        paymentMethod: 'Paypal',
      });
    });

    it('gifts gems', async () => {
      let receivingUser = new User();
      await receivingUser.save();
      let gift = {
        type: 'subscription',
        subscription: {
          key: subKey,
          uuid: receivingUser._id,
        },
      };

      await paypalPayments.checkoutSuccess({user, gift, paymentId, customerId});

      expect(paypalPaymentExecuteStub).to.be.calledOnce;
      expect(paypalPaymentExecuteStub).to.be.calledWith(paymentId, { payer_id: customerId });
      expect(paymentBuyGemsStub).to.be.calledOnce;
      expect(paymentBuyGemsStub).to.be.calledWith({
        user,
        customerId,
        paymentMethod: 'PayPal (Gift)',
        gift,
      });
    });

    it('gifts subscription', async () => {
      let receivingUser = new User();
      await receivingUser.save();
      let gift = {
        type: 'subscription',
        subscription: {
          key: subKey,
          uuid: receivingUser._id,
        },
      };

      await paypalPayments.checkoutSuccess({user, gift, paymentId, customerId});

      expect(paypalPaymentExecuteStub).to.be.calledOnce;
      expect(paypalPaymentExecuteStub).to.be.calledWith(paymentId, { payer_id: customerId });
      expect(paymentsCreateSubscritionStub).to.be.calledOnce;
      expect(paymentsCreateSubscritionStub).to.be.calledWith({
        user,
        customerId,
        paymentMethod: 'PayPal (Gift)',
        gift,
      });
    });
  });
});
