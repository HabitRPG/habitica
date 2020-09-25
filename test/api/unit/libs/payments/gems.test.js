import common from '../../../../../website/common';
import { getGemsBlock } from '../../../../../website/server/libs/payments/gems';

describe('payments/gems', () => {
  describe('#getGemsBlock', () => {
    it('throws an error if the gem block key is invalid', () => {
      expect(() => getGemsBlock('invalid')).to.throw;
    });

    it('returns the gem block for the given key', () => {
      expect(getGemsBlock('21gems')).to.equal(common.content.gems['21gems']);
    });
  });
});
