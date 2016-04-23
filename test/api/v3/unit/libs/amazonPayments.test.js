import * as amzLib from '../../../../../website/src/libs/api-v3/amazonPayments';
// import * as amzStub from 'amazon-payments';
import amazonPayments from 'amazon-payments';
var User = require('mongoose').model('User');

describe.only('amazonPayments', () => {
  describe('stubbed', () => {
    let thisToken = 'this token info';
    let amzOldConnect;

    beforeEach(() => {
      amzOldConnect = amazonPayments.connect;
      amazonPayments.connect = () => {
        let api = {
          getTokenInfo: (token, cb) => {
            return cb(undefined, thisToken);
          },
        };
        let offAmazonPayments = {
          createOrderReferenceForId: (input, cb) => {
            return cb(undefined, { OrderReferenceDetails: { AmazonOrderReferenceId: true } });
          },
        };
        return { api, offAmazonPayments };
      };
    });

    afterEach(() => {
      amazonPayments.connect = amzOldConnect;
    });

    it('#getTokenInfo - returns tokenInfo', async (done) => {
      let result = await amzLib.getTokenInfo();
      expect(result).to.eql(thisToken);
      done();
    });

    it('#createOrderReferenceId', async () => {
      let result = await amzLib.createOrderReferenceId({});
      expect(result.OrderReferenceDetails).to.exist;
      expect(result.OrderReferenceDetails.AmazonOrderReferenceId).to.exist;
    });
  });

  describe('#getTokenInfo', () => {
    it('validates access_token parameter', async (done) => {
      try {
        await amzLib.getTokenInfo();
      } catch (e) {
        expect(e.type).to.eql('invalid_request');
        done();
      }
    });
  });

  describe('#createOrderReferenceId', () => {
    it('verifies billingAgreementId', async (done) => {
      try {
        let inputSet = {};
        delete inputSet.Id;
        await amzLib.createOrderReferenceId(inputSet);
      } catch (e) {
        expect(e.type).to.eql('InvalidParameterValue');
        expect(e.body.ErrorResponse.Error.Message).to.eql('Parameter AWSAccessKeyId cannot be empty.');
        done();
      }
    });
  });

  describe('#checkout');

  describe('#setOrderReferenceDetails');

  describe('#confirmOrderReference');

  describe('#authorize', () => {
    xit('succeeds');

    xit('was declined');

    xit('had an error');
  });

  describe('#authorizeOnBillingAgreement');

  describe('#confirmBillingAgreement');

  describe('#setBillingAgreementDetails');

  describe('#closeOrderReference');

  describe('#closeBillingAgreement');

  describe('#executePayment', () => {
    it('succeeds not as a gift', () => {
    });

    it('succeeds as a gift', () => {
    });
  });

  describe('#subscribe');

  describe('#subscribeCancel');
});
