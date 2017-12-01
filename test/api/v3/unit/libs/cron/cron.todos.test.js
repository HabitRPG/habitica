import * as Tasks from '../../../../../../website/server/models/task';
import { cron } from '../../../../../../website/server/libs/cron';
import analytics from '../../../../../../website/server/libs/analyticsService';
import { model as User } from '../../../../../../website/server/models/user';

describe('todos', () => {
  let user;
  let tasksByType = {habits: [], dailys: [], todos: [], rewards: []};
  let daysMissed = 0;

  beforeEach(() => {
    user = new User({
      auth: {
        local: {
          username: 'username',
          lowerCaseUsername: 'username',
          email: 'email@email.email',
          salt: 'salt',
          hashed_password: 'hashed_password', // eslint-disable-line camelcase
        },
      },
    });

    user._statsComputed = {
      mp: 10,
    };

    let todo = {
      text: 'test todo',
      type: 'todo',
      value: 0,
    };

    let task = new Tasks.todo(Tasks.Task.sanitize(todo)); // eslint-disable-line new-cap
    tasksByType.todos.push(task);
  });

  it('should make uncompleted todos redder', () => {
    let valueBefore = tasksByType.todos[0].value;
    cron({user, tasksByType, daysMissed, analytics});
    expect(tasksByType.todos[0].value).to.be.lessThan(valueBefore);
  });

  it('should make uncompleted todos redder when sleeping', () => {
    user.preferences.sleep = true;
    let valueBefore = tasksByType.todos[0].value;
    cron({user, tasksByType, daysMissed, analytics});
    expect(tasksByType.todos[0].value).to.be.lessThan(valueBefore);
  });

  it('should add history of completed todos to user history', () => {
    tasksByType.todos[0].completed = true;

    cron({user, tasksByType, daysMissed, analytics});

    expect(user.history.todos).to.be.lengthOf(1);
  });

  it('should remove completed todos from users taskOrder list', () => {
    tasksByType.todos = [];
    user.tasksOrder.todos = [];
    let todo = {
      text: 'test todo',
      type: 'todo',
      value: 0,
    };

    let task = new Tasks.todo(Tasks.Task.sanitize(todo)); // eslint-disable-line new-cap
    tasksByType.todos.push(task);
    task = new Tasks.todo(Tasks.Task.sanitize(todo)); // eslint-disable-line new-cap
    tasksByType.todos.push(task);
    tasksByType.todos[0].completed = true;

    user.tasksOrder.todos = tasksByType.todos.map(taskTodo => {
      return taskTodo._id;
    });
    // Since ideally tasksByType should not contain completed todos, fake ids should be filtered too
    user.tasksOrder.todos.push('00000000-0000-0000-0000-000000000000');

    expect(tasksByType.todos).to.be.lengthOf(2);
    expect(user.tasksOrder.todos).to.be.lengthOf(3);

    cron({user, tasksByType, daysMissed, analytics});

    // user.tasksOrder.todos should be filtered while tasks by type remains unchanged
    expect(tasksByType.todos).to.be.lengthOf(2);
    expect(user.tasksOrder.todos).to.be.lengthOf(1);
  });

  it('should preserve todos order in task list', () => {
    tasksByType.todos = [];
    user.tasksOrder.todos = [];
    let todo = {
      text: 'test todo',
      type: 'todo',
      value: 0,
    };

    let task = new Tasks.todo(Tasks.Task.sanitize(todo)); // eslint-disable-line new-cap
    tasksByType.todos.push(task);
    task = new Tasks.todo(Tasks.Task.sanitize(todo)); // eslint-disable-line new-cap
    tasksByType.todos.push(task);
    task = new Tasks.todo(Tasks.Task.sanitize(todo)); // eslint-disable-line new-cap
    tasksByType.todos.push(task);

    // Set up user.tasksOrder list in a specific order
    user.tasksOrder.todos = tasksByType.todos.map(todoTask => {
      return todoTask._id;
    }).reverse();
    let original = user.tasksOrder.todos; // Preserve the original order

    cron({user, tasksByType, daysMissed, analytics});

    let listsAreEqual = true;
    user.tasksOrder.todos.forEach((taskId, index) => {
      if (original[index]._id !== taskId) {
        listsAreEqual = false;
      }
    });

    expect(listsAreEqual);
    expect(user.tasksOrder.todos).to.be.lengthOf(original.length);
  });
});
