import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { find } from 'lodash';

describe('POST /group/:groupId/remove-manager', () => {
  let leader, nonLeader, groupToUpdate;
  let groupName = 'Test Public Guild';
  let groupType = 'guild';
  let nonManager;

  function findAssignedTask (memberTask) {
    return memberTask.group.id === groupToUpdate._id;
  }

  beforeEach(async () => {
    let { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        name: groupName,
        type: groupType,
        privacy: 'public',
      },
      members: 1,
    });

    groupToUpdate = group;
    leader = groupLeader;
    nonLeader = members[0];
    nonManager = members[0];
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

    let updatedGroup = await leader.post(`/groups/${groupToUpdate._id}/remove-manager`, {
      managerId: nonLeader._id,
    });

    expect(updatedGroup.managers[nonLeader._id]).to.not.exist;
  });

  it('removes group approval notifications from a manager that is removed', async () => {
    await leader.post(`/groups/${groupToUpdate._id}/add-manager`, {
      managerId: nonLeader._id,
    });
    let task = await leader.post(`/tasks/group/${groupToUpdate._id}`, {
      text: 'test todo',
      type: 'todo',
      requiresApproval: true,
    });
    await nonLeader.post(`/tasks/${task._id}/assign/${leader._id}`);
    let memberTasks = await leader.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);
    await expect(leader.post(`/tasks/${syncedTask._id}/score/up`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('taskApprovalHasBeenRequested'),
      });

    let updatedGroup = await leader.post(`/groups/${groupToUpdate._id}/remove-manager`, {
      managerId: nonLeader._id,
    });

    await nonLeader.sync();

    expect(nonLeader.notifications.length).to.equal(0);
    expect(updatedGroup.managers[nonLeader._id]).to.not.exist;
  });
});
