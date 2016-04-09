import autoAllocate from '../../../common/script/fns/autoAllocate';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.fns.autoAllocate', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('user.preferences.allocationMode === flat', () => {
    user.stats.con = 5;
    user.stats.int = 5;
    user.stats.per = 3;
    user.stats.str = 8;

    user.preferences.allocationMode = 'flat';

    autoAllocate(user);

    expect(user.stats.con).to.equal(5);
    expect(user.stats.int).to.equal(5);
    expect(user.stats.per).to.equal(4);
    expect(user.stats.str).to.equal(8);
  });

  it('user.preferences.allocationMode === taskbased', () => {
    user.stats.con = 5;
    user.stats.int = 5;
    user.stats.per = 3;
    user.stats.str = 8;
    user.stats.training.con = 2;
    user.stats.training.int = 5;
    user.stats.training.per = 7;
    user.stats.training.str = 4;

    user.preferences.allocationMode = 'taskbased';

    autoAllocate(user);

    expect(user.stats.con).to.equal(5);
    expect(user.stats.int).to.equal(5);
    expect(user.stats.per).to.equal(4);
    expect(user.stats.str).to.equal(8);

    expect(user.stats.training.con).to.equal(0);
    expect(user.stats.training.int).to.equal(0);
    expect(user.stats.training.per).to.equal(0);
    expect(user.stats.training.str).to.equal(0);
  });

  it('user.preferences.allocationMode === classbased', () => {
    user.stats.lvl = 35;
    user.stats.class = 'healer';
    user.stats.con = 5;
    user.stats.int = 5;
    user.stats.per = 3;
    user.stats.str = 8;

    user.preferences.allocationMode = 'classbased';

    autoAllocate(user);

    expect(user.stats.con).to.equal(6);
    expect(user.stats.int).to.equal(5);
    expect(user.stats.per).to.equal(3);
    expect(user.stats.str).to.equal(8);
  });

  it('user.preferences.allocationMode === anything', () => {
    user.stats.con = 5;
    user.stats.int = 5;
    user.stats.per = 3;
    user.stats.str = 8;
    user.preferences.allocationMode = 'wrong';

    autoAllocate(user);

    expect(user.stats.con).to.equal(5);
    expect(user.stats.int).to.equal(5);
    expect(user.stats.per).to.equal(3);
    expect(user.stats.str).to.equal(9);
  });
});
