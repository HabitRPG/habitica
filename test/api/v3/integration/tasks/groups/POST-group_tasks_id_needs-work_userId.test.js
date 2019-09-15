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

  it('marks a task as needing more work', async () => {
    const initialNotifications = member.notifications.length;

    await user.post(`/tasks/${task._id}/assign/${member._id}`);

    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);

    // score task to require approval
    await expect(member.post(`/tasks/${syncedTask._id}/score/up`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('taskApprovalHasBeenRequested'),
      });

    await user.post(`/tasks/${task._id}/needs-work/${member._id}`);

    [memberTasks] = await Promise.all([member.get('/tasks/user'), member.sync()]);
    syncedTask = find(memberTasks, findAssignedTask);

    // Check that the notification approval request has been removed
    expect(syncedTask.group.approval.requested).to.equal(false);
    expect(syncedTask.group.approval.requestedDate).to.equal(undefined);

    // Check that the notification is correct
    expect(member.notifications.length).to.equal(initialNotifications + 2);
    const notification = member.notifications[member.notifications.length - 1];
    expect(notification.type).to.equal('GROUP_TASK_NEEDS_WORK');

    const taskText = syncedTask.text;
    const managerName = user.profile.name;

    expect(notification.data.message).to.equal(t('taskNeedsWork', {taskText, managerName}));

    expect(notification.data.task.id).to.equal(syncedTask._id);
    expect(notification.data.task.text).to.equal(taskText);

    expect(notification.data.group.id).to.equal(syncedTask.group.id);
    expect(notification.data.group.name).to.equal(guild.name);

    expect(notification.data.manager.id).to.equal(user._id);
    expect(notification.data.manager.name).to.equal(managerName);

    // Check that the managers' GROUP_TASK_APPROVAL notifications have been removed
    await user.sync();

    expect(user.notifications.find(n => {
      n.data.taskId === syncedTask._id && n.type === 'GROUP_TASK_APPROVAL';
    })).to.equal(undefined);
  });

  it('allows a manager to mark a task as needing work', async () => {
    await user.post(`/groups/${guild._id}/add-manager`, {
      managerId: member2._id,
    });
    await member2.post(`/tasks/${task._id}/assign/${member._id}`);

    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);

    // score task to require approval
    await expect(member.post(`/tasks/${syncedTask._id}/score/up`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('taskApprovalHasBeenRequested'),
      });

    const initialNotifications = member.notifications.length;

    await member2.post(`/tasks/${task._id}/needs-work/${member._id}`);

    [memberTasks] = await Promise.all([member.get('/tasks/user'), member.sync()]);
    syncedTask = find(memberTasks, findAssignedTask);

    // Check that the notification approval request has been removed
    expect(syncedTask.group.approval.requested).to.equal(false);
    expect(syncedTask.group.approval.requestedDate).to.equal(undefined);

    expect(member.notifications.length).to.equal(initialNotifications + 2);
    const notification = member.notifications[member.notifications.length - 1];
    expect(notification.type).to.equal('GROUP_TASK_NEEDS_WORK');

    const taskText = syncedTask.text;
    const managerName = member2.profile.name;

    expect(notification.data.message).to.equal(t('taskNeedsWork', {taskText, managerName}));

    expect(notification.data.task.id).to.equal(syncedTask._id);
    expect(notification.data.task.text).to.equal(taskText);

    expect(notification.data.group.id).to.equal(syncedTask.group.id);
    expect(notification.data.group.name).to.equal(guild.name);

    expect(notification.data.manager.id).to.equal(member2._id);
    expect(notification.data.manager.name).to.equal(managerName);

    // Check that the managers' GROUP_TASK_APPROVAL notifications have been removed
    await Promise.all([user.sync(), member2.sync()]);

    expect(user.notifications.find(n => {
      n.data.taskId === syncedTask._id && n.type === 'GROUP_TASK_APPROVAL';
    })).to.equal(undefined);

    expect(member2.notifications.find(n => {
      n.data.taskId === syncedTask._id && n.type === 'GROUP_TASK_APPROVAL';
    })).to.equal(undefined);
  });

  it('prevents marking a task as needing work if it was already approved', async () => {
    await user.post(`/groups/${guild._id}/add-manager`, {
      managerId: member2._id,
    });

    await member2.post(`/tasks/${task._id}/assign/${member._id}`);

    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);

    await expect(member.post(`/tasks/${syncedTask._id}/score/up`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('taskApprovalHasBeenRequested'),
      });

    await member2.post(`/tasks/${task._id}/approve/${member._id}`);
    await expect(user.post(`/tasks/${task._id}/needs-work/${member._id}`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('canOnlyApproveTaskOnce'),
      });
  });

  it('prevents marking a task as needing work if it is not waiting for approval', async () => {
    await user.post(`/tasks/${task._id}/assign/${member._id}`);

    await expect(user.post(`/tasks/${task._id}/needs-work/${member._id}`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('taskApprovalWasNotRequested'),
      });
  });
});
