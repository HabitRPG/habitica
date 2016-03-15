import sleep from '../../../common/script/ops/sleep';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.ops.sleep', () => {
  it('changes user.preferences.sleep and returns the new value', () => {
    let user = generateUser();

    let res = sleep(user);
    expect(res).to.equal(true);
    expect(user.preferences.sleep).to.equal(true);

    let res2 = sleep(user);
    expect(res2).to.equal(false);
    expect(user.preferences.sleep).to.equal(false);
  });
});
