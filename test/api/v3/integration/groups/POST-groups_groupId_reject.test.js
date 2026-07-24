import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /group/:groupId/reject-invite', () => {
  context('Rejecting a private guild invite', () => {
    let invitedUser; let
      guild;

    beforeEach(async () => {
      const { group, invitees } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Guild',
          type: 'guild',
          privacy: 'private',
        },
        invites: 1,
        upgradeToGroupPlan: true,
      });

      guild = group;
      invitedUser = invitees[0]; // eslint-disable-line prefer-destructuring
    });

    it('returns error when user is not invited', async () => {
      const userWithoutInvite = await generateUser();

      await expect(userWithoutInvite.post(`/groups/${guild._id}/reject-invite`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageGroupRequiresInvite'),
      });
    });

    it('clears invitation from user', async () => {
      await invitedUser.post(`/groups/${guild._id}/reject-invite`);

      await expect(invitedUser.get('/user'))
        .to.eventually.have.nested.property('invitations.guilds')
        .to.not.include({ id: guild._id });
    });
  });

  context('Rejecting a party invite', () => {
    let invitedUser; let
      party;

    beforeEach(async () => {
      const { group, invitees } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Party',
          type: 'party',
        },
        members: 2,
        invites: 1,
      });

      party = group;
      invitedUser = invitees[0]; // eslint-disable-line prefer-destructuring
    });

    it('returns error when user is not invited', async () => {
      const userWithoutInvite = await generateUser();

      await expect(userWithoutInvite.post(`/groups/${party._id}/reject-invite`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageGroupRequiresInvite'),
      });
    });

    it('clears invitation from user', async () => {
      await invitedUser.post(`/groups/${party._id}/reject-invite`);

      await expect(invitedUser.get('/user')).to.eventually.not.have.nested.property('invitations.parties[0].id');
    });
  });
});
