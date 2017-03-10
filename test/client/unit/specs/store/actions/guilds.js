import { fetchAll as fetchAllGuilds } from 'client/store/actions/guilds';
import axios from 'axios';
import store from 'client/store';

describe('guilds actions', () => {
  it('fetchAll', async () => {
    const guilds = [{_id: 1}];
    sandbox
      .stub(axios, 'get')
      .withArgs('/api/v3/groups?type=publicGuilds')
      .returns(Promise.resolve({data: {data: guilds}}));

    await fetchAllGuilds(store);

    expect(store.state.guilds).to.equal(guilds);
  });
});