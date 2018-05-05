import {
  generateUser,
  createAndPopulateGroup,
  checkExistence,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /group/:groupId/join', () => {
  const PET_QUEST = 'whale';

  it('returns error when groupId is not for a valid group', async () => {
    let joiningUser = await generateUser();

    await expect(joiningUser.post(`/groups/${generateUUID()}/join`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  context('Joining a public guild', () => {
    let user, joiningUser, publicGuild;

    beforeEach(async () => {
      let {group, groupLeader} = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Guild',
          type: 'guild',
          privacy: 'public',
        },
      });

      publicGuild = group;
      user = groupLeader;
      joiningUser = await generateUser();
    });

    it('allows non-invited users to join public guilds', async () => {
      let res = await joiningUser.post(`/groups/${publicGuild._id}/join`);

      await expect(joiningUser.get('/user')).to.eventually.have.property('guilds').to.include(publicGuild._id);
      expect(res.leader._id).to.eql(user._id);
      expect(res.leader.profile.name).to.eql(user.profile.name);
    });

    it('returns an error is user was already a member', async () => {
      await joiningUser.post(`/groups/${publicGuild._id}/join`);
      await expect(joiningUser.post(`/groups/${publicGuild._id}/join`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('userAlreadyInGroup'),
      });
    });

    it('promotes joining member in a public empty guild to leader', async () => {
      await user.post(`/groups/${publicGuild._id}/leave`);

      await joiningUser.post(`/groups/${publicGuild._id}/join`);

      await expect(joiningUser.get(`/groups/${publicGuild._id}`)).to.eventually.have.deep.property('leader._id', joiningUser._id);
    });

    it('increments memberCount when joining guilds', async () => {
      let oldMemberCount = publicGuild.memberCount;

      await joiningUser.post(`/groups/${publicGuild._id}/join`);

      await expect(joiningUser.get(`/groups/${publicGuild._id}`)).to.eventually.have.property('memberCount', oldMemberCount + 1);
    });

    it('awards Joined Guild achievement', async () => {
      await joiningUser.post(`/groups/${publicGuild._id}/join`);

      await expect(joiningUser.get('/user')).to.eventually.have.deep.property('achievements.joinedGuild', true);
    });
  });

  context('Joining a private guild', () => {
    let user, invitedUser, guild;

    beforeEach(async () => {
      let { group, groupLeader, invitees } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Guild',
          type: 'guild',
          privacy: 'private',
        },
        invites: 1,
      });

      guild = group;
      user = groupLeader;
      invitedUser = invitees[0];
    });

    it('returns error when user is not invited to private guild', async () => {
      let userWithoutInvite = await generateUser();

      await expect(userWithoutInvite.post(`/groups/${guild._id}/join`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageGroupRequiresInvite'),
      });
    });

    context('User is invited', () => {
      it('allows invited user to join private guilds', async () => {
        await invitedUser.post(`/groups/${guild._id}/join`);

        await expect(invitedUser.get('/user')).to.eventually.have.property('guilds').to.include(guild._id);
      });

      it('clears invitation from user when joining guilds', async () => {
        await invitedUser.post(`/groups/${guild._id}/join`);

        await expect(invitedUser.get('/user'))
          .to.eventually.have.deep.property('invitations.guilds')
          .to.not.include({id: guild._id});
      });

      it('increments memberCount when joining guilds', async () => {
        let oldMemberCount = guild.memberCount;

        await invitedUser.post(`/groups/${guild._id}/join`);

        await expect(invitedUser.get(`/groups/${guild._id}`)).to.eventually.have.property('memberCount', oldMemberCount + 1);
      });

      it('does not give basilist quest to inviter when joining a guild', async () => {
        await invitedUser.post(`/groups/${guild._id}/join`);

        await expect(user.get('/user')).to.eventually.not.have.deep.property('items.quests.basilist');
      });

      it('does not increment basilist quest count to inviter with basilist when joining a guild', async () => {
        await user.update({ 'items.quests.basilist': 1 });

        await invitedUser.post(`/groups/${guild._id}/join`);

        await expect(user.get('/user')).to.eventually.have.deep.property('items.quests.basilist', 1);
      });

      it('notifies inviting user that their invitation was accepted', async () => {
        await invitedUser.post(`/groups/${guild._id}/join`);

        let inviter = await user.get('/user');
        let expectedData = {
          headerText: t('invitationAcceptedHeader'),
          bodyText: t('invitationAcceptedBody', {
            username: invitedUser.auth.local.username,
            groupName: guild.name,
          }),
        };

        expect(inviter.notifications[1].type).to.eql('GROUP_INVITE_ACCEPTED');
        expect(inviter.notifications[1].data).to.eql(expectedData);
      });

      it('awards Joined Guild achievement', async () => {
        await invitedUser.post(`/groups/${guild._id}/join`);

        await expect(invitedUser.get('/user')).to.eventually.have.deep.property('achievements.joinedGuild', true);
      });
    });
  });

  context('Joining a party', () => {
    let user, invitedUser, party;

    beforeEach(async () => {
      let { group, groupLeader, invitees } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Party',
          type: 'party',
        },
        members: 2,
        invites: 1,
      });

      party = group;
      user = groupLeader;
      invitedUser = invitees[0];
    });

    it('returns error when user is not invited to party', async () => {
      let userWithoutInvite = await generateUser();

      await expect(userWithoutInvite.post(`/groups/${party._id}/join`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageGroupRequiresInvite'),
      });
    });

    context('User is invited', () => {
      it('allows invited user to join party', async () => {
        await invitedUser.post(`/groups/${party._id}/join`);

        await expect(invitedUser.get('/user')).to.eventually.have.deep.property('party._id', party._id);
      });

      it('notifies inviting user that their invitation was accepted', async () => {
        await invitedUser.post(`/groups/${party._id}/join`);

        let inviter = await user.get('/user');

        let expectedData = {
          headerText: t('invitationAcceptedHeader'),
          bodyText: t('invitationAcceptedBody', {
            username: invitedUser.auth.local.username,
            groupName: party.name,
          }),
        };

        expect(inviter.notifications[0].type).to.eql('GROUP_INVITE_ACCEPTED');
        expect(inviter.notifications[0].data).to.eql(expectedData);
      });

      it('clears invitation from user when joining party', async () => {
        await invitedUser.post(`/groups/${party._id}/join`);

        await expect(invitedUser.get('/user')).to.eventually.not.have.deep.property('invitations.parties[0].id');
      });

      it('increments memberCount when joining party', async () => {
        let oldMemberCount = party.memberCount;

        await invitedUser.post(`/groups/${party._id}/join`);

        await expect(invitedUser.get(`/groups/${party._id}`)).to.eventually.have.property('memberCount', oldMemberCount + 1);
      });

      it('gives basilist quest item to the inviter when joining a party', async () => {
        await invitedUser.post(`/groups/${party._id}/join`);

        await expect(user.get('/user')).to.eventually.have.deep.property('items.quests.basilist', 1);
      });

      it('increments basilist quest item count to inviter when joining a party', async () => {
        await user.update({'items.quests.basilist': 1 });

        await invitedUser.post(`/groups/${party._id}/join`);

        await expect(user.get('/user')).to.eventually.have.deep.property('items.quests.basilist', 2);
      });

      it('deletes previous party where the user was the only member', async () => {
        let userToInvite = await generateUser();
        let oldParty = await userToInvite.post('/groups', { // add user to a party
          name: 'Another Test Party',
          type: 'party',
        });

        await expect(checkExistence('groups', oldParty._id)).to.eventually.equal(true);
        await user.post(`/groups/${party._id}/invite`, {
          uuids: [userToInvite._id],
        });
        await userToInvite.post(`/groups/${party._id}/join`);

        await expect(user.get('/user')).to.eventually.have.deep.property('party._id', party._id);
        await expect(checkExistence('groups', oldParty._id)).to.eventually.equal(false);
      });

      it('invites joining member to active quest', async () => {
        await user.update({
          [`items.quests.${PET_QUEST}`]: 1,
        });
        await user.post(`/groups/${party._id}/quests/invite/${PET_QUEST}`);

        await invitedUser.post(`/groups/${party._id}/join`);

        await invitedUser.sync();
        await party.sync();

        expect(invitedUser).to.have.deep.property('party.quest.RSVPNeeded', true);
        expect(invitedUser).to.have.deep.property('party.quest.key', party.quest.key);
        expect(party.quest.members[invitedUser._id]).to.be.null;
      });
    });
  });

  context('Party incentive achievements', () => {
    let leader, member, party;

    beforeEach(async () => {
      leader = await generateUser();
      member = await generateUser();
      party = await leader.post('/groups', {
        name: 'Testing Party',
        type: 'party',
      });
      await leader.post(`/groups/${party._id}/invite`, {
        uuids: [member._id],
      });
      await member.post(`/groups/${party._id}/join`);
    });

    it('awards Party Up achievement to party of size 2', async () => {
      await member.sync();
      await leader.sync();

      expect(member).to.have.deep.property('achievements.partyUp', true);
      expect(leader).to.have.deep.property('achievements.partyUp', true);
    });

    it('does not award Party On achievement to party of size 2', async () => {
      await member.sync();
      await leader.sync();

      expect(member).to.not.have.deep.property('achievements.partyOn');
      expect(leader).to.not.have.deep.property('achievements.partyOn');
    });

    it('awards Party On achievement to party of size 4', async () => {
      let addlMemberOne = await generateUser();
      let addlMemberTwo = await generateUser();
      await leader.post(`/groups/${party._id}/invite`, {
        uuids: [addlMemberOne._id, addlMemberTwo._id],
      });
      await addlMemberOne.post(`/groups/${party._id}/join`);
      await addlMemberTwo.post(`/groups/${party._id}/join`);

      await member.sync();
      await leader.sync();

      expect(member).to.have.deep.property('achievements.partyOn', true);
      expect(leader).to.have.deep.property('achievements.partyOn', true);
    });
  });
});
