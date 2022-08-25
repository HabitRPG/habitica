import { v4 as generateUUID } from 'uuid';
import { find } from 'lodash';
import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('POST /tasks/:taskId/assign/:memberId', () => {
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
      upgradeToGroupPlan: true,
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
  });

  it('returns error when task is not found', async () => {
    await expect(user.post(`/tasks/${generateUUID()}/assign`, [member._id]))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageTaskNotFound'),
      });
  });

  it('returns error when task is not a group task', async () => {
    const nonGroupTask = await user.post('/tasks/user', {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    });

    await expect(user.post(`/tasks/${nonGroupTask._id}/assign`, [member._id]))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyGroupTasksCanBeAssigned'),
      });
  });

  it('returns error when user is not a member of the group', async () => {
    const nonUser = await generateUser();

    await expect(nonUser.post(`/tasks/${task._id}/assign`, [member._id]))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
  });

  it('returns error when non leader tries to create a task', async () => {
    await expect(member2.post(`/tasks/${task._id}/assign`, [member._id]))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyGroupLeaderCanEditTasks'),
      });
  });

  it('assigns a task to a user', async () => {
    await user.post(`/tasks/${task._id}/assign`, [member._id]);

    const groupTask = await user.get(`/tasks/group/${guild._id}`);
    await member.put('/user', {
      'preferences.tasks.mirrorGroupTasks': [guild._id],
    });
    const memberTasks = await member.get('/tasks/user');
    const syncedTask = find(memberTasks, findAssignedTask);

    expect(groupTask[0].group.assignedUsers).to.contain(member._id);
    expect(groupTask[0].group.assignedUsersDetail[member._id]).to.exist;
    expect(syncedTask).to.exist;
  });

  it('sends a notification to assigned user', async () => {
    await user.post(`/tasks/${task._id}/assign`, [member._id]);
    await member.sync();

    const groupTask = await user.get(`/tasks/group/${guild._id}`);

    expect(member.notifications.length).to.equal(2);
    expect(member.notifications[1].type).to.equal('GROUP_TASK_ASSIGNED');
    expect(member.notifications[1].taskId).to.equal(groupTask._id);
  });

  it('assigns a task to multiple users', async () => {
    await user.post(`/tasks/${task._id}/assign`, [member._id, member2._id]);

    const groupTask = await user.get(`/tasks/group/${guild._id}`);

    await member.put('/user', {
      'preferences.tasks.mirrorGroupTasks': [guild._id],
    });
    const memberTasks = await member.get('/tasks/user');
    const member1SyncedTask = find(memberTasks, findAssignedTask);

    await member2.put('/user', {
      'preferences.tasks.mirrorGroupTasks': [guild._id],
    });
    const member2Tasks = await member2.get('/tasks/user');
    const member2SyncedTask = find(member2Tasks, findAssignedTask);

    expect(groupTask[0].group.assignedUsers).to.contain(member._id);
    expect(groupTask[0].group.assignedUsersDetail[member._id]).to.exist;
    expect(member1SyncedTask).to.exist;
    expect(groupTask[0].group.assignedUsers).to.contain(member2._id);
    expect(groupTask[0].group.assignedUsersDetail[member2._id]).to.exist;
    expect(member2SyncedTask).to.exist;
  });

  it('allows a manager to assign tasks', async () => {
    await user.post(`/groups/${guild._id}/add-manager`, {
      managerId: member2._id,
    });

    await member2.post(`/tasks/${task._id}/assign`, [member._id]);

    const groupTask = await member2.get(`/tasks/group/${guild._id}`);
    await member.put('/user', {
      'preferences.tasks.mirrorGroupTasks': [guild._id],
    });
    const memberTasks = await member.get('/tasks/user');
    const syncedTask = find(memberTasks, findAssignedTask);

    expect(groupTask[0].group.assignedUsers).to.contain(member._id);
    expect(groupTask[0].group.assignedUsersDetail[member._id]).to.exist;
    expect(syncedTask).to.exist;
  });
});
