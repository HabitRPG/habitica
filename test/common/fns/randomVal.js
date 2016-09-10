import randomVal from '../../../website/common/script/fns/randomVal';

import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.fns.randomVal', () => {
  let user;
  let predictableRandom = () => {
    return 0.5;
  };
  let obj = {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
  };

  beforeEach(() => {
    user = generateUser();
  });

  describe('returns a random property value from an object', () => {
    it('returns the same value when the seed is the same and using a predictable random', () => {
      let val1 = randomVal(user, obj, {
        seed: 222,
        randomFunc: predictableRandom,
      });

      let val2 = randomVal(user, obj, {
        seed: 222,
        randomFunc: predictableRandom,
      });

      expect(val2).to.equal(val1);
    });

    it('returns the same value when user.stats is the same and using a predictable random', () => {
      user.stats.gp = 34;
      let val1 = randomVal(user, obj, { randomFunc: predictableRandom });
      let val2 = randomVal(user, obj, { randomFunc: predictableRandom });

      expect(val2).to.equal(val1);
    });

    it('returns a value when no predictable random is provided', () => {
      let val = randomVal(user, obj);
      expect(_.contains(obj, val));
    });
  });

  describe('returns a random key from an object', () => {
    it('returns the same key when the seed is the same and using a predictable random', () => {
      let key1 = randomVal(user, obj, {
        key: true,
        seed: 222,
        randomFunc: predictableRandom,
      });

      let key2 = randomVal(user, obj, {
        key: true,
        seed: 222,
        randomFunc: predictableRandom,
      });

      expect(key2).to.equal(key1);
    });

    it('returns the same key when user.stats is the same and using a predictable random', () => {
      user.stats.gp = 45;
      let key1 = randomVal(user, obj, {
        key: true,
        randomFunc: predictableRandom,
      });

      let key2 = randomVal(user, obj, {
        key: true,
        randomFunc: predictableRandom,
      });

      expect(key2).to.equal(key1);
    });

    it('returns a key when no predictable random is provided', () => {
      let key = randomVal(user, obj);
      expect(obj[key] !== undefined);
    });
  });
});
