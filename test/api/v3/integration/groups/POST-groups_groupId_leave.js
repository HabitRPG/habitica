import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

describe('POST /groups/:groupId/leave', () => {
  let user;
  let userToInvite;
  let group;
  let groupName = 'Test Public Guild';
  let groupType = 'guild';

  beforeEach(async () => {
    user = await generateUser({balance: 2});
    userToInvite = await generateUser();
    group = await user.post('/groups', {
      name: groupName,
      type: groupType,
    });
    await user.post(`/groups/${group._id}/invite`, {
      uuids: [userToInvite._id],
    });
  });

  describe('leaving guilds', () => {
    it('lets user leave a guild', async () => {
      await userToInvite.post(`/groups/${group._id}/join`);
      await userToInvite.post(`/groups/${group._id}/leave`);

      let userThatLeftGuild = await userToInvite.get('/user');

      expect(userThatLeftGuild.guilds).to.be.empty;
    });

    it('sets a new group leader when leader leaves a guild', async () => {
      await userToInvite.post(`/groups/${group._id}/join`);
      await user.post(`/groups/${group._id}/leave`);

      let groupWithNewLeader = await userToInvite.get(`/groups/${group._id}`);

      expect(groupWithNewLeader.leader).to.equal(userToInvite._id);
    });

    it('removes a group and invitations when the last member leaves', async () => {
      await user.post(`/groups/${group._id}/leave`);

      let groups = await user.get('/groups?type=party,privateGuilds,publicGuilds,tavern');
      let userWithoutInvitation = await userToInvite.get('/user');

      // @TODO: Is there a way we can check using an admin account to see if private groups were deleted?
      expect(_.findIndex(groups, {_id: group._id})).to.equal(-1);
      expect(userWithoutInvitation.invitations.guilds).to.be.empty;
    });
  });

  describe('leaving with challenges', () => {
    xit('removes all challenges when parameters is set', async () => {});

    xit('keeps all challenges when parameters is set', async () => {});
  });

  describe('leaving parties', () => {
    let party;

    beforeEach(async () => {
      party = await user.post('/groups', {
        name: 'Test Party',
        type: 'party',
      });
      await user.post(`/groups/${party._id}/invite`, {
        uuids: [userToInvite._id],
      });
      await userToInvite.post(`/groups/${party._id}/join`);
    });

    it('lets user leave a party', async () => {
      await userToInvite.post(`/groups/${party._id}/leave`);

      let userWithOutGroup = await userToInvite.get('/user');

      expect(userWithOutGroup.guilds).to.be.empty;
    });

    xit('prevents quest leader from leaving a guild', async () => {});
    xit('prevents a user from leaving during an active quest', async () => {});
  });
});
