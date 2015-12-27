import {
  generateUser,
} from '../helpers/common.helper';

describe('user.fns.updateStats', () => {
  let user;

  beforeEach(() => {
    user = generateUser({
      stats: {
        int: 20,
        str: 20,
        con: 20,
        per: 20,
        lvl: 20,
      },
    });
  });

  context('Stat Allocation', () => {
    it('adds an attibute point when user\'s stat points are less than max level', () => {
      user.stats.exp = 3581;
      user.stats.lvl = 99;
      user.stats.str = 25;
      user.stats.int = 25;
      user.stats.con = 25;
      user.stats.per = 24;

      user.fns.updateStats(user.stats);

      expect(user.stats.points).to.eql(1);
    });

    it('does not add an attibute point when user\'s stat points are equal to max level', () => {
      user.stats.exp = 3581;
      user.stats.lvl = 99;
      user.stats.str = 25;
      user.stats.int = 25;
      user.stats.con = 25;
      user.stats.per = 25;

      user.fns.updateStats(user.stats);

      expect(user.stats.points).to.eql(0);
    });
  });
});
