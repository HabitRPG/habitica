import crit from '../../../website/common/script/fns/crit';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('crit', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('computes', () => {
    let result = crit(user);
    expect(result).to.eql(1);
  });
});
