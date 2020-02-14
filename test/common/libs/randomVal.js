import { times } from 'lodash';
import randomVal from '../../../website/common/script/libs/randomVal';

describe('randomVal', () => {
  let obj;

  beforeEach(() => {
    obj = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('returns a random value from an object', () => {
    const result = randomVal(obj);
    expect(result).to.be.oneOf([1, 2, 3, 4]);
  });

  it('can pass in a predictable random value', () => {
    times(30, () => {
      expect(randomVal(obj, {
        predictableRandom: 0.3,
      })).to.equal(2);
    });
  });

  it('returns a random key when the key option is passed in', () => {
    const result = randomVal(obj, { key: true });
    expect(result).to.be.oneOf(['a', 'b', 'c', 'd']);
  });
});
