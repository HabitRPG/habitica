import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /groups/:groupId/removeMember/:memberId', () => {
  let leader;
  let invitedUser;
  let guild;
  let member;
  let member2;

  before(async () => {
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

    it('returns an error when user is a non-leader member of a group', async () => {
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
    it('can remove other members', async () => {
      await leader.post(`/groups/${guild._id}/removeMember/${member._id}`);

      let memberRemoved = await member.get('/user');

      expect(_.findIndex(memberRemoved.guilds, {id: guild._id})).eql(-1);
    });

    it('can remove other invites', async () => {
      await leader.post(`/groups/${guild._id}/removeMember/${invitedUser._id}`);

      let invitedUserWithoutInvite = await invitedUser.get('/user');

      expect(_.findIndex(invitedUserWithoutInvite.invitations.guilds, {id: guild._id})).eql(-1);
    });
  });

  context('Party', () => {
    let party;
    let partyleader;
    let partyInvitedUser;
    let partyMember;

    before(async () => {
      let { group, groupLeader, invitees, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Party',
          type: 'party',
          privacy: 'private',
        },
        invites: 1,
        members: 1,
      });

      party = group;
      partyleader = groupLeader;
      partyInvitedUser = invitees[0];
      partyMember = members[0];
    });

    it('can remove other members', async () => {
      await partyleader.post(`/groups/${party._id}/removeMember/${partyMember._id}`);

      let memberRemoved = await partyMember.get('/user');

      expect(memberRemoved.party._id).eql(undefined);
    });

    it('can remove other invites', async () => {
      await partyleader.post(`/groups/${party._id}/removeMember/${partyInvitedUser._id}`);

      let invitedUserWithoutInvite = await partyInvitedUser.get('/user');

      expect(_.findIndex(invitedUserWithoutInvite.invitations.party, {id: party._id})).eql(-1);
    });
  });
});
