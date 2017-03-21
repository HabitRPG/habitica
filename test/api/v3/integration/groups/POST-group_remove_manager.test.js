import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /group/:groupId/remove-manager', () => {
  let leader, nonLeader, groupToUpdate;
  let groupName = 'Test Public Guild';
  let groupType = 'guild';
  let nonManager;

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
});
