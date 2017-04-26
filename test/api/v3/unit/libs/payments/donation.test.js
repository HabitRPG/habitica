import nconf from 'nconf';

const BASE_URL = nconf.get('BASE_URL');

import payments from '../../../../../../website/server/libs/payments';
import paypalPayments from '../../../../../../website/server/libs/paypalPayments';

describe.only('One Time Donations', () => {
  describe('Paypal', () => {
    let approvalHerf;
    let user = {};
    let paypalPaymentCreateStub, paypalPaymentExecuteStub, paymentDonationStub;

    function getPaypalCreateOptions (description, amount) {
      return {
        intent: 'sale',
        payer: { payment_method: 'Paypal' },
        redirect_urls: {
          return_url: `${BASE_URL}/paypal/donation/success`,
          cancel_url: `${BASE_URL}`,
        },
        transactions: [{
          item_list: {
            items: [{
              name: description,
              price: (amount).toFixed(2),
              currency: 'USD',
              quantity: 1,
            }],
          },
          amount: {
            currency: 'USD',
            total: (amount).toFixed(2),
          },
          description,
        }],
      };
    }

    before(() => {
      approvalHerf = 'approval_href';
      paypalPaymentCreateStub = sinon.stub(paypalPayments, 'paypalPaymentCreate')
        .returnsPromise().resolves({
          links: [{ rel: 'approval_url', href: approvalHerf }],
        });
      paypalPaymentExecuteStub = sinon.stub(paypalPayments, 'paypalPaymentExecute').returnsPromise().resolves({});
      paymentDonationStub = sinon.stub(payments, 'donate').returnsPromise().resolves({});
    });

    after(() => {
      sinon.restore();
    });

    it('creates a link for donation', async () => {
      let donation = 5;

      let link = await paypalPayments.checkout({donation});

      expect(paypalPaymentCreateStub).to.be.calledOnce;
      expect(paypalPaymentCreateStub).to.be.calledWith(getPaypalCreateOptions(paypalPayments.constants.SELLER_NOTE_DONATION, 5.00));
      expect(link).to.eql(approvalHerf);
    });

    it('makes a donation', async () => {
      let donation = 5;
      let paymentId = 'payment-id';
      let customerId = 'customer-id';

      await paypalPayments.checkoutSuccess({user, donation, paymentId, customerId});

      expect(paypalPaymentExecuteStub).to.be.calledOnce;
      expect(paypalPaymentExecuteStub).to.be.calledWith(paymentId, { payer_id: customerId });
      expect(paymentDonationStub).to.be.calledOnce;
      expect(paymentDonationStub).to.be.calledWith({
        user,
        customerId,
        paymentMethod: 'Paypal',
      });
    });
  });
});
