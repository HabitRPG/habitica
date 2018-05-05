import autoAllocate from '../../../website/common/script/fns/autoAllocate';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.fns.autoAllocate', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
    // necessary to test task training reset behavior
    user.stats.toObject = function () {
      let obj = JSON.parse(JSON.stringify(this));

      return obj;
    };
  });

  context('flat allocation mode', () => {
    beforeEach(() => {
      user.stats.con = 5;
      user.stats.int = 5;
      user.stats.per = 3;
      user.stats.str = 8;

      user.preferences.allocationMode = 'flat';
    });

    it('increases the lowest stat', () => {
      autoAllocate(user);

      expect(user.stats.con).to.equal(5);
      expect(user.stats.int).to.equal(5);
      expect(user.stats.per).to.equal(4);
      expect(user.stats.str).to.equal(8);
    });
  });

  context('task based allocation mode', () => {
    beforeEach(() => {
      user.stats.con = 5;
      user.stats.int = 5;
      user.stats.per = 3;
      user.stats.str = 8;

      user.stats.training.con = 2;
      user.stats.training.int = 5;
      user.stats.training.per = 7;
      user.stats.training.str = 4;

      user.preferences.allocationMode = 'taskbased';
    });

    it('increases highest training stat', () => {
      autoAllocate(user);

      expect(user.stats.con).to.equal(5);
      expect(user.stats.int).to.equal(5);
      expect(user.stats.per).to.equal(4);
      expect(user.stats.str).to.equal(8);
    });

    it('increases strength if no stat can be suggested', () => {
      user.stats.training = {};

      autoAllocate(user);

      expect(user.stats.con).to.equal(5);
      expect(user.stats.int).to.equal(5);
      expect(user.stats.per).to.equal(3);
      expect(user.stats.str).to.equal(9);
    });

    it('resets training object', () => {
      autoAllocate(user);

      expect(user.stats.training.con).to.equal(0);
      expect(user.stats.training.int).to.equal(0);
      expect(user.stats.training.per).to.equal(0);
      expect(user.stats.training.str).to.equal(0);
    });
  });

  context('class based allocation mode', () => {
    beforeEach(() => {
      user.stats.lvl = 35;
      user.stats.con = 5;
      user.stats.int = 5;
      user.stats.per = 3;
      user.stats.str = 8;

      user.preferences.allocationMode = 'classbased';
    });

    it('increases stats based on class preference', () => {
      user.stats.class = 'healer';

      autoAllocate(user);

      expect(user.stats.con).to.equal(6);
      expect(user.stats.int).to.equal(5);
      expect(user.stats.per).to.equal(3);
      expect(user.stats.str).to.equal(8);
    });
  });

  context('invalid alocation mode', () => {
    beforeEach(() => {
      user.stats.con = 5;
      user.stats.int = 5;
      user.stats.per = 3;
      user.stats.str = 8;

      user.preferences.allocationMode = 'wrong';
    });

    it('increases strenth', () => {
      autoAllocate(user);

      expect(user.stats.con).to.equal(5);
      expect(user.stats.int).to.equal(5);
      expect(user.stats.per).to.equal(3);
      expect(user.stats.str).to.equal(9);
    });
  });
});
