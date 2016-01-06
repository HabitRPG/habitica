import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

describe('Post /groups/:groupId/leave', () => {
  let user;
  let group;
  let groupName = 'Test Public Guild';
  let groupType = 'guild';

  beforeEach(async () => {
    user = await generateUser({balance: 2});
    group = await user.post('/groups', {
      name: groupName,
      type: groupType,
    });
  });

  describe('leaving guilds', () => {
    it('lets user leave a guild', async () => {
      let newUser = await generateUser();

      await user.post(`/groups/${group._id}/invite`, {
        uuids: [newUser._id],
      });
      await newUser.post(`/groups/${group._id}/join`);
      await newUser.post(`/groups/${group._id}/leave`);

      let userWithOutGroup = await newUser.get('/user');

      expect(userWithOutGroup.guilds).to.be.empty;
    });

    it('sets a new group leader when leader leaves a guild', async () => {
      let memberToBecomeLeader = await generateUser();

      await user.post(`/groups/${group._id}/invite`, {
        uuids: [memberToBecomeLeader._id],
      });
      await memberToBecomeLeader.post(`/groups/${group._id}/join`);
      await user.post(`/groups/${group._id}/leave`);

      let groupWithNewLeader = await memberToBecomeLeader.get(`/groups/${group._id}`);

      expect(groupWithNewLeader.leader).to.equal(memberToBecomeLeader._id);
    });

    it('removes a group and invitations when the last member leaves', async () => {
      let groupPrivacy = 'private';
      let groupToDelete = await user.post('/groups', {
        name: groupName,
        type: groupType,
        privacy: groupPrivacy,
      });
      let newUser = await generateUser();

      await user.post(`/groups/${groupToDelete._id}/invite`, {
        uuids: [newUser._id],
      });
      await user.post(`/groups/${groupToDelete._id}/leave`);

      let groups = await user.get('/groups?type=party,privateGuilds,publicGuilds,tavern');
      let newUserWithoutInvitation = await newUser.get('/user');

      // @TODO: Is there a way we can check using an admin account to see if private groups were deleted?
      expect(_.findIndex(groups, {_id: groupToDelete._id})).to.equal(-1);
      expect(newUserWithoutInvitation.invitations.guilds).to.be.empty;
    });
  });

  describe('leaving with challenges', () => {
    xit('removes all challenges when parameters is set', async () => {});
    xit('keeps all challenges when parameters is set', async () => {});
  });

  describe('leaving parties', () => {
    let party;
    let partyName = 'Test Party';
    let partyType = 'party';

    beforeEach(async () => {
      party = await user.post('/groups', {
        name: partyName,
        type: partyType,
      });
    });

    it('lets user leave a party', async () => {
      let newUser = await generateUser();

      await user.post(`/groups/${party._id}/invite`, {
        uuids: [newUser._id],
      });
      await newUser.post(`/groups/${party._id}/join`);
      await newUser.post(`/groups/${party._id}/leave`);

      let userWithOutGroup = await newUser.get('/user');

      expect(userWithOutGroup.guilds).to.be.empty;
    });

    xit('prevents quest leader from leaving a guild', async () => {});
    xit('prevents a user from leaving during an active quest', async () => {});
  });
});
