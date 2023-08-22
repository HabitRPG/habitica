import { v4 as generateUUID } from 'uuid';
import nconf from 'nconf';
import {
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

const INVITES_LIMIT = 100;
const PARTY_LIMIT_MEMBERS = 29;
const MAX_EMAIL_INVITES_BY_USER = 200;

describe('Post /groups/:groupId/invite', () => {
  let inviter;
  let group;
  const groupName = 'Test Party';

  beforeEach(async () => {
    inviter = await generateUser({ balance: 4 });
    group = await inviter.post('/groups', {
      name: groupName,
      type: 'party',
    });
  });

  describe('username invites', () => {
    it('returns an error when invited user is not found', async () => {
      const fakeID = 'fakeuserid';

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        usernames: [fakeID],
      }))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('userWithUsernameNotFound', { username: fakeID }),
        });
    });

    it('returns an error when inviting yourself to a group', async () => {
      await expect(inviter.post(`/groups/${group._id}/invite`, {
        usernames: [inviter.auth.local.lowerCaseUsername],
      }))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('cannotInviteSelfToGroup'),
        });
    });

    it('returns error when recipient has blocked the senders', async () => {
      const inviterNoBlocks = await inviter.update({ 'inbox.blocks': [] });
      const userWithBlockedInviter = await generateUser({ 'inbox.blocks': [inviter._id] });
      await expect(inviterNoBlocks.post(`/groups/${group._id}/invite`, {
        usernames: [userWithBlockedInviter.auth.local.lowerCaseUsername],
      }))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('notAuthorizedToSendMessageToThisUser'),
        });
    });

    it('invites a user to a group by username', async () => {
      const userToInvite = await generateUser();

      const response = await inviter.post(`/groups/${group._id}/invite`, {
        usernames: [userToInvite.auth.local.lowerCaseUsername],
      });
      expect(response).to.be.an('Array');
      expect(response[0]).to.have.all.keys(['_id', 'id', 'name', 'inviter']);
      expect(response[0]._id).to.be.a('String');
      expect(response[0].id).to.eql(group._id);
      expect(response[0].name).to.eql(groupName);
      expect(response[0].inviter).to.eql(inviter._id);

      await expect(userToInvite.get('/user'))
        .to.eventually.have.nested.property('invitations.parties[0].id', group._id);
    });

    it('invites multiple users to a group by uuid', async () => {
      const userToInvite = await generateUser();
      const userToInvite2 = await generateUser();

      const response = await (inviter.post(`/groups/${group._id}/invite`, {
        usernames: [
          userToInvite.auth.local.lowerCaseUsername,
          userToInvite2.auth.local.lowerCaseUsername,
        ],
      }));
      expect(response).to.be.an('Array');
      expect(response[0]).to.have.all.keys(['_id', 'id', 'name', 'inviter']);
      expect(response[0]._id).to.be.a('String');
      expect(response[0].id).to.eql(group._id);
      expect(response[0].name).to.eql(groupName);
      expect(response[0].inviter).to.eql(inviter._id);
      expect(response[1]).to.have.all.keys(['_id', 'id', 'name', 'inviter']);
      expect(response[1]._id).to.be.a('String');
      expect(response[1].id).to.eql(group._id);
      expect(response[1].name).to.eql(groupName);
      expect(response[1].inviter).to.eql(inviter._id);

      await expect(userToInvite.get('/user')).to.eventually.have.nested.property('invitations.parties[0].id', group._id);
      await expect(userToInvite2.get('/user')).to.eventually.have.nested.property('invitations.parties[0].id', group._id);
    });
  });

  describe('user id invites', () => {
    it('returns an error when inviter has no chat privileges', async () => {
      const inviterMuted = await inviter.update({ 'flags.chatRevoked': true });
      const userToInvite = await generateUser();
      await expect(inviterMuted.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id],
      }))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('chatPrivilegesRevoked'),
        });
    });

    it('returns an error when invited user is not found', async () => {
      const fakeID = generateUUID();

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids: [fakeID],
      }))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('userWithIDNotFound', { userId: fakeID }),
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
      const fakeID = generateUUID();

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids: { fakeID },
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
          message: t('inviteMustNotBeEmpty'),
        });
    });

    it('returns an error when there are more than INVITES_LIMIT uuids', async () => {
      const uuids = [];

      for (let i = 0; i < 101; i += 1) {
        uuids.push(generateUUID());
      }

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids,
      }))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('canOnlyInviteMaxInvites', { maxInvites: INVITES_LIMIT }),
        });
    });

    it('returns error when recipient has blocked the senders', async () => {
      const inviterNoBlocks = await inviter.update({ 'inbox.blocks': [] });
      const userWithBlockedInviter = await generateUser({ 'inbox.blocks': [inviter._id] });
      await expect(inviterNoBlocks.post(`/groups/${group._id}/invite`, {
        uuids: [userWithBlockedInviter._id],
      }))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('notAuthorizedToSendMessageToThisUser'),
        });
    });

    it('invites a user to a group by uuid', async () => {
      const userToInvite = await generateUser();

      const response = await inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id],
      });
      expect(response).to.be.an('Array');
      expect(response[0]).to.have.all.keys(['_id', 'id', 'name', 'inviter']);
      expect(response[0]._id).to.be.a('String');
      expect(response[0].id).to.eql(group._id);
      expect(response[0].name).to.eql(groupName);
      expect(response[0].inviter).to.eql(inviter._id);

      await expect(userToInvite.get('/user'))
        .to.eventually.have.nested.property('invitations.parties[0].id', group._id);
    });

    it('invites multiple users to a group by uuid', async () => {
      const userToInvite = await generateUser();
      const userToInvite2 = await generateUser();

      const response = await inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id, userToInvite2._id],
      });

      expect(response).to.be.an('Array');
      expect(response[0]).to.have.all.keys(['_id', 'id', 'name', 'inviter']);
      expect(response[0]._id).to.be.a('String');
      expect(response[0].id).to.eql(group._id);
      expect(response[0].name).to.eql(groupName);
      expect(response[0].inviter).to.eql(inviter._id);
      expect(response[1]).to.have.all.keys(['_id', 'id', 'name', 'inviter']);
      expect(response[1]._id).to.be.a('String');
      expect(response[1].id).to.eql(group._id);
      expect(response[1].name).to.eql(groupName);
      expect(response[1].inviter).to.eql(inviter._id);

      await expect(userToInvite.get('/user')).to.eventually.have.nested.property('invitations.parties[0].id', group._id);
      await expect(userToInvite2.get('/user')).to.eventually.have.nested.property('invitations.parties[0].id', group._id);
    });

    it('returns an error when inviting multiple users and a user is not found', async () => {
      const userToInvite = await generateUser();
      const fakeID = generateUUID();

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id, fakeID],
      }))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('userWithIDNotFound', { userId: fakeID }),
        });
    });
  });

  describe('email invites', () => {
    const testInvite = { name: 'test', email: 'test@habitica.com' };

    it('returns an error when inviter has no chat privileges', async () => {
      const inviterMuted = await inviter.update({ 'flags.chatRevoked': true });
      await expect(inviterMuted.post(`/groups/${group._id}/invite`, {
        emails: [testInvite],
        inviter: 'inviter name',
      }))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('chatPrivilegesRevoked'),
        });
    });

    it('returns an error when invite is missing an email', async () => {
      await expect(inviter.post(`/groups/${group._id}/invite`, {
        emails: [{ name: 'test' }],
      }))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('inviteMissingEmail'),
        });
    });

    it('returns an error when emails is not an array', async () => {
      await expect(inviter.post(`/groups/${group._id}/invite`, {
        emails: { testInvite },
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
          message: t('inviteMustNotBeEmpty'),
        });
    });

    it('returns an error when there are more than INVITES_LIMIT emails', async () => {
      const emails = [];

      for (let i = 0; i < 101; i += 1) {
        emails.push(`${generateUUID()}@habitica.com`);
      }

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        emails,
      }))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('canOnlyInviteMaxInvites', { maxInvites: INVITES_LIMIT }),
        });
    });

    it('returns an error when a user has sent the max number of email invites', async () => {
      const inviterWithMax = await generateUser({
        invitesSent: MAX_EMAIL_INVITES_BY_USER,
        balance: 4,
      });

      await expect(inviterWithMax.post(`/groups/${group._id}/invite`, {
        emails: [testInvite],
        inviter: 'inviter name',
      }))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('inviteLimitReached', { techAssistanceEmail: nconf.get('EMAILS_TECH_ASSISTANCE_EMAIL') }),
        });
    });

    it('invites a user to a group by email', async () => {
      const res = await inviter.post(`/groups/${group._id}/invite`, {
        emails: [testInvite],
        inviter: 'inviter name',
      });

      const updatedUser = await inviter.sync();

      expect(res).to.exist;
      expect(updatedUser.invitesSent).to.eql(1);
    });

    it('invites multiple users to a group by email', async () => {
      const res = await inviter.post(`/groups/${group._id}/invite`, {
        emails: [testInvite, { name: 'test2', email: 'test2@habitica.com' }],
      });

      const updatedUser = await inviter.sync();

      expect(res).to.exist;
      expect(updatedUser.invitesSent).to.eql(2);
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
      const emails = [];
      const uuids = [];

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
          message: t('canOnlyInviteMaxInvites', { maxInvites: INVITES_LIMIT }),
        });
    });

    it('invites users to a group by uuid and email', async () => {
      const newUser = await generateUser();
      const invite = await inviter.post(`/groups/${group._id}/invite`, {
        uuids: [newUser._id],
        emails: [{ name: 'test', email: 'test@habitica.com' }],
      });
      const invitedUser = await newUser.get('/user');

      expect(invitedUser.invitations.parties[0].id).to.equal(group._id);
      expect(invite).to.exist;
    });

    it('invites user to group with cancelled plan', async () => {
      let cancelledPlanGroup;
      ({ group: cancelledPlanGroup, groupLeader: inviter } = await createAndPopulateGroup({
        upgradeToGroupPlan: true,
      }));
      await cancelledPlanGroup.createCancelledSubscription();

      const newUser = await generateUser();
      const invite = await inviter.post(`/groups/${cancelledPlanGroup._id}/invite`, {
        uuids: [newUser._id],
        emails: [{ name: 'test', email: 'test@habitica.com' }],
      });
      const invitedUser = await newUser.get('/user');

      expect(invitedUser.invitations.parties[0].id).to.equal(cancelledPlanGroup._id);
      expect(invitedUser.invitations.parties[0].cancelledPlan).to.be.true;
      expect(invite).to.exist;
    });
  });

  describe('party invites', () => {
    it('returns an error when inviter has no chat privileges', async () => {
      const inviterMuted = await inviter.update({ 'flags.chatRevoked': true });
      const userToInvite = await generateUser();
      await expect(inviterMuted.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id],
      }))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('chatPrivilegesRevoked'),
        });
    });

    it('returns an error when invited user has a pending invitation to the party', async () => {
      const userToInvite = await generateUser();
      await inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id],
      });

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id],
      }))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('userAlreadyPendingInvitation', { userId: userToInvite._id, username: userToInvite.profile.name }),
        });
    });

    it('returns an error when invited user is already in a party of more than 1 member', async () => {
      const userToInvite = await generateUser();
      const userToInvite2 = await generateUser();
      await inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id, userToInvite2._id],
      });
      await userToInvite.post(`/groups/${group._id}/join`);
      await userToInvite2.post(`/groups/${group._id}/join`);

      await expect(inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id],
      }))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('userAlreadyInAParty', { userId: userToInvite._id, username: userToInvite.profile.name }),
        });
    });

    it('allows inviting a user to 2 different parties', async () => {
      // Create another inviter
      const inviter2 = await generateUser();

      // Create user to invite
      const userToInvite = await generateUser();

      // Create second group
      const party2 = await inviter2.post('/groups', {
        name: 'Test Party 2',
        type: 'party',
      });

      // Invite to first party
      await inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id],
      });

      // Invite to second party
      await inviter2.post(`/groups/${party2._id}/invite`, {
        uuids: [userToInvite._id],
      });

      // Get updated user
      const invitedUser = await userToInvite.get('/user');

      expect(invitedUser.invitations.parties.length).to.equal(2);
      expect(invitedUser.invitations.parties[0].id).to.equal(group._id);
      expect(invitedUser.invitations.parties[1].id).to.equal(party2._id);
    });

    it('allows inviting a user if party id is not associated with a real party', async () => {
      const userToInvite = await generateUser({
        party: { _id: generateUUID() },
      });

      await inviter.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id],
      });
      expect((await userToInvite.get('/user')).invitations.parties[0].id).to.equal(group._id);
    });
  });

  describe('party size limits', () => {
    let partyLeader;

    beforeEach(async () => {
      ({ group, groupLeader: partyLeader } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Party',
          type: 'party',
          privacy: 'private',
        },
        // Generate party with 20 members
        members: PARTY_LIMIT_MEMBERS - 10,
      }));
    });

    it('allows 30 members in a party', async () => {
      const invitesToGenerate = [];
      // Generate 10 new invites
      for (let i = 1; i < 10; i += 1) {
        invitesToGenerate.push(generateUser());
      }
      const generatedInvites = await Promise.all(invitesToGenerate);
      // Invite users
      expect(await partyLeader.post(`/groups/${group._id}/invite`, {
        uuids: generatedInvites.map(invite => invite._id),
      })).to.be.an('array');
    }).timeout(10000);

    it('does not allow >30 members in a party', async () => {
      const invitesToGenerate = [];
      // Generate 11 invites
      for (let i = 1; i < 11; i += 1) {
        invitesToGenerate.push(generateUser());
      }
      const generatedInvites = await Promise.all(invitesToGenerate);
      // Invite users
      await expect(partyLeader.post(`/groups/${group._id}/invite`, {
        uuids: generatedInvites.map(invite => invite._id),
      }))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('partyExceedsMembersLimit', { maxMembersParty: PARTY_LIMIT_MEMBERS + 1 }),
        });
    }).timeout(10000);
  });
});
