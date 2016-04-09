import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

let user;
let endpoint = '/user/webhook';

describe('DELETE /user/webhook', () => {
  beforeEach(async () => {
    user = await generateUser();
  });

  it('succeeds', async () => {
    let id = 'some-id';
    user.preferences.webhooks[id] = { url: 'http://some-url.com', enabled: true };
    await user.sync();
    expect(user.preferences.webhooks).to.eql({});
    let response = await user.del(`${endpoint}/${id}`);
    expect(response).to.eql({});
    await user.sync();
    expect(user.preferences.webhooks).to.eql({});
  });
});
