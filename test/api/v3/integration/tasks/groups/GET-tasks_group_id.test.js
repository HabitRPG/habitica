import {
  generateUser,
  generateGroup,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';
import { each } from 'lodash';

describe('GET /tasks/group/:groupId', () => {
  let user, group, task, groupWithTask;
  let tasks = [];
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
    group = await generateGroup(user);
  });

  it('returns error when group is not found', async () => {
    let dummyId = generateUUID();

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
        let getTask = await user.get(`/tasks/group/${groupWithTask._id}`);
        expect(getTask).to.eql(tasks);
      });

      it('gets group tasks filtered by type', async () => {
        let groupTasks = await user.get(`/tasks/group/${groupWithTask._id}?type=${task.type}s`);
        expect(groupTasks).to.eql([task]);
      });

      it('cannot get a task owned by someone else', async () => {
        let anotherUser = await generateUser();

        await expect(anotherUser.get(`/tasks/group/${groupWithTask._id}`)).to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });
      });
    });
  });
});
