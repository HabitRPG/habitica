import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';
import { find } from 'lodash';

describe('POST /tasks/:taskId', () => {
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
  });

  it('returns error when task is not found', async () => {
    await expect(user.post(`/tasks/${generateUUID()}/assign/${member._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
  });

  it('returns error when task is not a group task', async () => {
    let nonGroupTask = await user.post('/tasks/user', {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    });

    await expect(user.post(`/tasks/${nonGroupTask._id}/assign/${member._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyGroupTasksCanBeAssigned'),
      });
  });

  it('returns error when user is not a member of the group', async () => {
    let nonUser = await generateUser();

    await expect(nonUser.post(`/tasks/${task._id}/assign/${member._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
  });

  it('returns error when non leader tries to create a task', async () => {
    await expect(member2.post(`/tasks/${task._id}/assign/${member._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyGroupLeaderCanEditTasks'),
      });
  });

  it('allows user to assign themselves (claim)', async () => {
    await member.post(`/tasks/${task._id}/assign/${member._id}`);

    let groupTask = await user.get(`/tasks/group/${guild._id}`);
    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);

    expect(groupTask[0].group.assignedUsers).to.contain(member._id);
    expect(syncedTask).to.exist;
  });

  it('sends a message to the group when a user claims a task', async () => {
    await member.post(`/tasks/${task._id}/assign/${member._id}`);

    let updateGroup = await user.get(`/groups/${guild._id}`);

    expect(updateGroup.chat[0].text).to.equal(t('userIsClamingTask', {username: member.profile.name, task: task.text}));
  });

  it('assigns a task to a user', async () => {
    await user.post(`/tasks/${task._id}/assign/${member._id}`);

    let groupTask = await user.get(`/tasks/group/${guild._id}`);
    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);

    expect(groupTask[0].group.assignedUsers).to.contain(member._id);
    expect(syncedTask).to.exist;
  });

  it('assigns a task to multiple users', async () => {
    await user.post(`/tasks/${task._id}/assign/${member._id}`);
    await user.post(`/tasks/${task._id}/assign/${member2._id}`);

    let groupTask = await user.get(`/tasks/group/${guild._id}`);

    let memberTasks = await member.get('/tasks/user');
    let member1SyncedTask = find(memberTasks, findAssignedTask);

    let member2Tasks = await member2.get('/tasks/user');
    let member2SyncedTask = find(member2Tasks, findAssignedTask);

    expect(groupTask[0].group.assignedUsers).to.contain(member._id);
    expect(groupTask[0].group.assignedUsers).to.contain(member2._id);
    expect(member1SyncedTask).to.exist;
    expect(member2SyncedTask).to.exist;
  });
});
