import randomVal from '../../../common/script/fns/randomVal';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.fns.randomVal', () => {
  let user;
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
    it('returns the same value when the seed is the same', () => {
      let val1 = randomVal(user, obj, {
        seed: 222,
      });

      let val2 = randomVal(user, obj, {
        seed: 222,
      });

      expect(val2).to.equal(val1);
    });

    it('returns the same value when user.stats is the same', () => {
      user.stats.gp = 34;
      let val1 = randomVal(user, obj);
      let val2 = randomVal(user, obj);

      expect(val2).to.equal(val1);
    });

    it('returns a different value when the seed is different', () => {
      let val1 = randomVal(user, obj, {
        seed: 222,
      });

      let val2 = randomVal(user, obj, {
        seed: 333,
      });

      expect(val2).to.not.equal(val1);
    });

    it('returns a different value when user.stats is different', () => {
      user.stats.gp = 34;
      let val1 = randomVal(user, obj);
      user.stats.gp = 343;
      let val2 = randomVal(user, obj);

      expect(val2).to.not.equal(val1);
    });
  });

  describe('returns a random key from an object', () => {
    it('returns the same key when the seed is the same', () => {
      let key1 = randomVal(user, obj, {
        key: true,
        seed: 222,
      });

      let key2 = randomVal(user, obj, {
        key: true,
        seed: 222,
      });

      expect(key2).to.equal(key1);
    });

    it('returns the same key when user.stats is the same', () => {
      user.stats.gp = 45;
      let key1 = randomVal(user, obj, {
        key: true,
      });

      let key2 = randomVal(user, obj, {
        key: true,
      });

      expect(key2).to.equal(key1);
    });

    it('returns a different key when the seed is different', () => {
      let key1 = randomVal(user, obj, {
        key: true,
        seed: 222,
      });

      let key2 = randomVal(user, obj, {
        key: true,
        seed: 333,
      });

      expect(key2).to.not.equal(key1);
    });

    it('returns a different key when user.stats is different', () => {
      user.stats.gp = 45;
      let key1 = randomVal(user, obj, {
        key: true,
      });

      user.stats.gp = 43;

      let key2 = randomVal(user, obj, {
        key: true,
      });

      expect(key2).to.not.equal(key1);
    });
  });
});
