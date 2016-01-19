import {
  generateUser,
} from '../helpers/common.helper';

describe('user.ops.checkStats', () => {
  let user;

  beforeEach(() => {
    user = generateUser({});
  });

  context('Checking a user', () => {
    it('does not affect stats when no updates are made', () => {
      let _stats = user.stats;

      user.ops.checkStats({});

      expect(user.stats).to.eql(_stats);
    });

    it('levels a user when they are beyond the current exp threshold', () => {
      user.stats.exp = 151;
      user.stats.lvl = 1;

      user.ops.checkStats({});

      expect({lvl: user.stats.lvl, exp: user.stats.exp}).to.eql({lvl: 2, exp: 1});
    });
  });
});
