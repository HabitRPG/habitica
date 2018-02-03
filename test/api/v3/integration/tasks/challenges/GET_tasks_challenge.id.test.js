import {
  generateUser,
  generateGroup,
  generateChallenge,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';
import { each } from 'lodash';

describe('GET /tasks/challenge/:challengeId', () => {
  let user;
  let guild;
  let challenge;
  let task;
  let tasks = [];
  let challengeWithTask;
  let tasksToTest = {
    habit: {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
    },
    todo: {
      text: 'test todo',
      type: 'todo',
    },
    daily: {
      text: 'test daily',
      type: 'daily',
      frequency: 'daily',
      everyX: 5,
      startDate: new Date(),
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
  });

  it('returns error when challenge is not found', async () => {
    let dummyId = generateUUID();

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
        let getTask = await user.get(`/tasks/challenge/${challengeWithTask._id}`);
        expect(getTask).to.eql(tasks);
      });

      it('gets challenge tasks filtered by type', async () => {
        let challengeTasks = await user.get(`/tasks/challenge/${challengeWithTask._id}?type=${task.type}s`);
        expect(challengeTasks).to.eql([task]);
      });

      it('cannot get a task owned by someone else', async () => {
        let anotherUser = await generateUser();

        await expect(anotherUser.get(`/tasks/challenge/${challengeWithTask._id}`)).to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('challengeNotFound'),
        });
      });
    });
  });
});
