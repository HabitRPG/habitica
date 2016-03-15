import {
  ATTRIBUTES,
} from '../../common/script/constants';

describe('constants', () => {
  describe('ATTRIBUTES', () => {
    it('provides a list of attributes', () => {
      expect(ATTRIBUTES).to.eql(['str', 'int', 'per', 'con']);
    });
  });
});
