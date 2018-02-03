import clearPMs from '../../../website/common/script/ops/clearPMs';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.ops.clearPMs', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
    user.inbox.messages = { first: 'message', second: 'message' };
  });

  it('clears messages', () => {
    expect(user.inbox.messages).to.not.eql({});
    let [result] = clearPMs(user);
    expect(user.inbox.messages).to.eql({});
    expect(result).to.eql({});
  });
});
