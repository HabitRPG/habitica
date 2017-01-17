import nconf from 'nconf';

import paypalPayments from '../../../../../website/server/libs/paypalPayments';

const BASE_URL = nconf.get('BASE_URL');

describe.only('Paypal Payments', ()  => {
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

    it('creates a link for gifting gems');
    it('creates a link for giftin a subscription');
  });
});
