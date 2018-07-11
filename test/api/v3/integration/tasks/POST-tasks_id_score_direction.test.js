import {
  generateUser,
  sleep,
  translate as t,
  server,
} from '../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('POST /tasks/:id/score/:direction', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({
      'stats.gp': 100,
    });
  });

  context('all', () => {
    it('can use an id to identify the task', async () => {
      let todo = await user.post('/tasks/user', {
        text: 'test todo',
        type: 'todo',
        alias: 'alias',
      });

      let res = await user.post(`/tasks/${todo._id}/score/up`);

      expect(res).to.be.ok;
    });

    it('can use a alias in place of the id', async () => {
      let todo = await user.post('/tasks/user', {
        text: 'test todo',
        type: 'todo',
        alias: 'alias',
      });

      let res = await user.post(`/tasks/${todo.alias}/score/up`);

      expect(res).to.be.ok;
    });

    it('requires a task direction', async () => {
      await expect(user.post(`/tasks/${generateUUID()}/score/tt`)).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('sends task scored webhooks', async () => {
      let uuid = generateUUID();
      await server.start();

      await user.post('/user/webhook', {
        url: `http://localhost:${server.port}/webhooks/${uuid}`,
        type: 'taskActivity',
        enabled: true,
        options: {
          created: false,
          scored: true,
        },
      });

      let task = await user.post('/tasks/user', {
        text: 'test habit',
        type: 'habit',
      });

      await user.post(`/tasks/${task.id}/score/up`);

      await sleep();

      await server.close();

      let body = server.getWebhookData(uuid);

      expect(body.user).to.have.all.keys('_id', '_tmp', 'stats');
      expect(body.user.stats).to.have.all.keys('hp', 'mp', 'exp', 'gp', 'lvl', 'class', 'points', 'str', 'con', 'int', 'per', 'buffs', 'training', 'maxHealth', 'maxMP', 'toNextLevel');
      expect(body.task.id).to.eql(task.id);
      expect(body.direction).to.eql('up');
      expect(body.delta).to.be.greaterThan(0);
    });

    context('sending user activity webhooks', () => {
      before(async () => {
        await server.start();
      });

      after(async () => {
        await server.close();
      });

      it('sends user activity webhook when the user levels up', async () => {
        let uuid = generateUUID();

        await user.post('/user/webhook', {
          url: `http://localhost:${server.port}/webhooks/${uuid}`,
          type: 'userActivity',
          enabled: true,
          options: {
            leveledUp: true,
          },
        });

        const initialLvl = user.stats.lvl;

        await user.update({
          'stats.exp': 3000,
        });
        let task = await user.post('/tasks/user', {
          text: 'test habit',
          type: 'habit',
        });

        await user.post(`/tasks/${task.id}/score/up`);
        await user.sync();
        await sleep();

        let body = server.getWebhookData(uuid);

        expect(body.type).to.eql('leveledUp');
        expect(body.initialLvl).to.eql(initialLvl);
        expect(body.finalLvl).to.eql(user.stats.lvl);
      });
    });
  });

  context('todos', () => {
    let todo;

    beforeEach(async () => {
      todo = await user.post('/tasks/user', {
        text: 'test todo',
        type: 'todo',
      });
    });

    it('completes todo when direction is up', async () => {
      await user.post(`/tasks/${todo._id}/score/up`);
      let task = await user.get(`/tasks/${todo._id}`);

      expect(task.completed).to.equal(true);
      expect(task.dateCompleted).to.be.a('string'); // date gets converted to a string as json doesn't have a Date type
    });

    it('moves completed todos out of user.tasksOrder.todos', async () => {
      let getUser = await user.get('/user');
      expect(getUser.tasksOrder.todos.indexOf(todo._id)).to.not.equal(-1);

      await user.post(`/tasks/${todo._id}/score/up`);
      let updatedTask = await user.get(`/tasks/${todo._id}`);
      expect(updatedTask.completed).to.equal(true);

      let updatedUser = await user.get('/user');
      expect(updatedUser.tasksOrder.todos.indexOf(todo._id)).to.equal(-1);
    });

    it('moves un-completed todos back into user.tasksOrder.todos', async () => {
      let getUser = await user.get('/user');
      expect(getUser.tasksOrder.todos.indexOf(todo._id)).to.not.equal(-1);

      await user.post(`/tasks/${todo._id}/score/up`);
      await user.post(`/tasks/${todo._id}/score/down`);

      let updatedTask = await user.get(`/tasks/${todo._id}`);
      expect(updatedTask.completed).to.equal(false);

      let updatedUser = await user.get('/user');
      let l = updatedUser.tasksOrder.todos.length;
      expect(updatedUser.tasksOrder.todos.indexOf(todo._id)).not.to.equal(-1);
      expect(updatedUser.tasksOrder.todos.indexOf(todo._id)).to.equal(l - 1); // Check that it was pushed at the bottom
    });

    it('uncompletes todo when direction is down', async () => {
      await user.post(`/tasks/${todo._id}/score/up`);
      await user.post(`/tasks/${todo._id}/score/down`);
      let updatedTask = await user.get(`/tasks/${todo._id}`);

      expect(updatedTask.completed).to.equal(false);
      expect(updatedTask.dateCompleted).to.be.a('undefined');
    });

    it('doesn\'t let a todo be completed twice', async () => {
      await user.post(`/tasks/${todo._id}/score/up`);
      await expect(user.post(`/tasks/${todo._id}/score/up`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('sessionOutdated'),
        });
    });

    it('doesn\'t let a todo be uncompleted twice', async () => {
      await expect(user.post(`/tasks/${todo._id}/score/down`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('sessionOutdated'),
      });
    });

    context('user stats when direction is up', () => {
      let updatedUser;

      beforeEach(async () => {
        await user.post(`/tasks/${todo._id}/score/up`);
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
      let updatedUser, initialUser;

      beforeEach(async () => {
        await user.post(`/tasks/${todo._id}/score/up`);
        initialUser = await user.get('/user');
        await user.post(`/tasks/${todo._id}/score/down`);
        updatedUser = await user.get('/user');
      });

      it('decreases user\'s mp', () => {
        expect(updatedUser.stats.mp).to.be.lessThan(initialUser.stats.mp);
      });

      it('decreases user\'s exp', () => {
        expect(updatedUser.stats.exp).to.be.lessThan(initialUser.stats.exp);
      });

      it('decreases user\'s gold', () => {
        expect(updatedUser.stats.gp).to.be.lessThan(initialUser.stats.gp);
      });
    });
  });

  context('dailys', () => {
    let daily;

    beforeEach(async () => {
      daily = await user.post('/tasks/user', {
        text: 'test daily',
        type: 'daily',
      });
    });

    it('completes daily when direction is up', async () => {
      await user.post(`/tasks/${daily._id}/score/up`);
      let task = await user.get(`/tasks/${daily._id}`);

      expect(task.completed).to.equal(true);
    });

    it('uncompletes daily when direction is down', async () => {
      await user.post(`/tasks/${daily._id}/score/up`);
      await user.post(`/tasks/${daily._id}/score/down`);
      let task = await user.get(`/tasks/${daily._id}`);

      expect(task.completed).to.equal(false);
    });

    it('computes isDue', async () => {
      await user.post(`/tasks/${daily._id}/score/up`);
      let task = await user.get(`/tasks/${daily._id}`);

      expect(task.isDue).to.equal(true);
    });

    it('computes nextDue', async () => {
      await user.post(`/tasks/${daily._id}/score/up`);
      let task = await user.get(`/tasks/${daily._id}`);

      expect(task.nextDue.length).to.eql(6);
    });

    it('doesn\'t let a daily be completed twice', async () => {
      await user.post(`/tasks/${daily._id}/score/up`);
      await expect(user.post(`/tasks/${daily._id}/score/up`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('sessionOutdated'),
      });
    });

    it('doesn\'t let a daily be uncompleted twice', async () => {
      await expect(user.post(`/tasks/${daily._id}/score/down`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('sessionOutdated'),
      });
    });

    context('user stats when direction is up', () => {
      let updatedUser;

      beforeEach(async () => {
        await user.post(`/tasks/${daily._id}/score/up`);
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
      let updatedUser, initialUser;

      beforeEach(async () => {
        await user.post(`/tasks/${daily._id}/score/up`);
        initialUser = await user.get('/user');
        await user.post(`/tasks/${daily._id}/score/down`);
        updatedUser = await user.get('/user');
      });

      it('decreases user\'s mp', () => {
        expect(updatedUser.stats.mp).to.be.lessThan(initialUser.stats.mp);
      });

      it('decreases user\'s exp', () => {
        expect(updatedUser.stats.exp).to.be.lessThan(initialUser.stats.exp);
      });

      it('decreases user\'s gold', () => {
        expect(updatedUser.stats.gp).to.be.lessThan(initialUser.stats.gp);
      });
    });
  });

  context('habits', () => {
    let habit, minusHabit, plusHabit, neitherHabit; // eslint-disable-line no-unused-vars

    beforeEach(async () => {
      habit = await user.post('/tasks/user', {
        text: 'test habit',
        type: 'habit',
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
      await user.post(`/tasks/${habit._id}/score/up`);
      let updatedUser = await user.get('/user');

      expect(updatedUser.stats.mp).to.be.greaterThan(user.stats.mp);
    });

    it('decreases user\'s mp when direction is down', async () => {
      await user.post(`/tasks/${habit._id}/score/down`);
      let updatedUser = await user.get('/user');

      expect(updatedUser.stats.mp).to.be.lessThan(user.stats.mp);
    });

    it('increases user\'s exp when direction is up', async () => {
      await user.post(`/tasks/${habit._id}/score/up`);
      let updatedUser = await user.get('/user');

      expect(updatedUser.stats.exp).to.be.greaterThan(user.stats.exp);
    });

    it('increases user\'s gold when direction is up', async () => {
      await user.post(`/tasks/${habit._id}/score/up`);
      let updatedUser = await user.get('/user');

      expect(updatedUser.stats.gp).to.be.greaterThan(user.stats.gp);
    });

    // not supported anymore
    it('does not add score notes to task', async () => {
      let scoreNotesString = 'test-notes';

      await user.post(`/tasks/${habit._id}/score/up`, {
        scoreNotes: scoreNotesString,
      });
      let updatedTask = await user.get(`/tasks/${habit._id}`);

      expect(updatedTask.history[0].scoreNotes).to.eql(undefined);
    });

    it('records only one history entry per day', async () => {
      const initialHistoryLength = habit.history.length;

      await user.post(`/tasks/${habit._id}/score/up`);
      await user.post(`/tasks/${habit._id}/score/up`);
      await user.post(`/tasks/${habit._id}/score/down`);
      await user.post(`/tasks/${habit._id}/score/up`);

      const updatedTask = await user.get(`/tasks/${habit._id}`);

      expect(updatedTask.history.length).to.eql(initialHistoryLength + 1);

      const lastHistoryEntry = updatedTask.history[updatedTask.history.length - 1];
      expect(lastHistoryEntry.scoredUp).to.equal(3);
      expect(lastHistoryEntry.scoredDown).to.equal(1);
    });
  });

  context('reward', () => {
    let reward, updatedUser;

    beforeEach(async () => {
      reward = await user.post('/tasks/user', {
        text: 'test reward',
        type: 'reward',
        value: 5,
      });

      await user.post(`/tasks/${reward._id}/score/up`);
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
