import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('POST /tasks/:id/needs-work/:userId', () => {
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
      requiresApproval: true,
    });
  });

  it('errors when user is not assigned', async () => {
    await expect(user.post(`/tasks/${task._id}/needs-work/${member._id}`))
      .to.eventually.be.rejected.and.to.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Task not completed by this user.',
      });
  });

  it('errors when user is not the group leader', async () => {
    await user.post(`/tasks/${task._id}/assign`, [member._id]);
    await member.post(`/tasks/${task._id}/score/up`);
    await expect(member.post(`/tasks/${task._id}/needs-work/${member._id}`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyGroupLeaderCanEditTasks'),
      });
  });

  it('marks a task as needing more work', async () => {
    await member.sync();
    const initialNotifications = member.notifications.length;
    await user.post(`/tasks/${task._id}/assign`, [member._id]);

    // score task to require approval
    await member.post(`/tasks/${task._id}/score/up`);
    await user.post(`/tasks/${task._id}/needs-work/${member._id}`);

    // Check that the notification is correct
    await member.sync();
    expect(member.notifications.length).to.equal(initialNotifications + 3);
    const notification = member.notifications[member.notifications.length - 1];
    expect(notification.type).to.equal('GROUP_TASK_NEEDS_WORK');

    const taskText = task.text;
    const managerName = user.auth.local.username;

    expect(notification.data.message).to.equal(t('taskNeedsWork', { taskText, managerName }));

    expect(notification.data.task.id).to.equal(task._id);
    expect(notification.data.task.text).to.equal(taskText);

    expect(notification.data.group.id).to.equal(task.group.id);
    expect(notification.data.group.name).to.equal(guild.name);

    expect(notification.data.manager.id).to.equal(user._id);
    expect(notification.data.manager.name).to.equal(managerName);
  });

  it('allows a manager to mark a task as needing work', async () => {
    await member.sync();
    const initialNotifications = member.notifications.length;
    await user.post(`/groups/${guild._id}/add-manager`, {
      managerId: member2._id,
    });
    await member2.post(`/tasks/${task._id}/assign`, [member._id]);

    // score task to require approval
    await member.post(`/tasks/${task._id}/score/up`);
    await member2.post(`/tasks/${task._id}/needs-work/${member._id}`);

    await member.sync();
    expect(member.notifications.length).to.equal(initialNotifications + 3);
    const notification = member.notifications[member.notifications.length - 1];
    expect(notification.type).to.equal('GROUP_TASK_NEEDS_WORK');

    const taskText = task.text;
    const managerName = member2.auth.local.username;

    expect(notification.data.message).to.equal(t('taskNeedsWork', { taskText, managerName }));

    expect(notification.data.task.id).to.equal(task._id);
    expect(notification.data.task.text).to.equal(taskText);

    expect(notification.data.group.id).to.equal(task.group.id);
    expect(notification.data.group.name).to.equal(guild.name);

    expect(notification.data.manager.id).to.equal(member2._id);
    expect(notification.data.manager.name).to.equal(managerName);
  });
});
