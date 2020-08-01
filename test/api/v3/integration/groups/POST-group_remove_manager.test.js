import { find } from 'lodash';
import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /group/:groupId/remove-manager', () => {
  let leader; let nonLeader; let
    groupToUpdate;
  const groupName = 'Test Public Guild';
  const groupType = 'guild';
  let nonManager;

  function findAssignedTask (memberTask) {
    return memberTask.group.id === groupToUpdate._id;
  }

  beforeEach(async () => {
    const { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        name: groupName,
        type: groupType,
        privacy: 'public',
      },
      members: 2,
    });

    groupToUpdate = group;
    leader = groupLeader;
    nonLeader = members[0]; // eslint-disable-line prefer-destructuring
    nonManager = members[1]; // eslint-disable-line prefer-destructuring
  });

  it('returns an error when a non group leader tries to add member', async () => {
    await expect(nonLeader.post(`/groups/${groupToUpdate._id}/remove-manager`, {
      managerId: nonLeader._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('messageGroupOnlyLeaderCanUpdate'),
    });
  });

  it('returns an error when manager does not exist', async () => {
    await expect(leader.post(`/groups/${groupToUpdate._id}/remove-manager`, {
      managerId: nonManager._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('userIsNotManager'),
    });
  });

  it('allows a leader to remove managers', async () => {
    await leader.post(`/groups/${groupToUpdate._id}/add-manager`, {
      managerId: nonLeader._id,
    });

    const updatedGroup = await leader.post(`/groups/${groupToUpdate._id}/remove-manager`, {
      managerId: nonLeader._id,
    });

    expect(updatedGroup.managers[nonLeader._id]).to.not.exist;
  });

  it('removes group approval notifications from a manager that is removed', async () => {
    await leader.post(`/groups/${groupToUpdate._id}/add-manager`, {
      managerId: nonLeader._id,
    });
    const task = await leader.post(`/tasks/group/${groupToUpdate._id}`, {
      text: 'test todo',
      type: 'todo',
      requiresApproval: true,
    });
    await nonLeader.post(`/tasks/${task._id}/assign/${nonManager._id}`);
    const memberTasks = await nonManager.get('/tasks/user');
    const syncedTask = find(memberTasks, findAssignedTask);
    await nonManager.post(`/tasks/${syncedTask._id}/score/up`);

    const updatedGroup = await leader.post(`/groups/${groupToUpdate._id}/remove-manager`, {
      managerId: nonLeader._id,
    });

    await nonLeader.sync();

    expect(nonLeader.notifications.length).to.equal(0);
    expect(updatedGroup.managers[nonLeader._id]).to.not.exist;
  });
});
