import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import { find } from 'lodash';

describe('POST /tasks/:id/approve/:userId', () => {
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
    await expect(user.post(`/tasks/${task._id}/approve/${member._id}`))
      .to.eventually.be.rejected.and.to.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
  });

  it('errors when user is not the group leader', async () => {
    await user.post(`/tasks/${task._id}/assign/${member._id}`);
    await expect(member.post(`/tasks/${task._id}/approve/${member._id}`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyGroupLeaderCanEditTasks'),
      });
  });

  it('approves an assigned user', async () => {
    await user.post(`/tasks/${task._id}/assign/${member._id}`);

    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);

    await expect(member.post(`/tasks/${syncedTask._id}/score/up`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('taskApprovalHasBeenRequested'),
      });

    await user.post(`/tasks/${task._id}/approve/${member._id}`);

    await member.sync();

    expect(member.notifications.length).to.equal(3);
    expect(member.notifications[1].type).to.equal('GROUP_TASK_APPROVED');
    expect(member.notifications[1].data.message).to.equal(t('yourTaskHasBeenApproved', {taskText: task.text}));
    expect(member.notifications[2].type).to.equal('SCORED_TASK');
    expect(member.notifications[2].data.message).to.equal(t('yourTaskHasBeenApproved', {taskText: task.text}));

    memberTasks = await member.get('/tasks/user');
    syncedTask = find(memberTasks, findAssignedTask);

    expect(syncedTask.group.approval.approved).to.be.true;
    expect(syncedTask.group.approval.approvingUser).to.equal(user._id);
    expect(syncedTask.group.approval.dateApproved).to.be.a('string'); // date gets converted to a string as json doesn't have a Date type
  });

  it('allows a manager to approve an assigned user', async () => {
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
    await member.sync();

    expect(member.notifications.length).to.equal(3);
    expect(member.notifications[1].type).to.equal('GROUP_TASK_APPROVED');
    expect(member.notifications[1].data.message).to.equal(t('yourTaskHasBeenApproved', {taskText: task.text}));
    expect(member.notifications[2].type).to.equal('SCORED_TASK');
    expect(member.notifications[2].data.message).to.equal(t('yourTaskHasBeenApproved', {taskText: task.text}));

    memberTasks = await member.get('/tasks/user');
    syncedTask = find(memberTasks, findAssignedTask);

    expect(syncedTask.group.approval.approved).to.be.true;
    expect(syncedTask.group.approval.approvingUser).to.equal(member2._id);
    expect(syncedTask.group.approval.dateApproved).to.be.a('string'); // date gets converted to a string as json doesn't have a Date type
  });

  it('removes approval pending notifications from managers', async () => {
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

    await user.sync();
    await member2.sync();
    expect(user.notifications.length).to.equal(2);
    expect(user.notifications[1].type).to.equal('GROUP_TASK_APPROVAL');
    expect(member2.notifications.length).to.equal(1);
    expect(member2.notifications[0].type).to.equal('GROUP_TASK_APPROVAL');

    await member2.post(`/tasks/${task._id}/approve/${member._id}`);

    await user.sync();
    await member2.sync();

    expect(user.notifications.length).to.equal(1);
    expect(member2.notifications.length).to.equal(0);
  });

  it('prevents double approval on a task', async () => {
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
    await expect(user.post(`/tasks/${task._id}/approve/${member._id}`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('canOnlyApproveTaskOnce'),
      });
  });

  it('prevents approving a task if it is not waiting for approval', async () => {
    await user.post(`/tasks/${task._id}/assign/${member._id}`);

    await expect(user.post(`/tasks/${task._id}/approve/${member._id}`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('taskApprovalWasNotRequested'),
      });
  });

  it('completes master task when single-completion task is approved', async () => {
    let sharedCompletionTask = await user.post(`/tasks/group/${guild._id}`, {
      text: 'shared completion todo',
      type: 'todo',
      requiresApproval: true,
      sharedCompletion: 'singleCompletion',
    });

    await user.post(`/tasks/${sharedCompletionTask._id}/assign/${member._id}`);
    await user.post(`/tasks/${sharedCompletionTask._id}/assign/${member2._id}`);

    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);
    await expect(member.post(`/tasks/${syncedTask._id}/score/up`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('taskApprovalHasBeenRequested'),
      });

    await user.post(`/tasks/${sharedCompletionTask._id}/approve/${member._id}`);

    let groupTasks = await user.get(`/tasks/group/${guild._id}?type=completedTodos`);

    let masterTask = find(groupTasks, (groupTask) => {
      return groupTask._id === sharedCompletionTask._id;
    });

    expect(masterTask.completed).to.equal(true);
  });

  it('deletes other assigned user tasks when single-completion task is approved', async () => {
    let sharedCompletionTask = await user.post(`/tasks/group/${guild._id}`, {
      text: 'shared completion todo',
      type: 'todo',
      requiresApproval: true,
      sharedCompletion: 'singleCompletion',
    });

    await user.post(`/tasks/${sharedCompletionTask._id}/assign/${member._id}`);
    await user.post(`/tasks/${sharedCompletionTask._id}/assign/${member2._id}`);

    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);
    await expect(member.post(`/tasks/${syncedTask._id}/score/up`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('taskApprovalHasBeenRequested'),
      });

    await user.post(`/tasks/${sharedCompletionTask._id}/approve/${member._id}`);

    let member2Tasks = await member2.get('/tasks/user');

    let syncedTask2 = find(member2Tasks, (memberTask) => {
      return memberTask.group.taskId === sharedCompletionTask._id;
    });

    expect(syncedTask2).to.equal(undefined);
  });

  it('does not complete master task when not all user tasks are approved if all assigned must complete', async () => {
    let sharedCompletionTask = await user.post(`/tasks/group/${guild._id}`, {
      text: 'shared completion todo',
      type: 'todo',
      requiresApproval: true,
      sharedCompletion: 'allAssignedCompletion',
    });

    await user.post(`/tasks/${sharedCompletionTask._id}/assign/${member._id}`);
    await user.post(`/tasks/${sharedCompletionTask._id}/assign/${member2._id}`);

    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);
    await expect(member.post(`/tasks/${syncedTask._id}/score/up`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('taskApprovalHasBeenRequested'),
      });

    await user.post(`/tasks/${sharedCompletionTask._id}/approve/${member._id}`);

    let groupTasks = await user.get(`/tasks/group/${guild._id}`);

    let masterTask = find(groupTasks, (groupTask) => {
      return groupTask._id === sharedCompletionTask._id;
    });

    expect(masterTask.completed).to.equal(false);
  });

  it('completes master task when all user tasks are approved if all assigned must complete', async () => {
    let sharedCompletionTask = await user.post(`/tasks/group/${guild._id}`, {
      text: 'shared completion todo',
      type: 'todo',
      requiresApproval: true,
      sharedCompletion: 'allAssignedCompletion',
    });

    await user.post(`/tasks/${sharedCompletionTask._id}/assign/${member._id}`);
    await user.post(`/tasks/${sharedCompletionTask._id}/assign/${member2._id}`);

    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);
    await expect(member.post(`/tasks/${syncedTask._id}/score/up`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('taskApprovalHasBeenRequested'),
      });

    let member2Tasks = await member2.get('/tasks/user');
    let member2SyncedTask = find(member2Tasks, findAssignedTask);
    await expect(member2.post(`/tasks/${member2SyncedTask._id}/score/up`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('taskApprovalHasBeenRequested'),
      });

    await user.post(`/tasks/${sharedCompletionTask._id}/approve/${member._id}`);
    await user.post(`/tasks/${sharedCompletionTask._id}/approve/${member2._id}`);

    let groupTasks = await user.get(`/tasks/group/${guild._id}?type=completedTodos`);

    let masterTask = find(groupTasks, (groupTask) => {
      return groupTask._id === sharedCompletionTask._id;
    });

    expect(masterTask.completed).to.equal(true);
  });
});
