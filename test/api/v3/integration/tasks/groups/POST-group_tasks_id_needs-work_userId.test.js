import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import { find } from 'lodash';

describe('POST /tasks/:id/needs-work/:userId', () => {
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
      text: 'test todo',
      type: 'todo',
      requiresApproval: true,
    });
  });

  it('errors when user is not assigned', async () => {
    await expect(user.post(`/tasks/${task._id}/needs-work/${member._id}`))
      .to.eventually.be.rejected.and.to.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
  });

  it('errors when user is not the group leader', async () => {
    await user.post(`/tasks/${task._id}/assign/${member._id}`);
    await expect(member.post(`/tasks/${task._id}/needs-work/${member._id}`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyGroupLeaderCanEditTasks'),
      });
  });

  it('sends a notification when the task needs more work', async () => {
    const initialNotifications = member.notifications.length;

    await user.post(`/tasks/${task._id}/assign/${member._id}`);
    await user.post(`/tasks/${task._id}/needs-work/${member._id}`);

    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);

    await member.sync();

    expect(member.notifications.length).to.equal(initialNotifications + 1);
    const notification = member.notifications[member.notifications.length - 1];
    expect(notification.type).to.equal('GROUP_TASK_NEEDS_WORK');
    expect(notification.data.message).to.equal(t('taskNeedsWork', {taskText: task.text}));
    expect(notification.data.taskId).to.equal(syncedTask._id);
    expect(notification.data.groupId).to.equal(syncedTask.group.id);
  });

  it('allows a manager to mark a task as needing work', async () => {
    const initialNotifications = member.notifications.length;

    await user.post(`/groups/${guild._id}/add-manager`, {
      managerId: member2._id,
    });

    await member2.post(`/tasks/${task._id}/assign/${member._id}`);
    await member2.post(`/tasks/${task._id}/needs-work/${member._id}`);

    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);

    await member.sync();

    expect(member.notifications.length).to.equal(initialNotifications + 1);
    const notification = member.notifications[member.notifications.length - 1];
    expect(notification.type).to.equal('GROUP_TASK_NEEDS_WORK');
    expect(notification.data.message).to.equal(t('taskNeedsWork', {taskText: task.text}));
    expect(notification.data.taskId).to.equal(syncedTask._id);
    expect(notification.data.groupId).to.equal(syncedTask.group.id);
  });

  it('prevents marking a task as needing work if it was already approved', async () => {
    await user.post(`/groups/${guild._id}/add-manager`, {
      managerId: member2._id,
    });

    await member2.post(`/tasks/${task._id}/assign/${member._id}`);
    await member2.post(`/tasks/${task._id}/approve/${member._id}`);
    await expect(user.post(`/tasks/${task._id}/needs-work/${member._id}`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('canOnlyApproveTaskOnce'),
      });
  });
});
