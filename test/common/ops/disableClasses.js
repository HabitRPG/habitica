import disableClasses from '../../../website/common/script/ops/disableClasses';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.ops.disableClasses', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('disable classes', () => {
    user.stats.lvl = 34;
    user.stats.str = 45;
    user.stats.class = 'healer';
    user.preferences.disableClasses = false;
    user.preferences.autoAllocate = false;
    user.stats.points = 2;

    let [data] = disableClasses(user);
    expect(data).to.eql({
      preferences: user.preferences,
      stats: user.stats,
      flags: user.flags,
    });

    expect(user.stats.class).to.equal('warrior');
    expect(user.flags.classSelected).to.equal(true);
    expect(user.preferences.disableClasses).to.equal(true);
    expect(user.preferences.autoAllocate).to.equal(true);
    expect(user.stats.str).to.equal(34);
    expect(user.stats.points).to.equal(0);
  });
});
