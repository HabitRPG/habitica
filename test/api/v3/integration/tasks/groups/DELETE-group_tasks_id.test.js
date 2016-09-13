import {
  translate as t,
  createAndPopulateGroup,
} from '../../../../../helpers/api-integration/v3';
import { find } from 'lodash';

describe('DELETE /tasks/:id', () => {
  let user, guild, member, member2, task;

  function findAssignedTask (memberTask) {
    return memberTask.group.id === guild._id;
  }

  beforeEach(async () => {
    let {group, members, groupLeader} = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
      },
      members: 2,
    });

    guild = group;
    user = groupLeader;
    member = members[0];
    member2 = members[1];

    task = await user.post(`/tasks/group/${guild._id}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    });

    await user.post(`/tasks/${task._id}/assign/${member._id}`);
    await user.post(`/tasks/${task._id}/assign/${member2._id}`);
  });

  it('deletes a group task', async () => {
    await user.del(`/tasks/${task._id}`);

    await expect(user.get(`/tasks/${task._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
  });

  it('unlinks assigned user', async () => {
    await user.del(`/tasks/${task._id}`);

    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);

    expect(syncedTask.group.broken).to.equal('TASK_DELETED');
  });

  it('unlinks all assigned users', async () => {
    await user.del(`/tasks/${task._id}`);

    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);

    let member2Tasks = await member2.get('/tasks/user');
    let member2SyncedTask = find(member2Tasks, findAssignedTask);

    expect(syncedTask.group.broken).to.equal('TASK_DELETED');
    expect(member2SyncedTask.group.broken).to.equal('TASK_DELETED');
  });
});
