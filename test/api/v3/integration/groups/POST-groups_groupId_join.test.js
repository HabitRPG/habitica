import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /group/:groupId/join', () => {
  const PET_QUEST = 'whale';

  it('returns error when groupId is not for a valid group', async () => {
    const joiningUser = await generateUser();

    await expect(joiningUser.post(`/groups/${generateUUID()}/join`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  context('Joining a private guild', () => {
    let user;
    let invitedUser;
    let guild;
    let invitees;

    beforeEach(async () => {
      ({ group: guild, groupLeader: user, invitees } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Guild',
          type: 'guild',
          privacy: 'private',
        },
        invites: 1,
        upgradeToGroupPlan: true,
      }));

      [invitedUser] = invitees;
    });

    it('returns error when user is not invited to private guild', async () => {
      const userWithoutInvite = await generateUser();

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
          .to.eventually.have.nested.property('invitations.guilds')
          .to.not.include({ id: guild._id });
      });

      it('increments memberCount when joining guilds', async () => {
        const oldMemberCount = guild.memberCount;

        await invitedUser.post(`/groups/${guild._id}/join`);

        await expect(invitedUser.get(`/groups/${guild._id}`)).to.eventually.have.property('memberCount', oldMemberCount + 1);
      });

      it('does not give basilist quest to inviter when joining a guild', async () => {
        await invitedUser.post(`/groups/${guild._id}/join`);

        await expect(user.get('/user')).to.eventually.not.have.nested.property('items.quests.basilist');
      });

      it('does not increment basilist quest count to inviter with basilist when joining a guild', async () => {
        await user.update({ 'items.quests.basilist': 1 });

        await invitedUser.post(`/groups/${guild._id}/join`);

        await expect(user.get('/user')).to.eventually.have.nested.property('items.quests.basilist', 1);
      });

      it('notifies inviting user that their invitation was accepted', async () => {
        await invitedUser.post(`/groups/${guild._id}/join`);

        const inviter = await user.get('/user');
        const expectedData = {
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

        await expect(invitedUser.get('/user')).to.eventually.have.nested.property('achievements.joinedGuild', true);
      });
    });
  });

  context('Joining a party', () => {
    let user; let invitedUser; let
      party;

    beforeEach(async () => {
      const { group, groupLeader, invitees } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Party',
          type: 'party',
        },
        members: 2,
        invites: 1,
      });

      party = group;
      user = groupLeader;
      [invitedUser] = invitees;
    });

    it('returns error when user is not invited to party', async () => {
      const userWithoutInvite = await generateUser();

      await expect(userWithoutInvite.post(`/groups/${party._id}/join`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageGroupRequiresInvite'),
      });
    });

    context('User is invited', () => {
      it('allows invited user to join party', async () => {
        await invitedUser.post(`/groups/${party._id}/join`);

        await expect(invitedUser.get('/user')).to.eventually.have.nested.property('party._id', party._id);
      });

      it('Issue #12291: accepting a redundant party invite will let the user stay in the party', async () => {
        await invitedUser.update({
          'party._id': party._id,
        });
        await expect(invitedUser.get('/user')).to.eventually.have.nested.property('party._id', party._id);
        await invitedUser.post(`/groups/${party._id}/join`);

        await expect(invitedUser.get('/user')).to.eventually.have.nested.property('party._id', party._id);
      });

      it('notifies inviting user that their invitation was accepted', async () => {
        await invitedUser.post(`/groups/${party._id}/join`);

        const inviter = await user.get('/user');

        const expectedData = {
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

        await expect(invitedUser.get('/user')).to.eventually.not.have.nested.property('invitations.parties[0].id');
      });

      it('increments memberCount when joining party', async () => {
        const oldMemberCount = party.memberCount;

        await invitedUser.post(`/groups/${party._id}/join`);

        await expect(invitedUser.get(`/groups/${party._id}`)).to.eventually.have.property('memberCount', oldMemberCount + 1);
      });

      it('gives basilist quest item to the inviter when joining a party', async () => {
        await invitedUser.post(`/groups/${party._id}/join`);

        await expect(user.get('/user')).to.eventually.have.nested.property('items.quests.basilist', 1);
      });

      it('increments basilist quest item count to inviter when joining a party', async () => {
        await user.update({ 'items.quests.basilist': 1 });

        await invitedUser.post(`/groups/${party._id}/join`);

        await expect(user.get('/user')).to.eventually.have.nested.property('items.quests.basilist', 2);
      });

      it('invites joining member to active quest', async () => {
        await user.update({
          [`items.quests.${PET_QUEST}`]: 1,
        });
        await user.post(`/groups/${party._id}/quests/invite/${PET_QUEST}`);

        await invitedUser.post(`/groups/${party._id}/join`);

        await invitedUser.sync();
        await party.sync();

        expect(invitedUser).to.have.nested.property('party.quest.RSVPNeeded', true);
        expect(invitedUser).to.have.nested.property('party.quest.key', party.quest.key);
        expect(party.quest.members[invitedUser._id]).to.be.null;
      });
    });
  });

  context('Party incentive achievements', () => {
    let leader; let member; let
      party;

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

      expect(member).to.have.nested.property('achievements.partyUp', true);
      expect(member.notifications.find(notification => notification.type === 'ACHIEVEMENT_PARTY_UP')).to.exist;
      expect(leader).to.have.nested.property('achievements.partyUp', true);
      expect(leader.notifications.find(notification => notification.type === 'ACHIEVEMENT_PARTY_UP')).to.exist;
    });

    it('does not award Party On achievement to party of size 2', async () => {
      await member.sync();
      await leader.sync();

      expect(member).to.not.have.nested.property('achievements.partyOn');
      expect(leader).to.not.have.nested.property('achievements.partyOn');
    });

    it('awards Party On achievement to party of size 4', async () => {
      const addlMemberOne = await generateUser();
      const addlMemberTwo = await generateUser();
      await leader.post(`/groups/${party._id}/invite`, {
        uuids: [addlMemberOne._id, addlMemberTwo._id],
      });
      await addlMemberOne.post(`/groups/${party._id}/join`);
      await addlMemberTwo.post(`/groups/${party._id}/join`);

      await member.sync();
      await leader.sync();

      expect(member).to.have.nested.property('achievements.partyOn', true);
      expect(member.notifications.find(notification => notification.type === 'ACHIEVEMENT_PARTY_ON')).to.exist;
      expect(leader).to.have.nested.property('achievements.partyOn', true);
      expect(leader.notifications.find(notification => notification.type === 'ACHIEVEMENT_PARTY_ON')).to.exist;
    });
  });
});
