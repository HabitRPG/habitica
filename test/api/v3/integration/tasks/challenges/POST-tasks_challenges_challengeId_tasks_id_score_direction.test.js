import { find } from 'lodash';
import {
  generateUser,
  generateGroup,
  generateChallenge,
  sleep,
} from '../../../../../helpers/api-integration/v3';

describe('POST /tasks/:id/score/:direction', () => {
  let user;
  let guild;
  let challenge;

  before(async () => {
    user = await generateUser();
    guild = await generateGroup(user);
    challenge = await generateChallenge(user, guild);
    await user.post(`/challenges/${challenge._id}/join`);
  });

  context('habits', () => {
    let habit;
    let usersChallengeTaskId;
    let previousTaskHistory;

    before(async () => {
      habit = await user.post(`/tasks/challenge/${challenge._id}`, {
        text: 'test habit',
        type: 'habit',
      });
      await sleep(1);
      const updatedUser = await user.get('/user');
      usersChallengeTaskId = updatedUser.tasksOrder.habits[0]; // eslint-disable-line prefer-destructuring, max-len
    });

    it('scores and adds history', async () => {
      await user.post(`/tasks/${usersChallengeTaskId}/score/up`);

      const tasks = await user.get(`/tasks/challenge/${challenge._id}`);
      const task = find(tasks, { _id: habit._id });
      previousTaskHistory = task.history[0]; // eslint-disable-line prefer-destructuring, max-len

      expect(task.value).to.equal(1);
      expect(task.history).to.have.lengthOf(1);
    });

    it('should update the history', async () => {
      await user.post(`/tasks/${usersChallengeTaskId}/score/up`);

      const tasks = await user.get(`/tasks/challenge/${challenge._id}`);
      const task = find(tasks, { _id: habit._id });

      expect(task.history).to.have.lengthOf(1);
      expect(task.history[0].date).to.not.equal(previousTaskHistory.date);
      expect(task.history[0].value).to.not.equal(previousTaskHistory.value);
    });
  });

  context('dailies', () => {
    let daily;
    let usersChallengeTaskId;
    let previousTaskHistory;

    before(async () => {
      daily = await user.post(`/tasks/challenge/${challenge._id}`, {
        text: 'test daily',
        type: 'daily',
      });
      await sleep(1);
      const updatedUser = await user.get('/user');
      usersChallengeTaskId = updatedUser.tasksOrder.dailys[0]; // eslint-disable-line prefer-destructuring, max-len
    });

    it('it scores and adds history', async () => {
      await user.post(`/tasks/${usersChallengeTaskId}/score/up`);

      const tasks = await user.get(`/tasks/challenge/${challenge._id}`);
      const task = find(tasks, { _id: daily._id });
      previousTaskHistory = task.history[0]; // eslint-disable-line prefer-destructuring

      expect(task.history).to.have.lengthOf(1);
      expect(task.value).to.equal(1);
    });

    it('should update the history', async () => {
      const newCron = new Date(2015, 11, 20);

      await user.post('/debug/set-cron', {
        lastCron: newCron,
      });

      await user.post('/cron');
      await user.post(`/tasks/${usersChallengeTaskId}/score/up`);

      const tasks = await user.get(`/tasks/challenge/${challenge._id}`);
      const task = find(tasks, { _id: daily._id });

      expect(task.history).to.have.lengthOf(1);
      expect(task.history[0].date).to.not.equal(previousTaskHistory.date);
      expect(task.history[0].value).to.not.equal(previousTaskHistory.value);
    });
  });

  context('todos', () => {
    let todo;
    let usersChallengeTaskId;

    before(async () => {
      todo = await user.post(`/tasks/challenge/${challenge._id}`, {
        text: 'test todo',
        type: 'todo',
      });
      await sleep(1);
      const updatedUser = await user.get('/user');
      usersChallengeTaskId = updatedUser.tasksOrder.todos[0]; // eslint-disable-line prefer-destructuring, max-len
    });

    it('scores but does not add history', async () => {
      await user.post(`/tasks/${usersChallengeTaskId}/score/up`);

      const tasks = await user.get(`/tasks/challenge/${challenge._id}`);
      const task = find(tasks, { _id: todo._id });

      expect(task.history).to.not.exist;
      expect(task.value).to.equal(1);
    });
  });

  context('rewards', () => {
    let reward;
    let usersChallengeTaskId;

    before(async () => {
      reward = await user.post(`/tasks/challenge/${challenge._id}`, {
        text: 'test reward',
        type: 'reward',
      });
      await sleep(1);
      const updatedUser = await user.get('/user');
      usersChallengeTaskId = updatedUser.tasksOrder.todos[0]; // eslint-disable-line prefer-destructuring, max-len
    });

    it('does not score', async () => {
      await user.post(`/tasks/${usersChallengeTaskId}/score/up`);

      const tasks = await user.get(`/tasks/challenge/${challenge._id}`);
      const task = find(tasks, { _id: reward._id });

      expect(task.history).to.not.exist;
      expect(task.value).to.equal(0);
    });
  });
});
