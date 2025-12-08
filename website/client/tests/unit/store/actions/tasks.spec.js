import {
  describe, expect, test, beforeEach, afterEach,
} from 'vitest';
import axios from 'axios';
import sinon from 'sinon';
import generateStore from '@/store';

const sandbox = sinon.createSandbox();

describe('tasks actions', () => {
  let store;

  beforeEach(() => {
    store = generateStore();
  });

  describe('fetchUserTasks', () => {
    afterEach(() => {
      if (axios.get && axios.get.restore) axios.get.restore();
    });

    test.skip('fetches user tasks', async () => {
      expect(store.state.tasks.loadingStatus).to.equal('NOT_LOADED');
      const tasks = [{ _id: 1 }];
      sandbox.stub(axios, 'get').withArgs('/api/v4/tasks/user').returns(Promise.resolve({ data: { data: tasks } }));

      await store.dispatch('tasks:fetchUserTasks');

      expect(store.state.tasks.data).to.equal(tasks);
      expect(store.state.tasks.loadingStatus).to.equal('LOADED');
    });

    test('does not reload tasks by default', async () => {
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

    test.skip('can reload tasks if forceLoad is true', async () => {
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

    test.skip('appends scheduledFilter to URL when provided', async () => {
      const stub = sandbox.stub(axios, 'get').returns(Promise.resolve({ data: { data: [] } }));

      await store.dispatch('tasks:fetchUserTasks', { forceLoad: true, scheduledFilter: 'today' });

      expect(stub.calledWith('/api/v4/tasks/user?scheduledFilter=today')).to.be.true;
    });

    test.skip('appends scheduledFilter=week to URL', async () => {
      const stub = sandbox.stub(axios, 'get').returns(Promise.resolve({ data: { data: [] } }));

      await store.dispatch('tasks:fetchUserTasks', { forceLoad: true, scheduledFilter: 'week' });

      expect(stub.calledWith('/api/v4/tasks/user?scheduledFilter=week')).to.be.true;
    });

    test.skip('appends scheduledFilter=month to URL', async () => {
      const stub = sandbox.stub(axios, 'get').returns(Promise.resolve({ data: { data: [] } }));

      await store.dispatch('tasks:fetchUserTasks', { forceLoad: true, scheduledFilter: 'month' });

      expect(stub.calledWith('/api/v4/tasks/user?scheduledFilter=month')).to.be.true;
    });

    test.skip('appends scheduledFilter=all to URL', async () => {
      const stub = sandbox.stub(axios, 'get').returns(Promise.resolve({ data: { data: [] } }));

      await store.dispatch('tasks:fetchUserTasks', { forceLoad: true, scheduledFilter: 'all' });

      expect(stub.calledWith('/api/v4/tasks/user?scheduledFilter=all')).to.be.true;
    });

    test.skip('does not append scheduledFilter when not provided', async () => {
      const stub = sandbox.stub(axios, 'get').returns(Promise.resolve({ data: { data: [] } }));

      await store.dispatch('tasks:fetchUserTasks', { forceLoad: true });

      expect(stub.calledWith('/api/v4/tasks/user')).to.be.true;
    });
  });
});
