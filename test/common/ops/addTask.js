import addTask from '../../../website/common/script/ops/addTask';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.ops.addTask', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
    user.habits = [];
    user.todos = [];
    user.dailys = [];
    user.rewards = [];
  });

  it('adds an habit', () => {
    let habit = addTask(user, {
      body: {
        type: 'habit',
        text: 'habit',
        down: false,
      },
    });

    expect(user.tasksOrder.habits).to.eql([
      habit._id,
    ]);
    expect(habit._id).to.be.a('string');
    expect(habit.text).to.equal('habit');
    expect(habit.type).to.equal('habit');
    expect(habit.up).to.equal(true);
    expect(habit.down).to.equal(false);
    expect(habit.history).to.eql([]);
    expect(habit.checklist).to.not.exist;
  });

  it('adds an habtit when type is invalid', () => {
    let habit = addTask(user, {
      body: {
        type: 'invalid',
        text: 'habit',
        down: false,
      },
    });

    expect(user.tasksOrder.habits).to.eql([
      habit._id,
    ]);
    expect(habit._id).to.be.a('string');
    expect(habit.text).to.equal('habit');
    expect(habit.type).to.equal('habit');
    expect(habit.up).to.equal(true);
    expect(habit.down).to.equal(false);
    expect(habit.history).to.eql([]);
    expect(habit.checklist).to.not.exist;
  });

  it('adds a daily', () => {
    let daily = addTask(user, {
      body: {
        type: 'daily',
        text: 'daily',
      },
    });

    expect(user.tasksOrder.dailys).to.eql([
      daily._id,
    ]);
    expect(daily._id).to.be.a('string');
    expect(daily.type).to.equal('daily');
    expect(daily.text).to.equal('daily');
    expect(daily.history).to.eql([]);
    expect(daily.checklist).to.eql([]);
    expect(daily.completed).to.be.false;
    expect(daily.up).to.not.exist;
  });

  it('adds a todo', () => {
    let todo = addTask(user, {
      body: {
        type: 'todo',
        text: 'todo',
      },
    });

    expect(user.tasksOrder.todos).to.eql([
      todo._id,
    ]);
    expect(todo._id).to.be.a('string');
    expect(todo.type).to.equal('todo');
    expect(todo.text).to.equal('todo');
    expect(todo.checklist).to.eql([]);
    expect(todo.completed).to.be.false;
    expect(todo.up).to.not.exist;
  });

  it('adds a reward', () => {
    let reward = addTask(user, {
      body: {
        type: 'reward',
        text: 'reward',
      },
    });

    expect(user.tasksOrder.rewards).to.eql([
      reward._id,
    ]);
    expect(reward._id).to.be.a('string');
    expect(reward.type).to.equal('reward');
    expect(reward.text).to.equal('reward');
    expect(reward.value).to.equal(10);
    expect(reward.up).to.not.exist;
  });

  context('user preferences', () => {
    it('respects newTaskEdit preference', () => {
      user.preferences.newTaskEdit = true;
      expect(addTask(user)._editing).to.be.ok;
      expect(addTask(user)._edit).to.be.ok;

      user.preferences.newTaskEdit = false;
      expect(addTask(user)._editing).not.be.ok;
      expect(addTask(user)._edit).to.not.be.ok;
    });

    it('respects tagsCollapsed preference', () => {
      user.preferences.tagsCollapsed = true;
      expect(addTask(user)._tags).to.not.be.ok;

      user.preferences.tagsCollapsed = false;
      expect(addTask(user)._tags).to.be.ok;
    });

    it('respects advancedCollapsed preference', () => {
      user.preferences.advancedCollapsed = true;
      expect(addTask(user)._advanced).not.be.ok;

      user.preferences.advancedCollapsed = false;
      expect(addTask(user)._advanced).to.be.ok;
    });
  });
});
