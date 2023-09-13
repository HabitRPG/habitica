import {
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { MAX_SUMMARY_SIZE_FOR_GUILDS } from '../../../../../website/common/script/constants';

describe('PUT /group', () => {
  let leader; let nonLeader; let groupToUpdate; let
    adminUser;
  const groupName = 'Test Public Guild';
  const groupType = 'guild';
  const groupUpdatedName = 'Test Public Guild Updated';
  const groupCategories = [
    {
      slug: 'initialCat',
      name: 'Initial Category',
    },
  ];

  beforeEach(async () => {
    const { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        name: groupName,
        type: groupType,
        privacy: 'private',
        categories: groupCategories,
      },
      members: 1,
      upgradeToGroupPlan: true,
    });
    adminUser = await generateUser({ 'permissions.moderator': true });
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

  it('removes the initial group category', async () => {
    const categories = [];

    const updatedGroup = await leader.put(`/groups/${groupToUpdate._id}`, {
      categories,
    });

    expect(updatedGroup.categories.length).to.equal(0);
  });

  it('removes duplicate group categories', async () => {
    const categories = [
      {
        slug: 'newCat',
        name: 'New Category',
      },
      {
        slug: 'newCat',
        name: 'New Category',
      },
    ];

    const updatedGroup = await leader.put(`/groups/${groupToUpdate._id}`, {
      categories,
    });

    expect(updatedGroup.categories.length).to.equal(1);
  });

  it('allows an admin to update a guild', async () => {
    const updatedGroup = await adminUser.put(`/groups/${groupToUpdate._id}`, {
      name: groupUpdatedName,
    });
    expect(updatedGroup.leader._id).to.eql(leader._id);
    expect(updatedGroup.leader.profile.name).to.eql(leader.profile.name);
    expect(updatedGroup.name).to.equal(groupUpdatedName);
  });

  it('does not allow a leader to change leader of active group plan', async () => {
    await expect(leader.put(`/groups/${groupToUpdate._id}`, {
      name: groupUpdatedName,
      leader: nonLeader._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('cannotChangeLeaderWithActiveGroupPlan'),
    });
  });

  it('allows a leader of a party to change leaders', async () => {
    const { group: party, groupLeader: partyLeader, members } = await createAndPopulateGroup({
      members: 1,
    });
    const updatedGroup = await partyLeader.put(`/groups/${party._id}`, {
      name: groupUpdatedName,
      leader: members[0]._id,
    });

    expect(updatedGroup.leader._id).to.eql(members[0]._id);
    expect(updatedGroup.leader.profile.name).to.eql(members[0].profile.name);
    expect(updatedGroup.name).to.equal(groupUpdatedName);
  });

  it('allows for an admin to update the bannedWordsAllow property for an existing guild', async () => {
    const { group, groupLeader } = await createAndPopulateGroup({
      groupDetails: {
        name: 'public guild',
        type: 'guild',
        privacy: 'private',
      },
      upgradeToGroupPlan: true,
    });

    const updateGroupDetails = {
      id: group._id,
      name: 'public guild',
      type: 'guild',
      privacy: 'private',
      bannedWordsAllowed: true,
    };

    // Make guild leader into admin
    await groupLeader.post('/debug/make-admin');
    await groupLeader.sync();

    // Update the bannedWordsAllowed property for the group
    const response = await groupLeader.put(`/groups/${group._id}`, updateGroupDetails);

    expect(groupLeader.permissions.fullAccess).to.eql(true);
    expect(response.bannedWordsAllowed).to.eql(true);
  });

  it('does not allow for a non-moderator to update the bannedWordsAllow property for an existing guild', async () => {
    const { group, groupLeader } = await createAndPopulateGroup({
      groupDetails: {
        name: 'public guild',
        type: 'guild',
        privacy: 'private',
      },
      upgradeToGroupPlan: true,
    });
    await groupLeader.update({ permissions: {} });

    const updateGroupDetails = {
      id: group._id,
      name: 'public guild',
      type: 'guild',
      privacy: 'public',
      bannedWordsAllowed: true,
    };

    // Update the bannedWordsAllowed property for the group
    const response = await groupLeader.put(`/groups/${group._id}`, updateGroupDetails);

    expect(response.bannedWordsAllowed).to.eql(undefined);
  });

  it('returns error when summary is longer than MAX_SUMMARY_SIZE_FOR_GUILDS characters', async () => {
    const summary = 'A'.repeat(MAX_SUMMARY_SIZE_FOR_GUILDS + 1);
    await expect(leader.put(`/groups/${groupToUpdate._id}`, {
      summary,
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });
});
