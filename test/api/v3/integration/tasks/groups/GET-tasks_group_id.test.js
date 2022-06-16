import { v4 as generateUUID } from 'uuid';
import { each } from 'lodash';
import {
  generateUser,
  generateGroup,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('GET /tasks/group/:groupId', () => {
  let user; let group; let task; let
    groupWithTask;
  const tasks = [];
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
    group = await generateGroup(user, {}, { 'purchased.plan.customerId': 'group-unlimited' });
  });

  it('returns error when group is not found', async () => {
    const dummyId = generateUUID();

    await expect(user.get(`/tasks/group/${dummyId}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  each(tasksToTest, (taskValue, taskType) => {
    context(`${taskType}`, () => {
      before(async () => {
        task = await user.post(`/tasks/group/${group._id}`, taskValue);
        tasks.push(task);
        groupWithTask = await user.get(`/groups/${group._id}`);
      });

      it('gets group tasks', async () => {
        const getTask = await user.get(`/tasks/group/${groupWithTask._id}`);
        expect(getTask).to.eql(tasks);
      });

      it('gets group tasks filtered by type', async () => {
        const groupTasks = await user.get(`/tasks/group/${groupWithTask._id}?type=${task.type}s`);
        expect(groupTasks).to.eql([task]);
      });

      it('cannot get a task owned by someone else', async () => {
        const anotherUser = await generateUser();

        await expect(anotherUser.get(`/tasks/group/${groupWithTask._id}`)).to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });
      });
    });
  });

  it('maintains group task order', async () => {
    const orderedTasks = {};
    Object.entries(tasksToTest).forEach(async (taskType, taskValue) => {
      const results = [];
      for (let i = 0; i < 5; i += 1) {
        results.push(user.post(`/tasks/group/${group._id}`, taskValue));
      }
      const taskList = await Promise.all(results);
      await user.post(`/tasks/${taskList[0]._id}/move/to/3`);

      const firstTask = taskList.unshift();
      taskList.splice(3, 0, firstTask);

      orderedTasks[taskType] = taskList;
    });

    const results = await user.get(`/tasks/group/${group._id}`);
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
