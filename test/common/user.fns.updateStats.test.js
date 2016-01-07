import {
  generateUser,
} from '../helpers/common.helper';

describe('user.fns.updateStats', () => {
  let user;

  beforeEach(() => {
    user = generateUser({});
  });

  context('no hp', () => {
    it('returns 0 if user\'s hp is 0', () => {
      let stats = {
        hp: 0,
      };

      expect(user.fns.updateStats(stats)).to.eql(0);
    });

    it('returns 0 if user\'s hp is less than 0', () => {
      let stats = {
        hp: -5,
      };

      expect(user.fns.updateStats(stats)).to.eql(0);
    });

    it('sets user\'s hp to 0 if it is less than 0', () => {
      let stats = {
        hp: -5,
      };

      user.fns.updateStats(stats);

      expect(user.stats.hp).to.eql(0);
    });
  });

  context('Stat Allocation', () => {
    it('Adds an attibute point when user\'s stat points are less than max level', () => {
      let stats = {
        exp: 3581,
      };

      user.stats.lvl = 99;
      user.stats.str = 25;
      user.stats.int = 25;
      user.stats.con = 25;
      user.stats.per = 24;

      user.fns.updateStats(stats);

      expect(user.stats.points).to.eql(1);
    });

    it('Does not add an attibute point when user\'s stat points are equal to max level', () => {
      let stats = {
        exp: 3581,
      };

      user.stats.lvl = 99;
      user.stats.str = 25;
      user.stats.int = 25;
      user.stats.con = 25;
      user.stats.per = 25;

      user.fns.updateStats(stats);

      expect(user.stats.points).to.eql(0);
    });
  });
});
