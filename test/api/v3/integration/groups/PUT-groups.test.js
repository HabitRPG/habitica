import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';

describe('PUT /group', () => {
  let leader, nonLeader, groupToUpdate;
  let groupName = 'Test Public Guild';
  let groupType = 'guild';
  let groupUpdatedName = 'Test Public Guild Updated';

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
  });

  it('returns an error when a non group leader tries to update', async () => {
    await expect(nonLeader.put(`/groups/${groupToUpdate._id}`, {
      name: groupUpdatedName,
    })).to.eventually.be.rejected.and.eql({
      code: 403,
      error: 'Forbidden',
      message: t('messageGroupOnlyLeaderCanUpdate'),
    });
  });

  it('updates a group', async () => {
    let updatedGroup = await leader.put(`/groups/${groupToUpdate._id}`, {
      name: groupUpdatedName,
    });

    expect(updatedGroup.leader._id).to.eql(leader._id);
    expect(updatedGroup.leader.profile.name).to.eql(leader.profile.name);
    expect(updatedGroup.name).to.equal(groupUpdatedName);
  });
});
