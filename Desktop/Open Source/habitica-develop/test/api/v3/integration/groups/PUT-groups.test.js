import {
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';

describe('PUT /group', () => {
  let leader, nonLeader, groupToUpdate, adminUser;
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
    adminUser = await generateUser({ 'contributor.admin': true });
    groupToUpdate = group;
    leader = groupLeader;
    nonLeader = members[0];
  });

  it('returns an error when a user that is not an admin or group leader tries to update', async () => {
    await expect(nonLeader.put(`/groups/${groupToUpdate._id}`, {
      name: groupUpdatedName,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
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

  it('updates a group categories', async () => {
    let categories = [{
      slug: 'newCat',
      name: 'New Category',
    }];

    let updatedGroup = await leader.put(`/groups/${groupToUpdate._id}`, {
      categories,
    });

    expect(updatedGroup.categories[0].slug).to.eql(categories[0].slug);
    expect(updatedGroup.categories[0].name).to.eql(categories[0].name);
  });

  it('allows an admin to update a guild', async () => {
    let updatedGroup = await adminUser.put(`/groups/${groupToUpdate._id}`, {
      name: groupUpdatedName,
    });
    expect(updatedGroup.leader._id).to.eql(leader._id);
    expect(updatedGroup.leader.profile.name).to.eql(leader.profile.name);
    expect(updatedGroup.name).to.equal(groupUpdatedName);
  });

  it('allows a leader to change leaders', async () => {
    let updatedGroup = await leader.put(`/groups/${groupToUpdate._id}`, {
      name: groupUpdatedName,
      leader: nonLeader._id,
    });

    expect(updatedGroup.leader._id).to.eql(nonLeader._id);
    expect(updatedGroup.leader.profile.name).to.eql(nonLeader.profile.name);
    expect(updatedGroup.name).to.equal(groupUpdatedName);
  });
});
