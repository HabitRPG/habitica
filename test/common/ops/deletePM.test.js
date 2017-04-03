import deletePM from '../../../website/common/script/ops/deletePM';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.ops.deletePM', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
    user.inbox.messages = { first: 'message', second: 'message' };
  });

  it('delete message', () => {
    expect(user.inbox.messages).to.not.eql({ second: 'message' });
    let [response] = deletePM(user, { params: { id: 'first' } });
    expect(user.inbox.messages).to.eql({ second: 'message' });
    expect(response).to.eql({ second: 'message' });
  });
});
