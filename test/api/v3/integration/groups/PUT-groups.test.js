import {
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('PUT /group', () => {
  let leader; let nonLeader; let groupToUpdate; let
    adminUser;
  const groupName = 'Test Public Guild';
  const groupType = 'guild';
  const groupUpdatedName = 'Test Public Guild Updated';

  beforeEach(async () => {
    const { group, groupLeader, members } = await createAndPopulateGroup({
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
    nonLeader = members[0]; // eslint-disable-line prefer-destructuring
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
    const updatedGroup = await leader.put(`/groups/${groupToUpdate._id}`, {
      name: groupUpdatedName,
    });

    expect(updatedGroup.leader._id).to.eql(leader._id);
    expect(updatedGroup.leader.profile.name).to.eql(leader.profile.name);
    expect(updatedGroup.name).to.equal(groupUpdatedName);
  });

  it('updates a group categories', async () => {
    const categories = [{
      slug: 'newCat',
      name: 'New Category',
    }];

    const updatedGroup = await leader.put(`/groups/${groupToUpdate._id}`, {
      categories,
    });

    expect(updatedGroup.categories[0].slug).to.eql(categories[0].slug);
    expect(updatedGroup.categories[0].name).to.eql(categories[0].name);
  });

  it('allows an admin to update a guild', async () => {
    const updatedGroup = await adminUser.put(`/groups/${groupToUpdate._id}`, {
      name: groupUpdatedName,
    });
    expect(updatedGroup.leader._id).to.eql(leader._id);
    expect(updatedGroup.leader.profile.name).to.eql(leader.profile.name);
    expect(updatedGroup.name).to.equal(groupUpdatedName);
  });

  it('allows a leader to change leaders', async () => {
    const updatedGroup = await leader.put(`/groups/${groupToUpdate._id}`, {
      name: groupUpdatedName,
      leader: nonLeader._id,
    });

    expect(updatedGroup.leader._id).to.eql(nonLeader._id);
    expect(updatedGroup.leader.profile.name).to.eql(nonLeader.profile.name);
    expect(updatedGroup.name).to.equal(groupUpdatedName);
  });

  it('allows for an admin to update the bannedWordsAllow property for an existing guild', async () => {
    const { group, groupLeader } = await createAndPopulateGroup({
      groupDetails: {
        name: 'public guild',
        type: 'guild',
        privacy: 'public',
      },
    });

    const updateGroupDetails = {
      id: group._id,
      name: 'public guild',
      type: 'guild',
      privacy: 'public',
      bannedWordsAllowed: true,
    };

    // Make guild leader into admin
    await groupLeader.post('/debug/make-admin');
    await groupLeader.sync();

    // Update the bannedWordsAllowed property for the group
    const response = await groupLeader.put(`/groups/${group._id}`, updateGroupDetails);

    expect(groupLeader.contributor.admin).to.eql(true);
    expect(response.bannedWordsAllowed).to.eql(true);
  });

  it('does not allow for a non-admin to update the bannedWordsAllow property for an existing guild', async () => {
    const { group, groupLeader } = await createAndPopulateGroup({
      groupDetails: {
        name: 'public guild',
        type: 'guild',
        privacy: 'public',
      },
    });

    const updateGroupDetails = {
      id: group._id,
      name: 'public guild',
      type: 'guild',
      privacy: 'public',
      bannedWordsAllowed: true,
    };

    // Update the bannedWordsAllowed property for the group
    const response = await groupLeader.put(`/groups/${group._id}`, updateGroupDetails);

    expect(groupLeader.contributor.admin).to.eql(undefined);
    expect(response.bannedWordsAllowed).to.eql(undefined);
  });
});
