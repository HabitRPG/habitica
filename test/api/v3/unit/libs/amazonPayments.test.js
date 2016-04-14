import * as amz from '../../../../../website/src/libs/api-v3/amazonPayments';

describe.only('amazonPayments', () => {

  beforeEach(() => {
  });

  describe('#getTokenInfo', () => {
    it('validates access_token parameter', async (done) => {
      try {
        let result = await amz.getTokenInfo();
      } catch (e) {
        expect(e.type).to.eql('invalid_request');
        done();
      }
    });
  });

  describe('#createOrderReferenceId', () => {
    it('is sane', () => {
      expect(false).to.eql(true); // @TODO
    });
  });
});
