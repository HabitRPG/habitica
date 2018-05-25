import {
  generateUser,
  generateGroup,
  generateChallenge,
} from '../../../../../helpers/api-integration/v3';
import Bluebird from 'bluebird';
import { find } from 'lodash';

describe('POST /tasks/:id/score/:direction', () => {
  let user;
  let guild;
  let challenge;

  before(async () => {
    user = await generateUser();
    guild = await generateGroup(user);
    challenge = await generateChallenge(user, guild);
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
      await Bluebird.delay(1000);
      let updatedUser = await user.get('/user');
      usersChallengeTaskId = updatedUser.tasksOrder.habits[0];
    });

    it('scores and adds history', async () => {
      await user.post(`/tasks/${usersChallengeTaskId}/score/up`);

      let tasks = await user.get(`/tasks/challenge/${challenge._id}`);
      let task = find(tasks, {_id: habit._id});
      previousTaskHistory = task.history[0];

      expect(task.value).to.equal(1);
      expect(task.history).to.have.lengthOf(1);
    });

    it('should update the history', async () => {
      await user.post(`/tasks/${usersChallengeTaskId}/score/up`);

      let tasks = await user.get(`/tasks/challenge/${challenge._id}`);
      let task = find(tasks, {_id: habit._id});

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
      await Bluebird.delay(1000);
      let updatedUser = await user.get('/user');
      usersChallengeTaskId = updatedUser.tasksOrder.dailys[0];
    });

    it('it scores and adds history', async () => {
      await user.post(`/tasks/${usersChallengeTaskId}/score/up`);

      let tasks = await user.get(`/tasks/challenge/${challenge._id}`);
      let task = find(tasks, {_id: daily._id});
      previousTaskHistory = task.history[0];

      expect(task.history).to.have.lengthOf(1);
      expect(task.value).to.equal(1);
    });

    it('should update the history', async () => {
      let newCron = new Date(2015, 11, 20);

      await user.post('/debug/set-cron', {
        lastCron: newCron,
      });

      await user.post('/cron');
      await user.post(`/tasks/${usersChallengeTaskId}/score/up`);

      let tasks = await user.get(`/tasks/challenge/${challenge._id}`);
      let task = find(tasks, {_id: daily._id});

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
      await Bluebird.delay(1000);
      let updatedUser = await user.get('/user');
      usersChallengeTaskId = updatedUser.tasksOrder.todos[0];
    });

    it('scores but does not add history', async () => {
      await user.post(`/tasks/${usersChallengeTaskId}/score/up`);

      let tasks = await user.get(`/tasks/challenge/${challenge._id}`);
      let task = find(tasks, {_id: todo._id});

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
      await Bluebird.delay(1000);
      let updatedUser = await user.get('/user');
      usersChallengeTaskId = updatedUser.tasksOrder.todos[0];
    });

    it('does not score', async () => {
      await user.post(`/tasks/${usersChallengeTaskId}/score/up`);

      let tasks = await user.get(`/tasks/challenge/${challenge._id}`);
      let task = find(tasks, {_id: reward._id});

      expect(task.history).to.not.exist;
      expect(task.value).to.equal(0);
    });
  });
});
