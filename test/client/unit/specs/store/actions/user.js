import { fetch as fetchUser } from 'client/store/actions/user';
import axios from 'axios';
import storeModule from 'client/store';
import cloneDeep from 'lodash/cloneDeep';

describe('user actions', () => {
  describe('fetch', () => {
    it('loads the user', async () => {
      const store = cloneDeep(storeModule);
      expect(store.state.user.loadingStatus).to.equal('NOT_LOADED');
      const user = {_id: 1};
      sandbox.stub(axios, 'get').withArgs('/api/v3/user').returns(Promise.resolve({data: {data: user}}));

      await fetchUser(store);

      expect(store.state.user.data).to.equal(user);
      expect(store.state.user.loadingStatus).to.equal('LOADED');
    });

    it('does not reload user by default', async () => {
      const store = cloneDeep(storeModule);
      const originalUser = {_id: 1};
      store.state.user = {
        loadingStatus: 'LOADED',
        data: originalUser,
      };

      const user = {_id: 2};
      sandbox.stub(axios, 'get').withArgs('/api/v3/user').returns(Promise.resolve({data: {data: user}}));

      await fetchUser(store);

      expect(store.state.user.data).to.equal(originalUser);
      expect(store.state.user.loadingStatus).to.equal('LOADED');
    });

    it('can reload user if forceLoad is true', async () => {
      const store = cloneDeep(storeModule);
      store.state.user = {
        loadingStatus: 'LOADED',
        data: {_id: 1},
      };

      const user = {_id: 2};
      sandbox.stub(axios, 'get').withArgs('/api/v3/user').returns(Promise.resolve({data: {data: user}}));

      await fetchUser(store, true);

      expect(store.state.user.data).to.equal(user);
      expect(store.state.user.loadingStatus).to.equal('LOADED');
    });
  });
});