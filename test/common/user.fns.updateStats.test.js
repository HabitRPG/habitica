import {
  generateUser,
} from '../helpers/common.helper';

describe('user.fns.updateStats', () => {
  let user;

  beforeEach(() => {
    user = generateUser({});
  });

  context('No Hp', () => {
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
    it('adds only attribute points up to user\'s level', () => {
      let stats = {
        exp: 261,
      };

      user.stats.lvl = 10;

      user.fns.updateStats(stats);

      expect(user.stats.points).to.eql(11);
    });

    it('adds an attibute point when user\'s stat points are less than max level', () => {
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

    it('does not add an attibute point when user\'s stat points are equal to max level', () => {
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

    it('does not add an attibute point when user\'s stat points + unallocated points are equal to max level', () => {
      let stats = {
        exp: 3581,
      };

      user.stats.lvl = 99;
      user.stats.str = 25;
      user.stats.int = 25;
      user.stats.con = 25;
      user.stats.per = 15;
      user.stats.points = 10;

      user.fns.updateStats(stats);

      expect(user.stats.points).to.eql(10);
    });

    it('only awards stat points up to level 100 if user is missing unallocated stat points and is over level 100', () => {
      let stats = {
        exp: 5581,
      };

      user.stats.lvl = 104;
      user.stats.str = 25;
      user.stats.int = 25;
      user.stats.con = 25;
      user.stats.per = 15;
      user.stats.points = 0;

      user.fns.updateStats(stats);

      expect(user.stats.points).to.eql(10);
    });

    // @TODO: Set up sinon sandbox
    xit('auto allocates stats if automaticAllocation is turned on', () => {
      sandbox.stub(user.fns, 'autoAllocate');

      let stats = {
        exp: 261,
      };

      user.stats.lvl = 10;

      user.fns.updateStats(stats);

      expect(user.fns.autoAllocate).to.be.calledOnce;
    });
  });
});
