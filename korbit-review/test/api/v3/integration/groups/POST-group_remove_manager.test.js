import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /group/:groupId/remove-manager', () => {
  let leader; let nonLeader; let
    groupToUpdate;
  const groupName = 'Test Private Guild';
  const groupType = 'guild';
  let nonManager;

  beforeEach(async () => {
    const { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        name: groupName,
        type: groupType,
        privacy: 'private',
      },
      members: 2,
      upgradeToGroupPlan: true,
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
});
