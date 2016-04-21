import * as amz from '../../../../../website/src/libs/api-v3/amazonPayments';
// import * as amzStub from 'amazon-payments';
import amazonPayments from 'amazon-payments';

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
      let result = await amz.getTokenInfo();
      expect(result).to.eql(thisToken);
      done();
    });
  });

  describe('#getTokenInfo', () => {
    it('validates access_token parameter', async (done) => {
      try {
        await amz.getTokenInfo();
      } catch (e) {
        expect(e.type).to.eql('invalid_request');
        done();
      }
    });
  });

  describe('#createOrderReferenceId', () => {
    it('succeeds', () => {
    });
  });
});
