import axios from 'axios';
import { asyncResourceFactory, loadAsyncResource } from '@/libs/asyncResource';
import generateStore from '@/store';
import { sleep } from '@/../../../test/helpers/sleep';

describe('async resource', () => {
  it('asyncResourceFactory', () => {
    const resource = asyncResourceFactory();
    expect(resource.loadingStatus).to.equal('NOT_LOADED');
    expect(resource.data).to.equal(null);
    expect(resource).to.not.equal(asyncResourceFactory);
  });

  describe('loadAsyncResource', () => {
    afterEach(() => {
      if (axios.get && axios.get.restore) axios.get.restore();
    });

    context('errors', () => {
      it('store is missing', () => {
        expect(() => loadAsyncResource({})).to.throw;
      });
      it('path is missing', () => {
        expect(() => loadAsyncResource({
          store: 'store',
        })).to.throw;
      });
      it('url is missing', () => {
        expect(() => loadAsyncResource({
          store: 'store',
          path: 'path',
        })).to.throw;
      });
      it('deserialize is missing', () => {
        expect(() => loadAsyncResource({
          store: 'store',
          path: 'path',
          url: 'url',
        })).to.throw;
      });
      it('resource not found', () => {
        const store = generateStore();

        expect(() => loadAsyncResource({
          store,
          path: 'not existing path',
          url: 'url',
          deserialize: 'deserialize',
        })).to.throw;
      });

      it('invalid loading status', () => {
        const store = generateStore();
        store.state.user.loadingStatus = 'INVALID';

        expect(loadAsyncResource({
          store,
          path: 'user',
          url: 'url',
          deserialize: 'deserialize',
        })).to.eventually.be.rejected;
      });
    });

    it('returns the resource if it is already loaded and forceLoad is false', async () => {
      const store = generateStore();
      store.state.user.loadingStatus = 'LOADED';
      store.state.user.data = { _id: 1 };

      sandbox.stub(axios, 'get');

      const resource = await loadAsyncResource({
        store,
        path: 'user',
        url: 'url',
        deserialize: 'deserialize',
      });

      expect(resource).to.equal(store.state.user);
      expect(axios.get).to.not.have.been.called;
    });

    it('load the resource if it is not loaded', async () => {
      const store = generateStore();
      store.state.user = asyncResourceFactory();

      sandbox.stub(axios, 'get').withArgs('/api/v4/user').returns(Promise.resolve({ data: { data: { _id: 1 } } }));

      const resource = await loadAsyncResource({
        store,
        path: 'user',
        url: '/api/v4/user',
        deserialize (response) {
          return response.data.data;
        },
      });

      expect(resource).to.equal(store.state.user);
      expect(resource.loadingStatus).to.equal('LOADED');
      expect(resource.data._id).to.equal(1);
      expect(axios.get).to.have.been.calledOnce;
    });

    it('load the resource if it is loaded but forceLoad is true', async () => {
      const store = generateStore();
      store.state.user.loadingStatus = 'LOADED';

      sandbox.stub(axios, 'get').withArgs('/api/v4/user').returns(Promise.resolve({ data: { data: { _id: 1 } } }));

      const resource = await loadAsyncResource({
        store,
        path: 'user',
        url: '/api/v4/user',
        deserialize (response) {
          return response.data.data;
        },
        forceLoad: true,
      });

      expect(resource).to.equal(store.state.user);
      expect(resource.loadingStatus).to.equal('LOADED');
      expect(resource.data._id).to.equal(1);
      expect(axios.get).to.have.been.calledOnce;
    });

    describe('reloadOnAppVersionChange', async () => {
      let store;

      beforeEach(() => {
        store = generateStore();
        store.state.worldState.loadingStatus = 'LOADED';
        store.state.serverAppVersion = 1;
        store.state.worldState.appVersionOnLoad = 1;
      });

      it('load the resource if it is loaded but the appVersion has changed', async () => {
        store.state.serverAppVersion = 2;
        sandbox.stub(axios, 'get').withArgs('/api/v4/world-state').returns(Promise.resolve({
          data: { data: { _id: 1 } },
        }));

        const resource = await loadAsyncResource({
          store,
          path: 'worldState',
          url: '/api/v4/world-state',
          reloadOnAppVersionChange: true,
          deserialize (response) {
            return response.data.data;
          },
        });

        expect(resource).to.equal(store.state.worldState);
        expect(resource.loadingStatus).to.equal('LOADED');
        expect(resource.data._id).to.equal(1);
        expect(axios.get).to.have.been.calledOnce;
      });

      it('does not load the resource if it is loaded but the appVersion has changed', async () => {
        sandbox.stub(axios, 'get').returns(Promise.resolve({ data: { data: { _id: 1 } } }));

        const resource = await loadAsyncResource({
          store,
          path: 'worldState',
          url: '/api/v4/world-state',
          reloadOnAppVersionChange: true,
          deserialize (response) {
            return response.data.data;
          },
        });

        expect(resource).to.equal(store.state.worldState);
        expect(axios.get).to.not.have.been.called;
      });
    });

    it('does not send multiple requests if the resource is being loaded', async () => {
      const store = generateStore();
      store.state.user.loadingStatus = 'LOADING';

      sandbox.stub(axios, 'get').withArgs('/api/v4/user').returns(Promise.resolve({ data: { data: { _id: 1 } } }));

      const resourcePromise = loadAsyncResource({
        store,
        path: 'user',
        url: '/api/v4/user',
        deserialize (response) {
          return response.data.data;
        },
        forceLoad: true,
      });

      await sleep(0.1);
      const userData = { _id: 1 };

      expect(store.state.user.loadingStatus).to.equal('LOADING');
      expect(axios.get).to.not.have.been.called;
      store.state.user.data = userData;
      store.state.user.loadingStatus = 'LOADED';

      const result = await resourcePromise;
      expect(axios.get).to.not.have.been.called;
      expect(result).to.equal(store.state.user);
    });
  });
});
