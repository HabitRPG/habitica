import * as amz from '../../../../../website/src/libs/api-v3/amazonPayments';
import * as amzStub from 'amazon-payments';

describe('amazonPayments', () => {
  beforeEach(() => {
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

    it('returns tokenInfo', async (done) => {
      let thisToken = 'this token info';
      let amzStubInstance = amzStub.connect({});
      amzStubInstance.api.getTokenInfo = (token, cb) => {
        return cb(undefined, thisToken);
      };
      let result = await amz.getTokenInfo();
      // console.log('+++ +++ result:', result);
      expect(result).to.eql(thisToken);
      done();
    });
  });

  describe('#createOrderReferenceId', () => {
    it('is sane', () => {
      expect(false).to.eql(true); // @TODO
    });
  });
});
