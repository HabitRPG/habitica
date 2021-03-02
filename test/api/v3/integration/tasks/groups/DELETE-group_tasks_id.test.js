import { find } from 'lodash';
import {
  translate as t,
  createAndPopulateGroup,
} from '../../../../../helpers/api-integration/v3';

describe('Groups DELETE /tasks/:id', () => {
  let user; let guild; let member; let member2; let
    task;

  function findAssignedTask (memberTask) {
    return memberTask.group.id === guild._id;
  }

  beforeEach(async () => {
    const { group, members, groupLeader } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
      },
      members: 2,
    });

    guild = group;
    user = groupLeader;
    member = members[0]; // eslint-disable-line prefer-destructuring
    member2 = members[1]; // eslint-disable-line prefer-destructuring

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

  it('allows a manager to delete a group task', async () => {
    await user.post(`/groups/${guild._id}/add-manager`, {
      managerId: member2._id,
    });

    await member2.del(`/tasks/${task._id}`);

    await expect(user.get(`/tasks/${task._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
  });

  it('removes deleted taskʾs approval pending notifications from managers', async () => {
    await user.post(`/groups/${guild._id}/add-manager`, {
      managerId: member2._id,
    });
    await user.put(`/tasks/${task._id}/`, {
      requiresApproval: true,
    });
    const memberTasks = await member.get('/tasks/user');
    const syncedTask = find(memberTasks, findAssignedTask);
    await member.post(`/tasks/${syncedTask._id}/score/up`);

    await user.sync();
    await member2.sync();
    expect(user.notifications.length).to.equal(2);
    expect(user.notifications[1].type).to.equal('GROUP_TASK_APPROVAL');
    expect(member2.notifications.length).to.equal(2);
    expect(member2.notifications[1].type).to.equal('GROUP_TASK_APPROVAL');

    await member2.del(`/tasks/${task._id}`);

    await user.sync();
    await member2.sync();

    expect(user.notifications.length).to.equal(1);
    expect(member2.notifications.length).to.equal(1);
  });

  it('deletes task from assigned user', async () => {
    await user.del(`/tasks/${task._id}`);

    const memberTasks = await member.get('/tasks/user');
    const syncedTask = find(memberTasks, findAssignedTask);

    expect(syncedTask).to.not.exist;
  });

  it('deletes task from all assigned users', async () => {
    await user.del(`/tasks/${task._id}`);

    const memberTasks = await member.get('/tasks/user');
    const syncedTask = find(memberTasks, findAssignedTask);

    const member2Tasks = await member2.get('/tasks/user');
    const member2SyncedTask = find(member2Tasks, findAssignedTask);

    expect(syncedTask).to.not.exist;
    expect(member2SyncedTask).to.not.exist;
  });

  it('prevents a user from deleting a task they are assigned to', async () => {
    const memberTasks = await member.get('/tasks/user');
    const syncedTask = find(memberTasks, findAssignedTask);

    await expect(member.del(`/tasks/${syncedTask._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('cantDeleteAssignedGroupTasks'),
      });
  });

  it('allows a user to delete a task after leaving a group', async () => {
    const memberTasks = await member.get('/tasks/user');
    const syncedTask = find(memberTasks, findAssignedTask);

    await member.post(`/groups/${guild._id}/leave`);

    await member.del(`/tasks/${syncedTask._id}`);

    await expect(member.get(`/tasks/${syncedTask._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: 'Task not found.',
      });
  });
});
