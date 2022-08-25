import { find } from 'lodash';
import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('POST /tasks/:id/score/:direction', () => {
  let user; let guild; let member; let member2; let
    task;

  beforeEach(async () => {
    const { group, members, groupLeader } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
      },
      members: 2,
      upgradeToGroupPlan: true,
    });

    guild = group;
    user = groupLeader;
    member = members[0]; // eslint-disable-line prefer-destructuring
    member2 = members[1]; // eslint-disable-line prefer-destructuring

    task = await user.post(`/tasks/group/${guild._id}`, {
      text: 'test todo',
      type: 'todo',
    });

    await user.post(`/tasks/${task._id}/assign`, [member._id]);
  });

  it('completes single-assigned task', async () => {
    await member.post(`/tasks/${task._id}/score/up`);

    const groupTasks = await user.get(`/tasks/group/${guild._id}?type=completedTodos`);
    const sourceTask = find(groupTasks, groupTask => groupTask._id === task._id);

    expect(sourceTask.completed).to.equal(true);
  });

  it('errors when task has already been completed', async () => {
    await member.post(`/tasks/${task._id}/score/up`);

    await expect(member.post(`/tasks/${task._id}/score/up`)).to.be.rejected.and.to.eventually.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('sessionOutdated'),
    });
  });

  it('does not complete multi-assigned task when not all assignees have completed', async () => {
    await user.post(`/tasks/${task._id}/assign`, [member2._id]);

    await member.post(`/tasks/${task._id}/score/up`);

    const groupTasks = await user.get(`/tasks/group/${guild._id}`);
    const sourceTask = find(groupTasks, groupTask => groupTask._id === task._id);

    expect(sourceTask.completed).to.equal(false);
  });

  it('completes multi-assigned task when all assignees have completed', async () => {
    await user.post(`/tasks/${task._id}/assign`, [member2._id]);

    await member.post(`/tasks/${task._id}/score/up`);
    await member2.post(`/tasks/${task._id}/score/up`);

    const groupTasks = await user.get(`/tasks/group/${guild._id}?type=completedTodos`);
    const sourceTask = find(groupTasks, groupTask => groupTask._id === task._id);

    expect(sourceTask.completed).to.equal(true);
  });
});
