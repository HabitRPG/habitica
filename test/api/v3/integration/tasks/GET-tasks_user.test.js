import moment from 'moment';
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
    expect(tasks.length).to.equal(createdTasks.length + 1); // Plus one for generated todo
  });

  it('returns only a type of user\'s tasks if req.query.type is specified', async () => {
    let createdTasks = await user.post('/tasks/user', [
      {text: 'test habit', type: 'habit'},
      {text: 'test daily', type: 'daily'},
      {text: 'test reward', type: 'reward'},
      {text: 'test todo', type: 'todo'},
    ]);
    let habits = await user.get('/tasks/user?type=habits');
    let dailys = await user.get('/tasks/user?type=dailys');
    let rewards = await user.get('/tasks/user?type=rewards');

    expect(habits.length).to.be.at.least(1);
    expect(habits[0]._id).to.equal(createdTasks[0]._id);
    expect(dailys.length).to.be.at.least(1);
    expect(dailys[0]._id).to.equal(createdTasks[1]._id);
    expect(rewards.length).to.be.at.least(1);
    expect(rewards[0]._id).to.equal(createdTasks[2]._id);
  });

  it('returns uncompleted todos if req.query.type is "todos"', async () => {
    let existingTodos = await user.get('/tasks/user?type=todos');

    // populate user with other task types
    await user.post('/tasks/user', [
      {text: 'daily', type: 'daily'},
      {text: 'reward', type: 'reward'},
      {text: 'habit', type: 'habit'},
    ]);

    let newUncompletedTodos = await user.post('/tasks/user', [
      {text: 'test todo 1', type: 'todo'},
      {text: 'test todo 2', type: 'todo'},
    ]);
    let todoToBeCompleted = await user.post('/tasks/user', {
      text: 'wll be completed todo', type: 'todo',
    });

    await user.post(`/tasks/${todoToBeCompleted._id}/score/up`);

    let uncompletedTodos = [...existingTodos, ...newUncompletedTodos];

    let todos = await user.get('/tasks/user?type=todos');

    expect(todos.length).to.be.gte(2);
    expect(todos.length).to.eql(uncompletedTodos.length);
    expect(todos.every(task => task.type === 'todo'));
    expect(todos.every(task => task.completed === false));
  });

  it('returns completed todos sorted by reverse completion date if req.query.type is "completedTodos"', async () => {
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

  it('returns completed todos sorted by reverse completion date if req.query.type is "_allCompletedTodos"', async () => {
    let todo1 = await user.post('/tasks/user', {text: 'todo to complete 1', type: 'todo'});
    let todo2 = await user.post('/tasks/user', {text: 'todo to complete 2', type: 'todo'});

    await user.sync();
    let initialTodoCount = user.tasksOrder.todos.length;

    await user.post(`/tasks/${todo2._id}/score/up`);
    await user.post(`/tasks/${todo1._id}/score/up`);
    await user.sync();

    expect(user.tasksOrder.todos.length).to.equal(initialTodoCount - 2);

    let allCompletedTodos = await user.get('/tasks/user?type=_allCompletedTodos');
    expect(allCompletedTodos.length).to.equal(2);
    expect(allCompletedTodos[allCompletedTodos.length - 1].text).to.equal('todo to complete 2');
  });

  it('returns only some completed todos if req.query.type is "completedTodos" or "_allCompletedTodos"', async () => {
    const LIMIT = 30;
    let numberOfTodos = LIMIT + 1;
    let todosInput = [];

    for (let i = 0; i < numberOfTodos; i++) {
      todosInput[i] = {text: 'todo to complete ${i}', type: 'todo'};
    }
    let todos = await user.post('/tasks/user', todosInput);
    await user.sync();
    let initialTodoCount = user.tasksOrder.todos.length;

    for (let i = 0; i < numberOfTodos; i++) {
      let id = todos[i]._id;

      await user.post(`/tasks/${id}/score/up`); // eslint-disable-line no-await-in-loop
    }
    await user.sync();

    expect(user.tasksOrder.todos.length).to.equal(initialTodoCount - numberOfTodos);

    let completedTodos = await user.get('/tasks/user?type=completedTodos');
    expect(completedTodos.length).to.equal(LIMIT);

    let allCompletedTodos = await user.get('/tasks/user?type=_allCompletedTodos');
    expect(allCompletedTodos.length).to.equal(numberOfTodos);
  });

  it('returns dailies with isDue for the date specified', async () => {
    // @TODO Add required format
    let startDate = moment().subtract('1', 'days').toISOString();
    let createdTasks = await user.post('/tasks/user', [
      {
        text: 'test daily',
        type: 'daily',
        startDate,
        frequency: 'daily',
        everyX: 2,
      },
    ]);
    let dailys = await user.get('/tasks/user?type=dailys');

    expect(dailys.length).to.be.at.least(1);
    expect(dailys[0]._id).to.equal(createdTasks._id);
    expect(dailys[0].isDue).to.be.false;

    let dailys2 = await user.get(`/tasks/user?type=dailys&dueDate=${startDate}`);
    expect(dailys2[0]._id).to.equal(createdTasks._id);
    expect(dailys2[0].isDue).to.be.true;
  });

  xit('returns dailies with isDue for the date specified and will add CDS offset if time is not supplied and assumes timezones', async () => {
    let timezone = 420;
    await user.update({
      'preferences.dayStart': 0,
      'preferences.timezoneOffset': timezone,
    });
    let startDate = moment().zone(timezone).subtract('4', 'days').startOf('day').toISOString();
    await user.post('/tasks/user', [
      {
        text: 'test daily',
        type: 'daily',
        startDate,
        frequency: 'daily',
        everyX: 2,
      },
    ]);

    let today = moment().format('YYYY-MM-DD');
    let dailys = await user.get(`/tasks/user?type=dailys&dueDate=${today}`);
    expect(dailys[0].isDue).to.be.true;

    let yesterday = moment().subtract('1', 'days').format('YYYY-MM-DD');
    let dailys2 = await user.get(`/tasks/user?type=dailys&dueDate=${yesterday}`);
    expect(dailys2[0].isDue).to.be.false;
  });


  xit('returns dailies with isDue for the date specified and will add CDS offset if time is not supplied and assumes timezones', async () => {
    let timezone = 240;
    await user.update({
      'preferences.dayStart': 0,
      'preferences.timezoneOffset': timezone,
    });
    let startDate = moment().zone(timezone).subtract('4', 'days').startOf('day').toISOString();
    await user.post('/tasks/user', [
      {
        text: 'test daily',
        type: 'daily',
        startDate,
        frequency: 'daily',
        everyX: 2,
      },
    ]);

    let today = moment().format('YYYY-MM-DD');
    let dailys = await user.get(`/tasks/user?type=dailys&dueDate=${today}`);
    expect(dailys[0].isDue).to.be.true;

    let yesterday = moment().subtract('1', 'days').format('YYYY-MM-DD');
    let dailys2 = await user.get(`/tasks/user?type=dailys&dueDate=${yesterday}`);
    expect(dailys2[0].isDue).to.be.false;
  });

  xit('returns dailies with isDue for the date specified and will add CDS offset if time is not supplied and assumes timezones', async () => {
    let timezone = 540;
    await user.update({
      'preferences.dayStart': 0,
      'preferences.timezoneOffset': timezone,
    });
    let startDate = moment().zone(timezone).subtract('4', 'days').startOf('day').toISOString();
    await user.post('/tasks/user', [
      {
        text: 'test daily',
        type: 'daily',
        startDate,
        frequency: 'daily',
        everyX: 2,
      },
    ]);

    let today = moment().format('YYYY-MM-DD');
    let dailys = await user.get(`/tasks/user?type=dailys&dueDate=${today}`);
    expect(dailys[0].isDue).to.be.true;

    let yesterday = moment().subtract('1', 'days').format('YYYY-MM-DD');
    let dailys2 = await user.get(`/tasks/user?type=dailys&dueDate=${yesterday}`);
    expect(dailys2[0].isDue).to.be.false;
  });
});
