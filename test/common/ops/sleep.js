import sleep from '../../../common/script/ops/sleep';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.ops.sleep', () => {
  it('toggles user.preferences.sleep', () => {
    let user = generateUser();

    let res = sleep(user);
    expect(res).to.eql({preferences: {sleep: true}});
    expect(user.preferences.sleep).to.equal(true);

    let res2 = sleep(user);
    expect(res2).to.eql({preferences: {sleep: false}});
    expect(user.preferences.sleep).to.equal(false);
  });
});
