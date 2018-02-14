import updateStats from '../../../website/common/script/fns/updateStats';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('common.fns.updateStats', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
    user.addNotification = sinon.spy();
  });

  context('No Hp', () => {
    it('updates user\s hp', () => {
      let stats = { hp: 0 };
      expect(user.stats.hp).to.not.eql(0);
      updateStats(user, stats);
      expect(user.stats.hp).to.eql(0);
      updateStats(user, { hp: 2 });
      expect(user.stats.hp).to.eql(2);
    });

    it('does not lower hp below 0', () => {
      let stats = {
        hp: -5,
      };
      updateStats(user, stats);
      expect(user.stats.hp).to.eql(0);
    });
  });

  context('Stat Allocation', () => {
    it('adds only attribute points up to user\'s level', () => {
      let stats = {
        exp: 261,
      };
      expect(user.stats.points).to.eql(0);

      user.stats.lvl = 10;

      updateStats(user, stats);

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

      updateStats(user, stats);

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

      updateStats(user, stats);

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

      updateStats(user, stats);

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

      updateStats(user, stats);

      expect(user.stats.points).to.eql(10);
    });

    it('add user notification when drops are enabled', () => {
      user.stats.lvl = 3;
      updateStats(user, { });
      expect(user.addNotification).to.be.calledOnce;
      expect(user.addNotification).to.be.calledWith('DROPS_ENABLED');
    });

    it('add user notification when rebirth is enabled', () => {
      user.stats.lvl = 51;
      updateStats(user, { });
      expect(user.addNotification).to.be.calledTwice; // once is for drops enabled
      expect(user.addNotification).to.be.calledWith('REBIRTH_ENABLED');
    });

    context('assigns flags.levelDrops', () => {
      it('for atom1', () => {
        user.stats.lvl = 16;
        user.flags.levelDrops.atom1 = false;
        expect(user.items.quests.atom1).to.eql(undefined);
        updateStats(user, { atom1: true });
        expect(user.items.quests.atom1).to.eql(1);
        expect(user.flags.levelDrops.atom1).to.eql(true);
        updateStats(user, { atom1: true });
        expect(user.items.quests.atom1).to.eql(1); // no change
      });
      it('for vice1', () => {
        user.stats.lvl = 31;
        user.flags.levelDrops.vice1 = false;
        expect(user.items.quests.vice1).to.eql(undefined);
        updateStats(user, { vice1: true });
        expect(user.items.quests.vice1).to.eql(1);
        expect(user.flags.levelDrops.vice1).to.eql(true);
        updateStats(user, { vice1: true });
        expect(user.items.quests.vice1).to.eql(1);
      });
      it('moonstone', () => {
        user.stats.lvl = 60;
        user.flags.levelDrops.moonstone1 = false;
        expect(user.items.quests.moonstone1).to.eql(undefined);
        updateStats(user, { moonstone1: true });
        expect(user.flags.levelDrops.moonstone1).to.eql(true);
        expect(user.items.quests.moonstone1).to.eql(1);
        updateStats(user, { moonstone1: true });
        expect(user.items.quests.moonstone1).to.eql(1);
      });
      it('for goldenknight1', () => {
        user.stats.lvl = 40;
        user.flags.levelDrops.goldenknight1 = false;
        expect(user.items.quests.goldenknight1).to.eql(undefined);
        updateStats(user, { goldenknight1: true });
        expect(user.items.quests.goldenknight1).to.eql(1);
        expect(user.flags.levelDrops.goldenknight1).to.eql(true);
        updateStats(user, { goldenknight1: true });
        expect(user.items.quests.goldenknight1).to.eql(1);
      });
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
