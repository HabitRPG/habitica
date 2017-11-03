import allocateNow from '../../../../website/common/script/ops/stats/allocateNow';
import {
  generateUser,
} from '../../../helpers/common.helper';

describe('shared.ops.allocateNow', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('auto allocates all points', () => {
    user.stats.points = 5;
    user.stats.int = 3;
    user.stats.con = 9;
    user.stats.per = 9;
    user.stats.str = 9;
    user.preferences.allocationMode = 'flat';

    let [data] = allocateNow(user);

    expect(user.stats.points).to.equal(0);
    expect(user.stats.con).to.equal(9);
    expect(user.stats.int).to.equal(8);
    expect(user.stats.per).to.equal(9);
    expect(user.stats.str).to.equal(9);
    expect(data).to.eql(user.stats);
  });
});
