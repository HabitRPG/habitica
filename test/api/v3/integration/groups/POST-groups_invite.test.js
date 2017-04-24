import {
  generateUser,
  generateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';
import nconf from 'nconf';

const INVITES_LIMIT = 100;
const PARTY_LIMIT_MEMBERS = 30;
const MAX_EMAIL_INVITES_BY_USER = 200;

describe('Post /groups/:groupId/invite', () => {
  let inviter;
  let group;
  let groupName = 'Test Public Guild';

  beforeEach(async () => {
    inviter = await generateUser({balance: 4});
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

    it('returns an error when a user has sent the max number of email invites', async () => {
      let inviterWithMax = await generateUser({
        invitesSent: MAX_EMAIL_INVITES_BY_USER,
        balance: 4,
      });
      let tmpGroup = await inviterWithMax.post('/groups', {
        name: groupName,
        type: 'guild',
      });

      await expect(inviterWithMax.post(`/groups/${tmpGroup._id}/invite`, {
        emails: [testInvite],
        inviter: 'inviter name',
      }))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('inviteLimitReached', {techAssistanceEmail: nconf.get('EMAILS:TECH_ASSISTANCE_EMAIL')}),
      });
    });

    it('invites a user to a group by email', async () => {
      let res = await inviter.post(`/groups/${group._id}/invite`, {
        emails: [testInvite],
        inviter: 'inviter name',
      });

      let updatedUser = await inviter.sync();

      expect(res).to.exist;
      expect(updatedUser.invitesSent).to.eql(1);
    });

    it('invites multiple users to a group by email', async () => {
      let res = await inviter.post(`/groups/${group._id}/invite`, {
        emails: [testInvite, {name: 'test2', email: 'test2@habitica.com'}],
      });

      let updatedUser = await inviter.sync();

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

    it('invites marks invite with cancelled plan', async () => {
      let cancelledPlanGroup = await generateGroup(inviter, {
        type: 'guild',
        name: generateUUID(),
      });
      await cancelledPlanGroup.createCancelledSubscription();

      let newUser = await generateUser();
      let invite = await inviter.post(`/groups/${cancelledPlanGroup._id}/invite`, {
        uuids: [newUser._id],
        emails: [{name: 'test', email: 'test@habitica.com'}],
      });
      let invitedUser = await newUser.get('/user');

      expect(invitedUser.invitations.guilds[0].id).to.equal(cancelledPlanGroup._id);
      expect(invitedUser.invitations.guilds[0].cancelledPlan).to.be.true;
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

    it('allows 30+ members in a guild', async () => {
      let invitesToGenerate = [];
      // Generate 30 users to invite (30 + leader = 31 members)
      for (let i = 0; i < PARTY_LIMIT_MEMBERS; i++) {
        invitesToGenerate.push(generateUser());
      }
      let generatedInvites = await Promise.all(invitesToGenerate);
      // Invite users
      expect(await inviter.post(`/groups/${group._id}/invite`, {
        uuids: generatedInvites.map(invite => invite._id),
      })).to.be.an('array');
    });

    // @TODO: Add this after we are able to mock the group plan route
    xit('returns an error when a non-leader invites to a group plan', async () => {
      let userToInvite = await generateUser();

      let nonGroupLeader = await generateUser();
      await inviter.post(`/groups/${group._id}/invite`, {
        uuids: [nonGroupLeader._id],
      });
      await nonGroupLeader.post(`/groups/${group._id}/join`);

      await expect(nonGroupLeader.post(`/groups/${group._id}/invite`, {
        uuids: [userToInvite._id],
      }))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyGroupLeaderCanInviteToGroupPlan'),
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
      expect((await userToInvite.get('/user')).invitations.parties[0].id).to.equal(party._id);
    });

    it('allow inviting a user to 2 different parties', async () => {
      // Create another inviter
      let inviter2 = await generateUser();

      // Create user to invite
      let userToInvite = await generateUser();

      // Create second group
      let party2 = await inviter2.post('/groups', {
        name: 'Test Party 2',
        type: 'party',
      });

      // Invite to first party
      await inviter.post(`/groups/${party._id}/invite`, {
        uuids: [userToInvite._id],
      });

      // Invite to second party
      await inviter2.post(`/groups/${party2._id}/invite`, {
        uuids: [userToInvite._id],
      });

      // Get updated user
      let invitedUser = await userToInvite.get('/user');

      expect(invitedUser.invitations.parties.length).to.equal(2);
      expect(invitedUser.invitations.parties[0].id).to.equal(party._id);
      expect(invitedUser.invitations.parties[1].id).to.equal(party2._id);
    });

    it('allow inviting a user if party id is not associated with a real party', async () => {
      let userToInvite = await generateUser({
        party: { _id: generateUUID() },
      });

      await inviter.post(`/groups/${party._id}/invite`, {
        uuids: [userToInvite._id],
      });
      expect((await userToInvite.get('/user')).invitations.parties[0].id).to.equal(party._id);
    });

    it('allows 30 members in a party', async () => {
      let invitesToGenerate = [];
      // Generate 29 users to invite (29 + leader = 30 members)
      for (let i = 0; i < PARTY_LIMIT_MEMBERS - 1; i++) {
        invitesToGenerate.push(generateUser());
      }
      let generatedInvites = await Promise.all(invitesToGenerate);
      // Invite users
      expect(await inviter.post(`/groups/${party._id}/invite`, {
        uuids: generatedInvites.map(invite => invite._id),
      })).to.be.an('array');
    });

    it('does not allow 30+ members in a party', async () => {
      let invitesToGenerate = [];
      // Generate 30 users to invite (30 + leader = 31 members)
      for (let i = 0; i < PARTY_LIMIT_MEMBERS; i++) {
        invitesToGenerate.push(generateUser());
      }
      let generatedInvites = await Promise.all(invitesToGenerate);
      // Invite users
      await expect(inviter.post(`/groups/${party._id}/invite`, {
        uuids: generatedInvites.map(invite => invite._id),
      }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('partyExceedsMembersLimit', {maxMembersParty: PARTY_LIMIT_MEMBERS}),
      });
    });
  });
});
