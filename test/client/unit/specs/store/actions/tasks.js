import { fetchUserTasks } from 'client/store/actions/tasks';
import axios from 'axios';
import storeModule from 'client/store';
import cloneDeep from 'lodash/cloneDeep';

describe('tasks actions', () => {
  describe('fetchUserTasks', () => {
    it('fetches user tasks', async () => {
      const store = cloneDeep(storeModule);
      expect(store.state.tasks.loadingStatus).to.equal('NOT_LOADED');
      const tasks = [{_id: 1}];
      sandbox.stub(axios, 'get').withArgs('/api/v3/tasks/user').returns(Promise.resolve({data: {data: tasks}}));

      await fetchUserTasks(store);

      expect(store.state.tasks.data).to.equal(tasks);
      expect(store.state.tasks.loadingStatus).to.equal('LOADED');
    });

    it('does not reload tasks by default', async () => {
      const store = cloneDeep(storeModule);
      const originalTask = [{_id: 1}];
      store.state.tasks = {
        loadingStatus: 'LOADED',
        data: originalTask,
      };

      const tasks = [{_id: 2}];
      sandbox.stub(axios, 'get').withArgs('/api/v3/tasks/user').returns(Promise.resolve({data: {data: tasks}}));

      await fetchUserTasks(store);

      expect(store.state.tasks.data).to.equal(originalTask);
      expect(store.state.tasks.loadingStatus).to.equal('LOADED');
    });

    it('can reload tasks if forceLoad is true', async () => {
      const store = cloneDeep(storeModule);
      store.state.tasks = {
        loadingStatus: 'LOADED',
        data: [{_id: 1}],
      };

      const tasks = [{_id: 2}];
      sandbox.stub(axios, 'get').withArgs('/api/v3/tasks/user').returns(Promise.resolve({data: {data: tasks}}));

      await fetchUserTasks(store, true);

      expect(store.state.tasks.data).to.equal(tasks);
      expect(store.state.tasks.loadingStatus).to.equal('LOADED');
    });
  });
});