import statsComputed from '../../../website/common/script/libs/statsComputed';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('common.fns.statsComputed', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('returns the same result if called directly, through user.fns.statsComputed, or user._statsComputed', () => {
    let result = statsComputed(user);
    let result2 = user._statsComputed;
    let result3 = user.fns.statsComputed();
    expect(result).to.eql(result2);
    expect(result).to.eql(result3);
  });

  it('returns default values', () => {
    let result = statsComputed(user);
    expect(result.per).to.eql(0);
    expect(result.con).to.eql(0);
    expect(result.str).to.eql(0);
    expect(result.maxMP).to.eql(30);
  });
});
