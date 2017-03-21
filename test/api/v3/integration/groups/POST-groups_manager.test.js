import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /group/:groupId/add-member', () => {
  let leader, nonLeader, groupToUpdate;
  let groupName = 'Test Public Guild';
  let groupType = 'guild';
  let groupUpdatedName = 'Test Public Guild Updated';
  let nonMember;

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
    nonMember = await generateUser();
  });

  it('returns an error when a non group leader tries to add member', async () => {
    await expect(nonLeader.post(`/groups/${groupToUpdate._id}/add-manager`, {
      managerId: nonLeader._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('messageGroupOnlyLeaderCanUpdate'),
    });
  });

  it('returns an error when trying to promote a non member', async () => {
    await expect(leader.post(`/groups/${groupToUpdate._id}/add-manager`, {
      managerId: nonMember._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('userMustBeMember'),
    });
  });

  it('allows a leader to add managers', async () => {
    let updatedGroup = await leader.post(`/groups/${groupToUpdate._id}/add-manager`, {
      managerId: nonLeader._id,
    });

    expect(updatedGroup.managers[nonLeader._id]).to.be.true;
  });
});
