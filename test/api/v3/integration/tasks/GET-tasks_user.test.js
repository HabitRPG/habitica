import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('GET /tasks/user', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns all user\'s tasks', async () => {
    let createdTasks = await user.post('/tasks/user', [{text: 'test habit', type: 'habit'}, {text: 'test todo', type: 'todo'}]);
    let tasks = await user.get('/tasks/user');
    expect(tasks.length).to.equal(createdTasks.length + 1); // + 1 because 1 is a default task
  });

  it('returns only a type of user\'s tasks if req.query.type is specified', async () => {
    let createdTasks = await user.post('/tasks/user', [{text: 'test habit', type: 'habit'}, {text: 'test todo', type: 'todo'}]);
    let tasks = await user.get('/tasks/user?type=habits');
    expect(tasks.length).to.equal(1);
    expect(tasks[0]._id).to.equal(createdTasks[0]._id);
  });

  it('returns completed todos sorted by reverse completion date if req.query.type === "completeTodos"', async () => {
    let todo1 = await user.post('/tasks/user', {text: 'todo to complete 1', type: 'todo'});
    let todo2 = await user.post('/tasks/user', {text: 'todo to complete 2', type: 'todo'});

    await user.sync();
    let initialTodoCount = user.tasksOrder.todos.length;

    await user.post(`/tasks/${todo2._id}/score/up`);
    await user.post(`/tasks/${todo1._id}/score/up`);
    await user.sync();

    expect(user.tasksOrder.todos.length).to.equal(initialTodoCount - 2);

    let completedTodos = await user.get('/tasks/user?type=completedTodos');
    expect(completedTodos.length).to.equal(2);
    expect(completedTodos[completedTodos.length - 1].text).to.equal('todo to complete 2'); // last is the todo that was completed most recently
  });
});
