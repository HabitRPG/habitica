import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /group/:groupId/reject-invite', () => {
  context('Rejecting a public guild invite', () => {
    let publicGuild, invitedUser;

    beforeEach(async () => {
      let {group, invitees} = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Guild',
          type: 'guild',
          privacy: 'public',
        },
        invites: 1,
      });

      publicGuild = group;
      invitedUser = invitees[0];
    });

    it('returns error when user is not invited', async () => {
      let userWithoutInvite = await generateUser();

      await expect(userWithoutInvite.post(`/groups/${publicGuild._id}/reject-invite`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageGroupRequiresInvite'),
      });
    });

    it('clears invitation from user', async () => {
      await invitedUser.post(`/groups/${publicGuild._id}/reject-invite`);

      await expect(invitedUser.get('/user'))
        .to.eventually.have.deep.property('invitations.guilds')
        .to.not.include({id: publicGuild._id});
    });
  });

  context('Rejecting a private guild invite', () => {
    let invitedUser, guild;

    beforeEach(async () => {
      let { group, invitees } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Guild',
          type: 'guild',
          privacy: 'private',
        },
        invites: 1,
      });

      guild = group;
      invitedUser = invitees[0];
    });

    it('returns error when user is not invited', async () => {
      let userWithoutInvite = await generateUser();

      await expect(userWithoutInvite.post(`/groups/${guild._id}/reject-invite`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageGroupRequiresInvite'),
      });
    });

    it('clears invitation from user', async () => {
      await invitedUser.post(`/groups/${guild._id}/reject-invite`);

      await expect(invitedUser.get('/user'))
        .to.eventually.have.deep.property('invitations.guilds')
        .to.not.include({id: guild._id});
    });
  });

  context('Rejecting a party invite', () => {
    let invitedUser, party;

    beforeEach(async () => {
      let { group, invitees } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Party',
          type: 'party',
        },
        members: 2,
        invites: 1,
      });

      party = group;
      invitedUser = invitees[0];
    });

    it('returns error when user is not invited', async () => {
      let userWithoutInvite = await generateUser();

      await expect(userWithoutInvite.post(`/groups/${party._id}/reject-invite`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageGroupRequiresInvite'),
      });
    });

    it('clears invitation from user', async () => {
      await invitedUser.post(`/groups/${party._id}/reject-invite`);

      await expect(invitedUser.get('/user')).to.eventually.not.have.deep.property('invitations.parties[0].id');
    });
  });
});
