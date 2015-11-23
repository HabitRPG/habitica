import { each } from 'lodash';
import {
  isEqual,
} from '../../../../../website/src/libs/api-v3/customExpressValidators';

describe('Custom Express Validators', () => {
  describe('isEqual', () => {
    it('asserts that the two identical values are equal', () => {
      let set = [
        ['foo', 'foo'],
        [1, 1],
        [null, null],
        [true, true],
      ];

      each(set, (pair) => {
        expect(isEqual(pair[0], pair[1])).to.eql(true);
      });
    });

    it('asserts that the two disparate values are not equal', () => {
      let set = [
        ['foo', 'not foo'],
        [1, 2],
        [1, '1'],
        [null, undefined],
        [true, 'true'],
        [true, false],
      ];

      each(set, (pair) => {
        expect(isEqual(pair[0], pair[1])).to.eql(false);
      });
    });
  });
});
