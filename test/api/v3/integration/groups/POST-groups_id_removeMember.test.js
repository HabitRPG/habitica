import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import * as email from '../../../../../website/server/libs/email';

describe('POST /groups/:groupId/removeMember/:memberId', () => {
  let leader;
  let invitedUser;
  let guild;
  let member;
  let member2;
  let adminUser;

  beforeEach(async () => {
    let { group, groupLeader, invitees, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
        privacy: 'private',
      },
      invites: 1,
      members: 2,
    });

    guild = group;
    leader = groupLeader;
    invitedUser = invitees[0];
    member = members[0];
    member2 = members[1];
    adminUser = await generateUser({ 'contributor.admin': true });
  });

  context('All Groups', () => {
    it('returns an error when user is not member of the group', async () => {
      let nonMember = await generateUser();

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
      let memberRemoved = await member.get('/user');

      expect(memberRemoved.guilds.indexOf(guild._id)).eql(-1);
    });

    it('updates memberCount', async () => {
      let oldMemberCount = guild.memberCount;
      await leader.post(`/groups/${guild._id}/removeMember/${member._id}`);
      await expect(leader.get(`/groups/${guild._id}`)).to.eventually.have.property('memberCount', oldMemberCount - 1);
    });

    it('can remove other invites', async () => {
      await leader.post(`/groups/${guild._id}/removeMember/${invitedUser._id}`);

      let invitedUserWithoutInvite = await invitedUser.get('/user');

      expect(_.findIndex(invitedUserWithoutInvite.invitations.guilds, { id: guild._id })).eql(-1);
    });

    it('allows an admin to remove other members', async () => {
      await adminUser.post(`/groups/${guild._id}/removeMember/${member._id}`);
      let memberRemoved = await member.get('/user');

      expect(memberRemoved.guilds.indexOf(guild._id)).eql(-1);
    });

    it('allows an admin to remove other invites', async () => {
      await adminUser.post(`/groups/${guild._id}/removeMember/${invitedUser._id}`);

      let invitedUserWithoutInvite = await invitedUser.get('/user');

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
      expect(email.sendTxn.args[0][0]._id).to.be.eql(invitedUser._id);
      expect(email.sendTxn.args[0][1]).to.be.eql('guild-invite-rescinded');
    });

    it('sends email to removed user', async () => {
      await leader.post(`/groups/${guild._id}/removeMember/${member._id}`);

      expect(email.sendTxn).to.be.calledOnce;
      expect(email.sendTxn.args[0][0]._id).to.be.eql(member._id);
      expect(email.sendTxn.args[0][1]).to.be.eql('kicked-from-guild');
    });
  });

  context('Party', () => {
    let party;
    let partyLeader;
    let partyInvitedUser;
    let partyMember;
    let removedMember;

    beforeEach(async () => {
      let { group, groupLeader, invitees, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Party',
          type: 'party',
          privacy: 'private',
        },
        invites: 1,
        members: 2,
      });

      party = group;
      partyLeader = groupLeader;
      partyInvitedUser = invitees[0];
      partyMember = members[0];
      removedMember = members[1];
      sandbox.spy(email, 'sendTxn');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('can remove other members', async () => {
      await partyLeader.post(`/groups/${party._id}/removeMember/${partyMember._id}`);

      let memberRemoved = await partyMember.get('/user');

      expect(memberRemoved.party._id).eql(undefined);
    });

    it('updates memberCount', async () => {
      let oldMemberCount = party.memberCount;
      await partyLeader.post(`/groups/${party._id}/removeMember/${partyMember._id}`);
      await expect(partyLeader.get(`/groups/${party._id}`)).to.eventually.have.property('memberCount', oldMemberCount - 1);
    });

    it('can remove other invites', async () => {
      expect(partyInvitedUser.invitations.parties[0]).to.not.be.empty;

      await partyLeader.post(`/groups/${party._id}/removeMember/${partyInvitedUser._id}`);

      let invitedUserWithoutInvite = await partyInvitedUser.get('/user');

      expect(invitedUserWithoutInvite.invitations.parties[0]).to.be.empty;
    });

    it('removes new messages from a member who is removed', async () => {
      await partyLeader.post(`/groups/${party._id}/chat`, { message: 'Some message' });
      await removedMember.sync();

      expect(removedMember.newMessages[party._id]).to.not.be.empty;

      await partyLeader.post(`/groups/${party._id}/removeMember/${removedMember._id}`);
      await removedMember.sync();

      expect(removedMember.newMessages[party._id]).to.be.empty;
    });

    it('removes user from quest when removing user from party after quest starts', async () => {
      let petQuest = 'whale';
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
      let petQuest = 'whale';
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

    it('sends email to user with rescinded invite', async () => {
      await partyLeader.post(`/groups/${party._id}/removeMember/${partyInvitedUser._id}`);

      expect(email.sendTxn).to.be.calledOnce;
      expect(email.sendTxn.args[0][0]._id).to.be.eql(partyInvitedUser._id);
      expect(email.sendTxn.args[0][1]).to.be.eql('party-invite-rescinded');
    });

    it('sends email to removed user', async () => {
      await partyLeader.post(`/groups/${party._id}/removeMember/${partyMember._id}`);

      expect(email.sendTxn).to.be.calledOnce;
      expect(email.sendTxn.args[0][0]._id).to.be.eql(partyMember._id);
      expect(email.sendTxn.args[0][1]).to.be.eql('kicked-from-party');
    });
  });
});
