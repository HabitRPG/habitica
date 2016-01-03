import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';
describe('Post /groups/:groupId/invite', () => {
  let user;
  let group;

  beforeEach(async () => {
    user = await generateUser({balance: 1});
    let groupName = 'Test Public Guild';
    let groupType = 'guild';
    group = await user.post('/groups', {
      name: groupName,
      type: groupType,
    });
  });

  describe('user id invites', () => {
    it('returns an error when invited user is not found', async () => {
      let fakeID = 'fakeID';

      await expect(user.post(`/groups/${group._id}/invite`, {
        uuids: [fakeID],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('userWithIDNotFound', {userId: fakeID}),
      });
    });

    it('invites a user to a group by uuid', async () => {
      let newUser = await generateUser();
      let invite = await user.post(`/groups/${group._id}/invite`, {
        uuids: [newUser._id],
      });
      let invitedUser = await newUser.get('/user');

      expect(invite).to.exist;
      expect(invitedUser.invitations.guilds[0].id).to.equal(group._id);
    });

    it('invites multiple users to a group by uuid', async () => {
      let newUser = await generateUser();
      let newUser2 = await generateUser();
      let invite = await user.post(`/groups/${group._id}/invite`, {
        uuids: [newUser._id, newUser2._id],
      });
      let invitedUser = await newUser.get('/user');
      let invitedUser2 = await newUser2.get('/user');

      expect(invite).to.exist;
      expect(invitedUser.invitations.guilds[0].id).to.equal(group._id);
      expect(invitedUser2.invitations.guilds[0].id).to.equal(group._id);
    });
  });

  describe('email invites', () => {
    it('invites a user to a group by email', async () => {
      let invite = await user.post(`/groups/${group._id}/invite`, {
        emails: [{name: 'test', email: 'test@habitca.com'}],
      });

      expect(invite).to.exist;
    });

    it('invites multiple users to a group by email', async () => {
      let invite = await user.post(`/groups/${group._id}/invite`, {
        emails: [{name: 'test', email: 'test@habitca.com'}, {name: 'test2', email: 'test2@habitca.com'}],
      });

      expect(invite).to.exist;
    });

    it('returns an error when invite is missing an email', async () => {
      await expect(user.post(`/groups/${group._id}/invite`, {
        emails: [{name: 'test'}],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('inviteMissingEmail'),
      });
    });
  });

  describe('user and email invites', () => {
    it('returns an error when emails and uuids are not provided', async () => {
      await expect(user.post(`/groups/${group._id}/invite`))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('canOnlyInviteEmailUuid'),
      });
    });

    it('invites users to a group by uuid and email', async () => {
      let newUser = await generateUser();
      let invite = await user.post(`/groups/${group._id}/invite`, {
        uuids: [newUser._id],
        emails: [{name: 'test', email: 'test@habitca.com'}],
      });
      let invitedUser = await newUser.get('/user');

      expect(invite).to.exist;
      expect(invitedUser.invitations.guilds[0].id).to.equal(group._id);
    });
  });

  describe('guild invites', () => {
    it('returns an error when invited user is already in the group', async () => {
      let newUser = await generateUser();
      let invite = await user.post(`/groups/${group._id}/invite`, {
        uuids: [newUser._id],
      });
      let joinResult = await newUser.post(`/groups/${group._id}/join`);

      expect(invite).to.exist;
      expect(joinResult).to.exist;
      await expect(user.post(`/groups/${group._id}/invite`, {
        uuids: [newUser._id],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('userAlreadyInGroup'),
      });
    });

    it('returns an error when invited user is already invited to the group', async () => {
      let newUser = await generateUser();
      let invite = await user.post(`/groups/${group._id}/invite`, {
        uuids: [newUser._id],
      });

      expect(invite).to.exist;
      await expect(user.post(`/groups/${group._id}/invite`, {
        uuids: [newUser._id],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('userAlreadyInvitedToGroup'),
      });
    });
  });

  describe('party invites', () => {
    let party;
    let partyName = 'Test Party';
    let partyType = 'party';

    beforeEach(async () => {
      party = await user.post('/groups', {
        name: partyName,
        type: partyType,
      });
    });

    it('returns an error when invited user has a pending invitation to the party', async () => {
      let userToInvite = await generateUser();
      let invite = await user.post(`/groups/${party._id}/invite`, {
        uuids: [userToInvite._id],
      });

      expect(invite).to.exist;
      await expect(user.post(`/groups/${party._id}/invite`, {
        uuids: [userToInvite._id],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('userAlreadyPendingInvitation'),
      });
    });

    it('returns an error when invited user is already in the party', async () => {
      let userToInvite = await generateUser();
      let invite = await user.post(`/groups/${party._id}/invite`, {
        uuids: [userToInvite._id],
      });
      let joinResult = await userToInvite.post(`/groups/${party._id}/join`);

      expect(invite).to.exist;
      expect(joinResult).to.exist;
      await expect(user.post(`/groups/${party._id}/invite`, {
        uuids: [userToInvite._id],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('userAlreadyInAParty'),
      });
    });
  });
});
