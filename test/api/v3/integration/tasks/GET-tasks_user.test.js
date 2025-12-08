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
    const createdTasks = await user.post('/tasks/user', [{ text: 'test habit', type: 'habit' }, { text: 'test todo', type: 'todo' }]);
    const tasks = await user.get('/tasks/user');
    expect(tasks.length).to.equal(createdTasks.length + 1); // Plus one for generated todo
  });

  it('returns only a type of user\'s tasks if req.query.type is specified', async () => {
    const createdTasks = await user.post('/tasks/user', [
      { text: 'test habit', type: 'habit' },
      { text: 'test daily', type: 'daily' },
      { text: 'test reward', type: 'reward' },
      { text: 'test todo', type: 'todo' },
    ]);
    const habits = await user.get('/tasks/user?type=habits');
    const dailys = await user.get('/tasks/user?type=dailys');
    const rewards = await user.get('/tasks/user?type=rewards');

    expect(habits.length).to.be.at.least(1);
    expect(habits[0]._id).to.equal(createdTasks[0]._id);
    expect(dailys.length).to.be.at.least(1);
    expect(dailys[0]._id).to.equal(createdTasks[1]._id);
    expect(rewards.length).to.be.at.least(1);
    expect(rewards[0]._id).to.equal(createdTasks[2]._id);
  });

  it('returns uncompleted todos if req.query.type is "todos"', async () => {
    const existingTodos = await user.get('/tasks/user?type=todos');

    // populate user with other task types
    await user.post('/tasks/user', [
      { text: 'daily', type: 'daily' },
      { text: 'reward', type: 'reward' },
      { text: 'habit', type: 'habit' },
    ]);

    const newUncompletedTodos = await user.post('/tasks/user', [
      { text: 'test todo 1', type: 'todo' },
      { text: 'test todo 2', type: 'todo' },
    ]);
    const todoToBeCompleted = await user.post('/tasks/user', {
      text: 'wll be completed todo', type: 'todo',
    });

    await user.post(`/tasks/${todoToBeCompleted._id}/score/up`);

    const uncompletedTodos = [...existingTodos, ...newUncompletedTodos];

    const todos = await user.get('/tasks/user?type=todos');

    expect(todos.length).to.be.gte(2);
    expect(todos.length).to.eql(uncompletedTodos.length);
    expect(todos.every(task => task.type === 'todo'));
    expect(todos.every(task => task.completed === false));
  });

  it('returns completed todos sorted by reverse completion date if req.query.type is "completedTodos"', async () => {
    const todo1 = await user.post('/tasks/user', { text: 'todo to complete 1', type: 'todo' });
    const todo2 = await user.post('/tasks/user', { text: 'todo to complete 2', type: 'todo' });

    await user.sync();
    const initialTodoCount = user.tasksOrder.todos.length;

    await user.post(`/tasks/${todo2._id}/score/up`);
    await user.post(`/tasks/${todo1._id}/score/up`);
    await user.sync();

    expect(user.tasksOrder.todos.length).to.equal(initialTodoCount - 2);

    const completedTodos = await user.get('/tasks/user?type=completedTodos');
    expect(completedTodos.length).to.equal(2);
    expect(completedTodos[completedTodos.length - 1].text).to.equal('todo to complete 2'); // last is the todo that was completed most recently
  });

  it('returns completed todos sorted by reverse completion date if req.query.type is "_allCompletedTodos"', async () => {
    const todo1 = await user.post('/tasks/user', { text: 'todo to complete 1', type: 'todo' });
    const todo2 = await user.post('/tasks/user', { text: 'todo to complete 2', type: 'todo' });

    await user.sync();
    const initialTodoCount = user.tasksOrder.todos.length;

    await user.post(`/tasks/${todo2._id}/score/up`);
    await user.post(`/tasks/${todo1._id}/score/up`);
    await user.sync();

    expect(user.tasksOrder.todos.length).to.equal(initialTodoCount - 2);

    const allCompletedTodos = await user.get('/tasks/user?type=_allCompletedTodos');
    expect(allCompletedTodos.length).to.equal(2);
    expect(allCompletedTodos[allCompletedTodos.length - 1].text).to.equal('todo to complete 2');
  });

  it('returns dailies with isDue for the date specified', async () => {
    // @TODO Add required format
    const startDate = moment().subtract('1', 'days').toISOString();
    const createdTasks = await user.post('/tasks/user', [
      {
        text: 'test daily',
        type: 'daily',
        startDate,
        frequency: 'daily',
        everyX: 2,
      },
    ]);
    const dailys = await user.get('/tasks/user?type=dailys');

    expect(dailys.length).to.be.at.least(1);
    expect(dailys[0]._id).to.equal(createdTasks._id);
    expect(dailys[0].isDue).to.be.false;

    const dailys2 = await user.get(`/tasks/user?type=dailys&dueDate=${startDate}`);
    expect(dailys2[0]._id).to.equal(createdTasks._id);
    expect(dailys2[0].isDue).to.be.true;
  });

  xit('returns dailies with isDue for the date specified and will add CDS offset if time is not supplied and assumes timezones', async () => {
    const timezoneOffset = 420;
    await user.updateOne({
      'preferences.dayStart': 0,
      'preferences.timezoneOffset': timezoneOffset,
    });
    const startDate = moment().utcOffset(-timezoneOffset).subtract('4', 'days').startOf('day')
      .toISOString();
    await user.post('/tasks/user', [
      {
        text: 'test daily',
        type: 'daily',
        startDate,
        frequency: 'daily',
        everyX: 2,
      },
    ]);

    const today = moment().format('YYYY-MM-DD');
    const dailys = await user.get(`/tasks/user?type=dailys&dueDate=${today}`);
    expect(dailys[0].isDue).to.be.true;

    const yesterday = moment().subtract('1', 'days').format('YYYY-MM-DD');
    const dailys2 = await user.get(`/tasks/user?type=dailys&dueDate=${yesterday}`);
    expect(dailys2[0].isDue).to.be.false;
  });

  xit('returns dailies with isDue for the date specified and will add CDS offset if time is not supplied and assumes timezones', async () => {
    const timezoneOffset = 240;
    await user.updateOne({
      'preferences.dayStart': 0,
      'preferences.timezoneOffset': timezoneOffset,
    });
    const startDate = moment().utcOffset(-timezoneOffset).subtract('4', 'days').startOf('day')
      .toISOString();
    await user.post('/tasks/user', [
      {
        text: 'test daily',
        type: 'daily',
        startDate,
        frequency: 'daily',
        everyX: 2,
      },
    ]);

    const today = moment().format('YYYY-MM-DD');
    const dailys = await user.get(`/tasks/user?type=dailys&dueDate=${today}`);
    expect(dailys[0].isDue).to.be.true;

    const yesterday = moment().subtract('1', 'days').format('YYYY-MM-DD');
    const dailys2 = await user.get(`/tasks/user?type=dailys&dueDate=${yesterday}`);
    expect(dailys2[0].isDue).to.be.false;
  });

  xit('returns dailies with isDue for the date specified and will add CDS offset if time is not supplied and assumes timezones', async () => {
    const timezoneOffset = 540;
    await user.updateOne({
      'preferences.dayStart': 0,
      'preferences.timezoneOffset': timezoneOffset,
    });
    const startDate = moment().utcOffset(-timezoneOffset).subtract('4', 'days').startOf('day')
      .toISOString();
    await user.post('/tasks/user', [
      {
        text: 'test daily',
        type: 'daily',
        startDate,
        frequency: 'daily',
        everyX: 2,
      },
    ]);

    const today = moment().format('YYYY-MM-DD');
    const dailys = await user.get(`/tasks/user?type=dailys&dueDate=${today}`);
    expect(dailys[0].isDue).to.be.true;

    const yesterday = moment().subtract('1', 'days').format('YYYY-MM-DD');
    const dailys2 = await user.get(`/tasks/user?type=dailys&dueDate=${yesterday}`);
    expect(dailys2[0].isDue).to.be.false;
  });

  context('scheduledFilter parameter', () => {
    it('returns only today\'s todos when scheduledFilter=today', async () => {
      const today = moment().startOf('day').toDate();
      const tomorrow = moment().startOf('day').add(1, 'days').toDate();
      const nextWeek = moment().startOf('day').add(8, 'days').toDate();

      await user.post('/tasks/user', [
        { text: 'todo due today', type: 'todo', date: today },
        { text: 'todo due tomorrow', type: 'todo', date: tomorrow },
        { text: 'todo due next week', type: 'todo', date: nextWeek },
        { text: 'todo with no date', type: 'todo' },
      ]);

      const todos = await user.get('/tasks/user?type=todos&scheduledFilter=today');
      const todayTodos = todos.filter(t => t.text.includes('todo due'));
      
      expect(todayTodos.length).to.equal(1);
      expect(todayTodos[0].text).to.equal('todo due today');
    });

    it('returns this week\'s todos when scheduledFilter=week', async () => {
      const today = moment().startOf('day').toDate();
      const inThreeDays = moment().startOf('day').add(3, 'days').toDate();
      const nextWeek = moment().startOf('day').add(8, 'days').toDate();

      await user.post('/tasks/user', [
        { text: 'todo due today', type: 'todo', date: today },
        { text: 'todo due in 3 days', type: 'todo', date: inThreeDays },
        { text: 'todo due next week', type: 'todo', date: nextWeek },
        { text: 'todo with no date', type: 'todo' },
      ]);

      const todos = await user.get('/tasks/user?type=todos&scheduledFilter=week');
      const weekTodos = todos.filter(t => t.text.includes('todo due'));
      
      expect(weekTodos.length).to.equal(2);
      expect(weekTodos.some(t => t.text === 'todo due today')).to.be.true;
      expect(weekTodos.some(t => t.text === 'todo due in 3 days')).to.be.true;
    });

    it('returns this month\'s todos when scheduledFilter=month', async () => {
      const today = moment().startOf('day').toDate();
      const inTwoWeeks = moment().startOf('day').add(14, 'days').toDate();
      const nextMonth = moment().startOf('day').add(35, 'days').toDate();

      await user.post('/tasks/user', [
        { text: 'todo due today', type: 'todo', date: today },
        { text: 'todo due in 2 weeks', type: 'todo', date: inTwoWeeks },
        { text: 'todo due next month', type: 'todo', date: nextMonth },
        { text: 'todo with no date', type: 'todo' },
      ]);

      const todos = await user.get('/tasks/user?type=todos&scheduledFilter=month');
      const monthTodos = todos.filter(t => t.text.includes('todo due'));
      
      expect(monthTodos.length).to.equal(2);
      expect(monthTodos.some(t => t.text === 'todo due today')).to.be.true;
      expect(monthTodos.some(t => t.text === 'todo due in 2 weeks')).to.be.true;
    });

    it('returns all dated todos when scheduledFilter=all', async () => {
      const today = moment().startOf('day').toDate();
      const nextWeek = moment().startOf('day').add(8, 'days').toDate();
      const nextMonth = moment().startOf('day').add(35, 'days').toDate();

      await user.post('/tasks/user', [
        { text: 'todo due today', type: 'todo', date: today },
        { text: 'todo due next week', type: 'todo', date: nextWeek },
        { text: 'todo due next month', type: 'todo', date: nextMonth },
        { text: 'todo with no date', type: 'todo' },
      ]);

      const todos = await user.get('/tasks/user?type=todos&scheduledFilter=all');
      const allDatedTodos = todos.filter(t => t.text.includes('todo due'));
      
      expect(allDatedTodos.length).to.equal(3);
    });

    it('excludes todos with no date regardless of filter', async () => {
      const today = moment().startOf('day').toDate();

      await user.post('/tasks/user', [
        { text: 'todo due today', type: 'todo', date: today },
        { text: 'todo with no date 1', type: 'todo' },
        { text: 'todo with no date 2', type: 'todo' },
      ]);

      const todayTodos = await user.get('/tasks/user?type=todos&scheduledFilter=today');
      const weekTodos = await user.get('/tasks/user?type=todos&scheduledFilter=week');
      const monthTodos = await user.get('/tasks/user?type=todos&scheduledFilter=month');
      const allTodos = await user.get('/tasks/user?type=todos&scheduledFilter=all');

      const hasUndatedTodo = list => list.some(t => t.text.includes('no date'));
      
      expect(hasUndatedTodo(todayTodos)).to.be.false;
      expect(hasUndatedTodo(weekTodos)).to.be.false;
      expect(hasUndatedTodo(monthTodos)).to.be.false;
      expect(hasUndatedTodo(allTodos)).to.be.false;
    });
  });
});
