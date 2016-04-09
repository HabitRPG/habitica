import deleteWebhook from '../../../common/script/ops/deleteWebhook';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.ops.deleteWebhook', () => {
  let user;
  let req;

  beforeEach(() => {
    user = generateUser();
    req = { params: { id: 'some-id' } };
  });

  it('succeeds', () => {
    user.preferences.webhooks = { 'some-id': {}, 'another-id': {} };
    let res = deleteWebhook(user, req);
    expect(user.preferences.webhooks).to.eql({'another-id': {}});
    expect(res).to.equal(user.preferences.webhooks);
  });
});
