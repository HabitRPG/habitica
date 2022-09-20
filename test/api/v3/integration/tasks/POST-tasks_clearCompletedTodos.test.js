import {
  generateUser,
  generateGroup,
  generateChallenge,
} from '../../../../helpers/api-integration/v3';

describe('POST /tasks/clearCompletedTodos', () => {
  it('deletes all completed todos except the ones from a challenge and group', async () => {
    const user = await generateUser({ balance: 1 });
    const guild = await generateGroup(
      user,
      {},
      { 'purchased.plan.customerId': 'group-unlimited' },
    );
    const challenge = await generateChallenge(user, guild);
    await user.put('/user', {
      'preferences.tasks.mirrorGroupTasks': [guild._id],
    });
    await user.post(`/challenges/${challenge._id}/join`);

    const initialTodoCount = user.tasksOrder.todos.length;
    await user.post('/tasks/user', [
      { text: 'todo 1', type: 'todo' },
      { text: 'todo 2', type: 'todo' },
      { text: 'todo 3', type: 'todo' },
      { text: 'todo 4', type: 'todo' },
      { text: 'todo 5', type: 'todo' },
    ]);

    await user.post(`/tasks/challenge/${challenge._id}`, {
      text: 'todo 6',
      type: 'todo',
    });

    const groupTask = await user.post(`/tasks/group/${guild._id}`, {
      text: 'todo 7',
      type: 'todo',
    });
    await user.post(`/tasks/${groupTask._id}/assign`, [user._id]);

    const tasks = await user.get('/tasks/user?type=todos');
    expect(tasks.length).to.equal(initialTodoCount + 7);

    for (const task of tasks) { // eslint-disable-line
      if (['todo 2', 'todo 3', 'todo 6'].indexOf(task.text) !== -1) {
        await user.post(`/tasks/${task._id}/score/up`); // eslint-disable-line no-await-in-loop
      }
    }

    await user.post('/tasks/clearCompletedTodos');
    const completedTodos = await user.get('/tasks/user?type=completedTodos');
    const todos = await user.get('/tasks/user?type=todos');
    const allTodos = todos.concat(completedTodos);
    // + 7 - 3 completed (but one is from challenge)
    expect(allTodos.length).to.equal(initialTodoCount + 5);
    expect(allTodos[allTodos.length - 1].text).to.equal('todo 6'); // last completed todo
  });
});
