import { v4 as generateUUID } from 'uuid';
import { each } from 'lodash';
import {
  generateUser,
  generateGroup,
  generateChallenge,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('GET /tasks/challenge/:challengeId', () => {
  let user;
  let guild;
  let challenge;
  let task;
  const tasks = [];
  let challengeWithTask;
  const tasksToTest = {
    habit: {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
    },
    daily: {
      text: 'test daily',
      type: 'daily',
      frequency: 'daily',
      everyX: 5,
      startDate: new Date(),
    },
    todo: {
      text: 'test todo',
      type: 'todo',
    },
    reward: {
      text: 'test reward',
      type: 'reward',
    },
  };

  before(async () => {
    user = await generateUser();
    guild = await generateGroup(user);
    challenge = await generateChallenge(user, guild);
    await user.post(`/challenges/${challenge._id}/join`);
  });

  it('returns error when challenge is not found', async () => {
    const dummyId = generateUUID();

    await expect(user.get(`/tasks/challenge/${dummyId}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  each(tasksToTest, (taskValue, taskType) => {
    context(`${taskType}`, () => {
      before(async () => {
        task = await user.post(`/tasks/challenge/${challenge._id}`, taskValue);
        tasks.push(task);
        challengeWithTask = await user.get(`/challenges/${challenge._id}`);
      });

      it('gets challenge tasks', async () => {
        const getTask = await user.get(`/tasks/challenge/${challengeWithTask._id}`);
        expect(getTask).to.eql(tasks);
      });

      it('gets challenge tasks filtered by type', async () => {
        const challengeTasks = await user.get(`/tasks/challenge/${challengeWithTask._id}?type=${task.type}s`);
        expect(challengeTasks).to.eql([task]);
      });

      it('cannot get a task owned by someone else', async () => {
        const anotherUser = await generateUser();

        await expect(anotherUser.get(`/tasks/challenge/${challengeWithTask._id}`)).to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('challengeNotFound'),
        });
      });
    });
  });

  it('maintains challenge task order', async () => {
    const orderedTasks = {};
    Object.entries(tasksToTest).forEach(async (taskType, taskValue) => {
      const results = [];
      for (let i = 0; i < 5; i += 1) {
        results.push(user.post(`/tasks/challenge/${challenge._id}`, taskValue));
      }
      const taskList = await Promise.all(results);
      await user.post(`/tasks/${taskList[0]._id}/move/to/3`);

      const firstTask = taskList.unshift();
      taskList.splice(3, 0, firstTask);

      orderedTasks[taskType] = taskList;
    });

    const results = await user.get(`/tasks/challenge/${challenge._id}`);
    const resultTasks = {};

    results.forEach(result => {
      if (!resultTasks[result.type]) {
        resultTasks[result.type] = [];
      }
      resultTasks[result.type].push(result);
    });

    Object.entries(orderedTasks).forEach((taskType, taskList) => {
      expect(resultTasks[taskType]).to.eql(taskList);
    });
  });
});
