import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /tasks/user/:shortName/score/:direction', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({
      'stats.gp': 100,
    });
  });

  context('all', () => {
    it('requires a task direction', async () => {
      await expect(user.post('/tasks/user/task-short-name/score/tt')).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });
  });

  context('todos', () => {
    let todo;

    beforeEach(async () => {
      todo = await user.post('/tasks/user', {
        text: 'test todo',
        type: 'todo',
        shortName: 'todo-short-name',
      });
    });

    it('completes todo when direction is up', async () => {
      await user.post(`/tasks/user/${todo.shortName}/score/up`);
      let task = await user.get(`/tasks/${todo._id}`);

      expect(task.completed).to.equal(true);
      expect(task.dateCompleted).to.be.a('string'); // date gets converted to a string as json doesn't have a Date type
    });

    it('moves completed todos out of user.tasksOrder.todos', async () => {
      let getUser = await user.get('/user');
      expect(getUser.tasksOrder.todos.indexOf(todo._id)).to.not.equal(-1);

      await user.post(`/tasks/user/${todo.shortName}/score/up`);
      let updatedTask = await user.get(`/tasks/${todo._id}`);
      expect(updatedTask.completed).to.equal(true);

      let updatedUser = await user.get('/user');
      expect(updatedUser.tasksOrder.todos.indexOf(todo._id)).to.equal(-1);
    });

    it('moves un-completed todos back into user.tasksOrder.todos', async () => {
      let getUser = await user.get('/user');
      expect(getUser.tasksOrder.todos.indexOf(todo._id)).to.not.equal(-1);

      await user.post(`/tasks/user/${todo.shortName}/score/up`);
      await user.post(`/tasks/user/${todo.shortName}/score/down`);

      let updatedTask = await user.get(`/tasks/${todo._id}`);
      expect(updatedTask.completed).to.equal(false);

      let updatedUser = await user.get('/user');
      let l = updatedUser.tasksOrder.todos.length;
      expect(updatedUser.tasksOrder.todos.indexOf(todo._id)).not.to.equal(-1);
      expect(updatedUser.tasksOrder.todos.indexOf(todo._id)).to.equal(l - 1); // Check that it was pushed at the bottom
    });

    it('uncompletes todo when direction is down', async () => {
      await user.post(`/tasks/user/${todo.shortName}/score/down`);
      let updatedTask = await user.get(`/tasks/${todo._id}`);

      expect(updatedTask.completed).to.equal(false);
      expect(updatedTask.dateCompleted).to.be.a('undefined');
    });

    it('scores up todo even if it is already completed'); // Yes?

    it('scores down todo even if it is already uncompleted'); // Yes?

    context('user stats when direction is up', () => {
      let updatedUser;

      beforeEach(async () => {
        await user.post(`/tasks/user/${todo.shortName}/score/up`);
        updatedUser = await user.get('/user');
      });

      it('increases user\'s mp', () => {
        expect(updatedUser.stats.mp).to.be.greaterThan(user.stats.mp);
      });

      it('increases user\'s exp', () => {
        expect(updatedUser.stats.exp).to.be.greaterThan(user.stats.exp);
      });

      it('increases user\'s gold', () => {
        expect(updatedUser.stats.gp).to.be.greaterThan(user.stats.gp);
      });
    });

    context('user stats when direction is down', () => {
      let updatedUser;

      beforeEach(async () => {
        await user.post(`/tasks/user/${todo.shortName}/score/down`);
        updatedUser = await user.get('/user');
      });

      it('decreases user\'s mp', () => {
        expect(updatedUser.stats.mp).to.be.lessThan(user.stats.mp);
      });

      it('decreases user\'s exp', () => {
        expect(updatedUser.stats.exp).to.be.lessThan(user.stats.exp);
      });

      it('decreases user\'s gold', () => {
        expect(updatedUser.stats.gp).to.be.lessThan(user.stats.gp);
      });
    });
  });

  context('dailys', () => {
    let daily;

    beforeEach(async () => {
      daily = await user.post('/tasks/user', {
        text: 'test daily',
        type: 'daily',
        shortName: 'daily-short-name',
      });
    });

    it('completes daily when direction is up', async () => {
      await user.post(`/tasks/user/${daily.shortName}/score/up`);
      let task = await user.get(`/tasks/${daily._id}`);

      expect(task.completed).to.equal(true);
    });

    it('uncompletes daily when direction is down', async () => {
      await user.post(`/tasks/user/${daily.shortName}/score/down`);
      let task = await user.get(`/tasks/${daily._id}`);

      expect(task.completed).to.equal(false);
    });

    it('scores up daily even if it is already completed'); // Yes?

    it('scores down daily even if it is already uncompleted'); // Yes?

    context('user stats when direction is up', () => {
      let updatedUser;

      beforeEach(async () => {
        await user.post(`/tasks/user/${daily.shortName}/score/up`);
        updatedUser = await user.get('/user');
      });

      it('increases user\'s mp', () => {
        expect(updatedUser.stats.mp).to.be.greaterThan(user.stats.mp);
      });

      it('increases user\'s exp', () => {
        expect(updatedUser.stats.exp).to.be.greaterThan(user.stats.exp);
      });

      it('increases user\'s gold', () => {
        expect(updatedUser.stats.gp).to.be.greaterThan(user.stats.gp);
      });
    });

    context('user stats when direction is down', () => {
      let updatedUser;

      beforeEach(async () => {
        await user.post(`/tasks/user/${daily.shortName}/score/down`);
        updatedUser = await user.get('/user');
      });

      it('decreases user\'s mp', () => {
        expect(updatedUser.stats.mp).to.be.lessThan(user.stats.mp);
      });

      it('decreases user\'s exp', () => {
        expect(updatedUser.stats.exp).to.be.lessThan(user.stats.exp);
      });

      it('decreases user\'s gold', () => {
        expect(updatedUser.stats.gp).to.be.lessThan(user.stats.gp);
      });
    });
  });

  context('habits', () => {
    let habit, minusHabit, plusHabit, neitherHabit; // eslint-disable-line no-unused-vars

    beforeEach(async () => {
      habit = await user.post('/tasks/user', {
        text: 'test habit',
        type: 'habit',
        shortName: 'habit-short-name',
      });

      minusHabit = await user.post('/tasks/user', {
        text: 'test min habit',
        type: 'habit',
        up: false,
      });

      plusHabit = await user.post('/tasks/user', {
        text: 'test plus habit',
        type: 'habit',
        down: false,
      });

      neitherHabit = await user.post('/tasks/user', {
        text: 'test neither habit',
        type: 'habit',
        up: false,
        down: false,
      });
    });

    it('prevents plus only habit from scoring down'); // Yes?

    it('prevents minus only habit from scoring up'); // Yes?

    it('increases user\'s mp when direction is up', async () => {
      await user.post(`/tasks/user/${habit.shortName}/score/up`);
      let updatedUser = await user.get('/user');

      expect(updatedUser.stats.mp).to.be.greaterThan(user.stats.mp);
    });

    it('decreases user\'s mp when direction is down', async () => {
      await user.post(`/tasks/user/${habit.shortName}/score/down`);
      let updatedUser = await user.get('/user');

      expect(updatedUser.stats.mp).to.be.lessThan(user.stats.mp);
    });

    it('increases user\'s exp when direction is up', async () => {
      await user.post(`/tasks/user/${habit.shortName}/score/up`);
      let updatedUser = await user.get('/user');

      expect(updatedUser.stats.exp).to.be.greaterThan(user.stats.exp);
    });

    it('increases user\'s gold when direction is up', async () => {
      await user.post(`/tasks/user/${habit.shortName}/score/up`);
      let updatedUser = await user.get('/user');

      expect(updatedUser.stats.gp).to.be.greaterThan(user.stats.gp);
    });
  });

  context('reward', () => {
    let reward, updatedUser;

    beforeEach(async () => {
      reward = await user.post('/tasks/user', {
        text: 'test reward',
        type: 'reward',
        value: 5,
        shortName: 'reward-short-name',
      });

      await user.post(`/tasks/user/${reward.shortName}/score/up`);
      updatedUser = await user.get('/user');
    });

    it('purchases reward', () => {
      expect(user.stats.gp).to.equal(updatedUser.stats.gp + 5);
    });

    it('does not change user\'s mp', () => {
      expect(user.stats.mp).to.equal(updatedUser.stats.mp);
    });

    it('does not change user\'s exp', () => {
      expect(user.stats.exp).to.equal(updatedUser.stats.exp);
    });

    it('does not allow a down direction', () => {
      expect(user.stats.mp).to.equal(updatedUser.stats.mp);
    });
  });
});
