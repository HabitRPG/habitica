import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';
import { find } from 'lodash';

describe('POST /tasks/:taskId/unassign/:memberId', () => {
  let user, guild, member, task;

  beforeEach(async () => {
    let {group, members, groupLeader} = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
      },
      members: 1,
    });

    guild = group;
    user = groupLeader;
    member = members[0];

    task = await user.post(`/tasks/group/${guild._id}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    });

    await user.post(`/tasks/${task._id}/assign/${member._id}`);
  });

  it('returns error when task is not found', async () => {
    await expect(user.post(`/tasks/${generateUUID()}/unassign/${member._id}`))
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

    await expect(user.post(`/tasks/${nonGroupTask._id}/unassign/${member._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyGroupTasksCanBeAssigned'),
      });
  });

  it('returns error when user is not a member of the group', async () => {
    let nonUser = await generateUser();

    await expect(nonUser.post(`/tasks/${task._id}/unassign/${member._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
  });

  it('returns error when non leader tries to create a task', async () => {
    await expect(member.post(`/tasks/${task._id}/unassign/${member._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyGroupLeaderCanEditTasks'),
      });
  });

  it('unassigns a user from a task', async () => {
    await user.post(`/tasks/${task._id}/unassign/${member._id}`);
    let groupTask = await user.get(`/tasks/group/${guild._id}`);
    expect(groupTask[0].assignedUserId).to.not.exist;

    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, function findAssignedTask (memberTask) {
      return memberTask.assignedUserId === member._id;
    });
    // console.log(syncedTask);
    expect(syncedTask).to.not.exist;
  });
});
