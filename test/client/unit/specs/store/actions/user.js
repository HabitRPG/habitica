import { fetch as fetchUser } from 'client/store/actions/user';
import axios from 'axios';
import store from 'client/store';

describe('user actions', () => {
  it('fetch', async () => {
    const user = {_id: 1};
    sandbox.stub(axios, 'get').withArgs('/api/v3/user').returns(Promise.resolve({data: {data: user}}));

    await fetchUser(store);

    expect(store.state.user).to.equal(user);
  });
});