import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

const INVITES_LIMIT = 100;

describe('Post /groups/:groupId/invite', () => {
  let inviter;
  let group;
  let groupName = 'Test Public Guild';

  beforeEach(async () => {
    inviter = await generateUser({balance: 1});
    group = await inviter.post('/groups', {
      name: groupName,
      type: 'guild',
    });
  });

  describe('user id invites', () => {
    it('returns an error when invited user is not found', async () => {
      let fakeID = generateUUID();

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids: [fakeID],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('userWithIDNotFound', {userId: fakeID}),
      });
    });

    it('returns an error when inviting yourself to a group', async () => {
      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids: [inviter._id],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('cannotInviteSelfToGroup'),
      });
    });

    it('returns an error when uuids is not an array', async () => {
      let fakeID = generateUUID();

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids: {fakeID},
      }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('uuidsMustBeAnArray'),
      });
    });

    it('returns an error when uuids and emails are empty', async () => {
      await expect(inviter.post(`/groups/${group._id}/invite`, {
        emails: [],
        uuids: [],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('inviteMustNotBeEmpty'),
      });
    });

    it('returns an error when uuids is empty and emails is not passed', async () => {
      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids: [],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('inviteMissingUuid'),
      });
    });

    it('returns an error when there are more than INVITES_LIMIT uuids', async () => {
      let uuids = [];

      for (let i = 0; i < 101; i += 1) {
        uuids.push(generateUUID());
      }

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids,
      }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('canOnlyInviteMaxInvites', {maxInvites: INVITES_LIMIT}),
      });
    });

    it('invites a user to a group by uuid', async () => {
      let userToInvite = await generateUser();

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id],
      })).to.eventually.deep.equal([{
        id: group._id,
        name: groupName,
        inviter: inviter._id,
      }]);

      await expect(userToInvite.get('/user'))
        .to.eventually.have.deep.property('invitations.guilds[0].id', group._id);
    });

    it('invites multiple users to a group by uuid', async () => {
      let userToInvite = await generateUser();
      let userToInvite2 = await generateUser();

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id, userToInvite2._id],
      })).to.eventually.deep.equal([
        {
          id: group._id,
          name: groupName,
          inviter: inviter._id,
        },
        {
          id: group._id,
          name: groupName,
          inviter: inviter._id,
        },
      ]);

      await expect(userToInvite.get('/user')).to.eventually.have.deep.property('invitations.guilds[0].id', group._id);
      await expect(userToInvite2.get('/user')).to.eventually.have.deep.property('invitations.guilds[0].id', group._id);
    });

    it('returns an error when inviting multiple users and a user is not found', async () => {
      let userToInvite = await generateUser();
      let fakeID = generateUUID();

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id, fakeID],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('userWithIDNotFound', {userId: fakeID}),
      });
    });
  });

  describe('email invites', () => {
    let testInvite = {name: 'test', email: 'test@habitica.com'};

    it('returns an error when invite is missing an email', async () => {
      await expect(inviter.post(`/groups/${group._id}/invite`, {
        emails: [{name: 'test'}],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('inviteMissingEmail'),
      });
    });

    it('returns an error when emails is not an array', async () => {
      await expect(inviter.post(`/groups/${group._id}/invite`, {
        emails: {testInvite},
      }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('emailsMustBeAnArray'),
      });
    });

    it('returns an error when emails is empty and uuids is not passed', async () => {
      await expect(inviter.post(`/groups/${group._id}/invite`, {
        emails: [],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('inviteMissingEmail'),
      });
    });

    it('returns an error when there are more than INVITES_LIMIT emails', async () => {
      let emails = [];

      for (let i = 0; i < 101; i += 1) {
        emails.push(`${generateUUID()}@habitica.com`);
      }

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        emails,
      }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('canOnlyInviteMaxInvites', {maxInvites: INVITES_LIMIT}),
      });
    });

    it('invites a user to a group by email', async () => {
      let res = await inviter.post(`/groups/${group._id}/invite`, {
        emails: [testInvite],
        inviter: 'inviter name',
      });

      expect(res).to.exist;
    });

    it('invites multiple users to a group by email', async () => {
      let res = await inviter.post(`/groups/${group._id}/invite`, {
        emails: [testInvite, {name: 'test2', email: 'test2@habitica.com'}],
      });

      expect(res).to.exist;
    });
  });

  describe('user and email invites', () => {
    it('returns an error when emails and uuids are not provided', async () => {
      await expect(inviter.post(`/groups/${group._id}/invite`))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('canOnlyInviteEmailUuid'),
      });
    });

    it('returns an error when there are more than INVITES_LIMIT uuids and emails', async () => {
      let emails = [];
      let uuids = [];

      for (let i = 0; i < 50; i += 1) {
        emails.push(`${generateUUID()}@habitica.com`);
      }

      for (let i = 0; i < 51; i += 1) {
        uuids.push(generateUUID());
      }

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        emails,
        uuids,
      }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('canOnlyInviteMaxInvites', {maxInvites: INVITES_LIMIT}),
      });
    });

    it('invites users to a group by uuid and email', async () => {
      let newUser = await generateUser();
      let invite = await inviter.post(`/groups/${group._id}/invite`, {
        uuids: [newUser._id],
        emails: [{name: 'test', email: 'test@habitica.com'}],
      });
      let invitedUser = await newUser.get('/user');

      expect(invitedUser.invitations.guilds[0].id).to.equal(group._id);
      expect(invite).to.exist;
    });
  });

  describe('guild invites', () => {
    it('returns an error when invited user is already invited to the group', async () => {
      let userToInivite = await generateUser();
      await inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInivite._id],
      });

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInivite._id],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('userAlreadyInvitedToGroup'),
      });
    });

    it('returns an error when invited user is already in the group', async () => {
      let userToInvite = await generateUser();
      await inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id],
      });
      await userToInvite.post(`/groups/${group._id}/join`);

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('userAlreadyInGroup'),
      });
    });
  });

  describe('party invites', () => {
    let party;

    beforeEach(async () => {
      party = await inviter.post('/groups', {
        name: 'Test Party',
        type: 'party',
      });
    });

    it('returns an error when invited user has a pending invitation to the party', async () => {
      let userToInvite = await generateUser();
      await inviter.post(`/groups/${party._id}/invite`, {
        uuids: [userToInvite._id],
      });

      await expect(inviter.post(`/groups/${party._id}/invite`, {
        uuids: [userToInvite._id],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('userAlreadyPendingInvitation'),
      });
    });

    it('returns an error when invited user is already in a party of more than 1 member', async () => {
      let userToInvite = await generateUser();
      let userToInvite2 = await generateUser();
      await inviter.post(`/groups/${party._id}/invite`, {
        uuids: [userToInvite._id, userToInvite2._id],
      });
      await userToInvite.post(`/groups/${party._id}/join`);
      await userToInvite2.post(`/groups/${party._id}/join`);

      await expect(inviter.post(`/groups/${party._id}/invite`, {
        uuids: [userToInvite._id],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('userAlreadyInAParty'),
      });
    });

    it('allow inviting a user to a party if they are partying solo', async () => {
      let userToInvite = await generateUser();
      await userToInvite.post('/groups', { // add user to a party
        name: 'Another Test Party',
        type: 'party',
      });

      await inviter.post(`/groups/${party._id}/invite`, {
        uuids: [userToInvite._id],
      });
      expect((await userToInvite.get('/user')).invitations.party.id).to.equal(party._id);
    });

    it('allow inviting a user if party id is not associated with a real party', async () => {
      let userToInvite = await generateUser({
        party: { _id: generateUUID() },
      });

      await inviter.post(`/groups/${party._id}/invite`, {
        uuids: [userToInvite._id],
      });
      expect((await userToInvite.get('/user')).invitations.party.id).to.equal(party._id);
    });
  });
});
