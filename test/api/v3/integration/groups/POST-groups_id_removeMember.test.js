import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
  sleep,
} from '../../../../helpers/api-integration/v3';
import * as email from '../../../../../website/server/libs/email';

describe('POST /groups/:groupId/removeMember/:memberId', () => {
  let leader;
  let invitedUser;
  let guild;
  let member;
  let member2;
  let adminUser;

  beforeEach(async () => {
    const {
      group, groupLeader, invitees, members,
    } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
        privacy: 'private',
      },
      invites: 1,
      members: 2,
      upgradeToGroupPlan: true,
    });

    guild = group;
    leader = groupLeader;
    invitedUser = invitees[0]; // eslint-disable-line prefer-destructuring
    member = members[0]; // eslint-disable-line prefer-destructuring
    member2 = members[1]; // eslint-disable-line prefer-destructuring
    adminUser = await generateUser({ 'permissions.moderator': true });
  });

  context('All Groups', () => {
    it('returns an error when user is not member of the group', async () => {
      const nonMember = await generateUser();

      expect(nonMember.post(`/groups/${guild._id}/removeMember/${member._id}`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          type: 'NotAuthorized',
          message: t('onlyLeaderCanRemoveMember'),
        });
    });

    it('returns an error when user is a non-leader member of a group and not an admin', async () => {
      expect(member2.post(`/groups/${guild._id}/removeMember/${member._id}`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          type: 'NotAuthorized',
          message: t('onlyLeaderCanRemoveMember'),
        });
    });

    it('does not allow leader to remove themselves', async () => {
      expect(leader.post(`/groups/${guild._id}/removeMember/${leader._id}`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          text: t('messageGroupCannotRemoveSelf'),
        });
    });
  });

  context('Guilds', () => {
    beforeEach(() => {
      sandbox.spy(email, 'sendTxn');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('can remove other members', async () => {
      await leader.post(`/groups/${guild._id}/removeMember/${member._id}`);
      const memberRemoved = await member.get('/user');

      expect(memberRemoved.guilds.indexOf(guild._id)).eql(-1);
    });

    it('updates memberCount', async () => {
      const oldMemberCount = guild.memberCount;
      await leader.post(`/groups/${guild._id}/removeMember/${member._id}`);
      await expect(leader.get(`/groups/${guild._id}`)).to.eventually.have.property('memberCount', oldMemberCount - 1);
    });

    it('can remove other invites', async () => {
      await leader.post(`/groups/${guild._id}/removeMember/${invitedUser._id}`);

      const invitedUserWithoutInvite = await invitedUser.get('/user');

      expect(_.findIndex(invitedUserWithoutInvite.invitations.guilds, { id: guild._id })).eql(-1);
    });

    it('allows an admin to remove other members', async () => {
      await adminUser.post(`/groups/${guild._id}/removeMember/${member._id}`);
      const memberRemoved = await member.get('/user');

      expect(memberRemoved.guilds.indexOf(guild._id)).eql(-1);
    });

    it('allows an admin to remove other invites', async () => {
      await adminUser.post(`/groups/${guild._id}/removeMember/${invitedUser._id}`);

      const invitedUserWithoutInvite = await invitedUser.get('/user');

      expect(_.findIndex(invitedUserWithoutInvite.invitations.guilds, { id: guild._id })).eql(-1);
    });

    it('does not allow an admin to remove a leader', async () => {
      expect(adminUser.post(`/groups/${guild._id}/removeMember/${leader._id}`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          text: t('cannotRemoveCurrentLeader'),
        });
    });

    it('sends email to user with rescinded invite', async () => {
      await leader.post(`/groups/${guild._id}/removeMember/${invitedUser._id}`);

      expect(email.sendTxn).to.be.calledOnce;
      expect(email.sendTxn.args[0][0]._id).to.eql(invitedUser._id);
      expect(email.sendTxn.args[0][1]).to.eql('guild-invite-rescinded');
    });

    it('sends email to removed user', async () => {
      await leader.post(`/groups/${guild._id}/removeMember/${member._id}`);

      expect(email.sendTxn).to.be.calledTwice;
      expect(email.sendTxn.args[0][0]._id).to.eql(member._id);
      expect(email.sendTxn.args[0][1]).to.eql('kicked-from-guild');
      expect(email.sendTxn.args[1][0]._id).to.eql(member._id);
      expect(email.sendTxn.args[1][1]).to.eql('group-member-removed');
    });
  });

  context('Party', () => {
    let party;
    let partyLeader;
    let partyInvitedUser;
    let partyMember;
    let removedMember;

    beforeEach(async () => {
      const {
        group, groupLeader, invitees, members,
      } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Party',
          type: 'party',
          privacy: 'private',
        },
        invites: 1,
        members: 2,
        leaderDetails: { 'auth.timestamps.created': new Date('2022-01-01') },
      });

      party = group;
      partyLeader = groupLeader;
      partyInvitedUser = invitees[0]; // eslint-disable-line prefer-destructuring
      partyMember = members[0]; // eslint-disable-line prefer-destructuring
      removedMember = members[1]; // eslint-disable-line prefer-destructuring
      sandbox.spy(email, 'sendTxn');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('can remove other members', async () => {
      await partyLeader.post(`/groups/${party._id}/removeMember/${partyMember._id}`);

      const memberRemoved = await partyMember.get('/user');

      expect(memberRemoved.party._id).eql(undefined);
    });

    it('updates memberCount', async () => {
      const oldMemberCount = party.memberCount;
      await partyLeader.post(`/groups/${party._id}/removeMember/${partyMember._id}`);
      await expect(partyLeader.get(`/groups/${party._id}`)).to.eventually.have.property('memberCount', oldMemberCount - 1);
    });

    it('can remove other invites', async () => {
      expect(partyInvitedUser.invitations.parties[0]).to.not.be.empty;

      await partyLeader.post(`/groups/${party._id}/removeMember/${partyInvitedUser._id}`);

      const invitedUserWithoutInvite = await partyInvitedUser.get('/user');

      expect(invitedUserWithoutInvite.invitations.parties[0]).to.be.undefined;
    });

    it('removes new messages from a member who is removed', async () => {
      await partyLeader.post(`/groups/${party._id}/chat`, { message: 'Some message' });
      await sleep(0.5);
      await removedMember.sync();

      expect(removedMember.notifications.find(n => n.type === 'NEW_CHAT_MESSAGE' && n.data.group.id === party._id)).to.exist;
      expect(removedMember.newMessages[party._id]).to.not.be.empty;

      await partyLeader.post(`/groups/${party._id}/removeMember/${removedMember._id}`);
      await removedMember.sync();

      expect(removedMember.notifications.find(n => n.type === 'NEW_CHAT_MESSAGE' && n.data.group.id === party._id)).to.not.exist;
      expect(removedMember.newMessages[party._id]).to.be.undefined;
    });

    it('removes user from quest when removing user from party after quest starts', async () => {
      const petQuest = 'whale';
      await partyLeader.update({
        [`items.quests.${petQuest}`]: 1,
      });

      await partyLeader.post(`/groups/${party._id}/quests/invite/${petQuest}`);
      await partyMember.post(`/groups/${party._id}/quests/accept`);

      await party.sync();

      expect(party.quest.members[partyLeader._id]).to.be.true;
      expect(party.quest.members[partyMember._id]).to.be.true;

      await partyLeader.post(`/groups/${party._id}/removeMember/${partyMember._id}`);

      await party.sync();

      expect(party.quest.members[partyLeader._id]).to.be.true;
      expect(party.quest.members[partyMember._id]).to.not.exist;
    });

    it('removes user from quest when removing user from party before quest starts', async () => {
      const petQuest = 'whale';
      await partyLeader.update({
        [`items.quests.${petQuest}`]: 1,
      });
      await partyInvitedUser.post(`/groups/${party._id}/join`);
      await partyLeader.post(`/groups/${party._id}/quests/invite/${petQuest}`);
      await partyMember.post(`/groups/${party._id}/quests/accept`);

      await party.sync();

      expect(party.quest.active).to.be.false;
      expect(party.quest.members[partyLeader._id]).to.be.true;
      expect(party.quest.members[partyMember._id]).to.be.true;

      await partyLeader.post(`/groups/${party._id}/removeMember/${partyMember._id}`);

      await party.sync();

      expect(party.quest.members[partyLeader._id]).to.be.true;
      expect(party.quest.members[partyMember._id]).to.not.exist;
    });

    it('prevents user from being removed if they are the quest owner', async () => {
      const petQuest = 'whale';
      await partyMember.update({
        [`items.quests.${petQuest}`]: 1,
      });

      await partyMember.post(`/groups/${party._id}/quests/invite/${petQuest}`);
      await partyLeader.post(`/groups/${party._id}/quests/accept`);

      await party.sync();

      expect(party.quest.members[partyLeader._id]).to.be.true;
      expect(party.quest.members[partyMember._id]).to.be.true;

      await party.sync();

      expect(leader.post(`/groups/${party._id}/removeMember/${partyMember._id}`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          text: t('cannotRemoveQuestOwner'),
        });
    });

    it('sends email to user with rescinded invite', async () => {
      await partyLeader.post(`/groups/${party._id}/removeMember/${partyInvitedUser._id}`);

      expect(email.sendTxn).to.be.calledOnce;
      expect(email.sendTxn.args[0][0]._id).to.eql(partyInvitedUser._id);
      expect(email.sendTxn.args[0][1]).to.eql('party-invite-rescinded');
    });

    it('sends email to removed user', async () => {
      await partyLeader.post(`/groups/${party._id}/removeMember/${partyMember._id}`);

      expect(email.sendTxn).to.be.calledOnce;
      expect(email.sendTxn.args[0][0]._id).to.eql(partyMember._id);
      expect(email.sendTxn.args[0][1]).to.eql('kicked-from-party');
    });
  });
});
