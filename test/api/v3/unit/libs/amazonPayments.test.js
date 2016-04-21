import * as amzLib from '../../../../../website/src/libs/api-v3/amazonPayments';
// import * as amzStub from 'amazon-payments';
import amazonPayments from 'amazon-payments';
var User = require('mongoose').model('User');

describe('amazonPayments', () => {
  beforeEach(() => {
  });

  describe('#getTokenInfo stubbed', () => {
    let thisToken = 'this token info';
    let amzOldConnect;

    beforeEach(() => {
      amzOldConnect = amazonPayments.connect;
      amazonPayments.connect = () => {
        let api = { getTokenInfo: (token, cb) => {
          return cb(undefined, thisToken);
        } };
        return { api };
      };
    });

    afterEach(() => {
      amazonPayments.connect = amzOldConnect;
    });

    it('returns tokenInfo', async (done) => {
      let result = await amzLib.getTokenInfo();
      expect(result).to.eql(thisToken);
      done();
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

        /* console.log('error!', e);
        console.log('error keys!', Object.keys(e));
        for (var key in e) {
          console.log(e[key]);
        } // */

        expect(e.type).to.eql('InvalidParameterValue');
        expect(e.body.ErrorResponse.Error.Message).to.eql('Parameter AWSAccessKeyId cannot be empty.');
        done();
      }
    });

    xit('succeeds', () => {
    });
  });

  describe('#checkout', () => {
    xit('succeeds');
  });

  describe('#setOrderReferenceDetails', () => {
    xit('succeeds');
  });

  describe('#confirmOrderReference', () => {
    xit('succeeds');
  });

  describe('#authorize', () => {
    xit('succeeds');

    xit('was declined');

    xit('had an error');
  });

  describe('#closeOrderReference', () => {
    xit('succeeds');
  });

  describe.only('#executePayment', () => {
    it('succeeds', () => {
    });

    it('succeeds as a gift', () => {
    });
  });


});
