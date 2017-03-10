import { fetchUserTasks } from 'client/store/actions/tasks';
import axios from 'axios';
import store from 'client/store';

describe('tasks actions', () => {
  it('fetchUserTasks', async () => {
    const tasks = [{_id: 1}];
    sandbox.stub(axios, 'get').withArgs('/api/v3/tasks/user').returns(Promise.resolve({data: {data: tasks}}));

    await fetchUserTasks(store);

    expect(store.state.tasks).to.equal(tasks);
  });
});