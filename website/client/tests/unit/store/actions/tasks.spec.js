import axios from 'axios';
import generateStore from '@/store';

describe('tasks actions', () => {
  let store;

  beforeEach(() => {
    store = generateStore();
  });

  describe('fetchUserTasks', () => {
    afterEach(() => {
      if (axios.get && axios.get.restore) axios.get.restore();
    });

    it.skip('fetches user tasks', async () => {
      expect(store.state.tasks.loadingStatus).to.equal('NOT_LOADED');
      const tasks = [{ _id: 1 }];
      sandbox.stub(axios, 'get').withArgs('/api/v4/tasks/user').returns(Promise.resolve({ data: { data: tasks } }));

      await store.dispatch('tasks:fetchUserTasks');

      expect(store.state.tasks.data).to.equal(tasks);
      expect(store.state.tasks.loadingStatus).to.equal('LOADED');
    });

    it('does not reload tasks by default', async () => {
      const originalTask = [{ _id: 1 }];
      store.state.tasks = {
        loadingStatus: 'LOADED',
        data: originalTask,
      };

      const tasks = [{ _id: 2 }];
      sandbox.stub(axios, 'get').withArgs('/api/v4/tasks/user').returns(Promise.resolve({ data: { data: tasks } }));

      await store.dispatch('tasks:fetchUserTasks');

      expect(store.state.tasks.data).to.equal(originalTask);
      expect(store.state.tasks.loadingStatus).to.equal('LOADED');
    });

    it.skip('can reload tasks if forceLoad is true', async () => {
      store.state.tasks = {
        loadingStatus: 'LOADED',
        data: [{ _id: 1 }],
      };

      const tasks = [{ _id: 2 }];
      sandbox.stub(axios, 'get').withArgs('/api/v4/tasks/user').returns(Promise.resolve({ data: { data: tasks } }));

      await store.dispatch('tasks:fetchUserTasks', true);

      expect(store.state.tasks.data).to.eql(tasks);
      expect(store.state.tasks.loadingStatus).to.equal('LOADED');
    });
  });
});
