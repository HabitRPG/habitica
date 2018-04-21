import axios from 'axios';
import generateStore from 'client/store';

describe('user actions', () => {
  let store;

  beforeEach(() => {
    store = generateStore();
  });

  describe('fetch', () => {
    it('loads the user', async () => {
      expect(store.state.user.loadingStatus).to.equal('NOT_LOADED');
      const user = {_id: 1};
      sandbox.stub(axios, 'get').withArgs('/api/v3/user').returns(Promise.resolve({data: {data: user}}));

      await store.dispatch('user:fetch');

      expect(store.state.user.data).to.equal(user);
      expect(store.state.user.loadingStatus).to.equal('LOADED');
    });

    it('does not reload user by default', async () => {
      const originalUser = {_id: 1};
      store.state.user = {
        loadingStatus: 'LOADED',
        data: originalUser,
      };

      const user = {_id: 2};
      sandbox.stub(axios, 'get').withArgs('/api/v3/user').returns(Promise.resolve({data: {data: user}}));

      await store.dispatch('user:fetch');

      expect(store.state.user.data).to.equal(originalUser);
      expect(store.state.user.loadingStatus).to.equal('LOADED');
    });

    it('can reload user if forceLoad is true', async () => {
      store.state.user = {
        loadingStatus: 'LOADED',
        data: {_id: 1},
      };

      const user = {_id: 2};
      sandbox.stub(axios, 'get').withArgs('/api/v3/user').returns(Promise.resolve({data: {data: user}}));

      await store.dispatch('user:fetch', {forceLoad: true});

      expect(store.state.user.data).to.equal(user);
      expect(store.state.user.loadingStatus).to.equal('LOADED');
    });
  });
});