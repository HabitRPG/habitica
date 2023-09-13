import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { MAX_SUMMARY_SIZE_FOR_GUILDS } from '../../../../../website/common/script/constants';

describe('POST /group', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({ balance: 10 });
  });

  context('All Groups', () => {
    it('it returns validation error when type is not provided', async () => {
      await expect(
        user.post('/groups', { name: 'Test Group Without Type' }),
      ).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Group validation failed',
      });
    });

    it('it returns validation error when type is not supported', async () => {
      await expect(
        user.post('/groups', { name: 'Group with unsupported type', type: 'foo' }),
      ).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Group validation failed',
      });
    });

    it('sets the group leader to the user who created the group', async () => {
      const group = await user.post('/groups', {
        name: 'Test Party',
        type: 'party',
      });

      expect(group.leader).to.eql({
        _id: user._id,
        profile: {
          name: user.profile.name,
        },
      });
    });

    it('sets summary to groups name when not supplied', async () => {
      const name = 'Test Group';
      const group = await user.post('/groups', {
        name,
        type: 'party',
      });

      const updatedGroup = await user.get(`/groups/${group._id}`);

      expect(updatedGroup.summary).to.eql(name);
    });

    it('sets summary to groups', async () => {
      const name = 'Test Group';
      const summary = 'Test Summary';
      const group = await user.post('/groups', {
        name,
        type: 'party',
        summary,
      });

      const updatedGroup = await user.get(`/groups/${group._id}`);

      expect(updatedGroup.summary).to.eql(summary);
    });

    it('returns error when summary is longer than MAX_SUMMARY_SIZE_FOR_GUILDS characters', async () => {
      const name = 'Test Group';
      const summary = 'A'.repeat(MAX_SUMMARY_SIZE_FOR_GUILDS + 1);
      await expect(user.post('/groups', {
        name,
        type: 'party',
        summary,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });
  });

  context('Parties', () => {
    const partyName = 'Test Party';
    const partyType = 'party';

    it('creates a party', async () => {
      const party = await user.post('/groups', {
        name: partyName,
        type: partyType,
      });

      expect(party._id).to.exist;
      expect(party.name).to.equal(partyName);
      expect(party.type).to.equal(partyType);
      expect(party.memberCount).to.equal(1);
      expect(party.leader).to.eql({
        _id: user._id,
        profile: {
          name: user.profile.name,
        },
      });
    });

    it('creates a party when the user has no chat privileges', async () => {
      await user.update({ 'flags.chatRevoked': true });
      const party = await user.post('/groups', {
        name: partyName,
        type: partyType,
      });

      expect(party._id).to.exist;
    });

    it('does not require gems to create a party', async () => {
      await user.update({ balance: 0 });

      const party = await user.post('/groups', {
        name: partyName,
        type: partyType,
      });

      expect(party._id).to.exist;

      const updatedUser = await user.get('/user');

      expect(updatedUser.balance).to.eql(user.balance);
    });

    it('sets party id on user object', async () => {
      const party = await user.post('/groups', {
        name: partyName,
        type: partyType,
      });

      const updatedUser = await user.get('/user');

      expect(updatedUser.party._id).to.eql(party._id);
    });

    it('does not award Party Up achievement to solo partier', async () => {
      await user.post('/groups', {
        name: partyName,
        type: partyType,
      });

      const updatedUser = await user.get('/user');

      expect(updatedUser.achievements.partyUp).to.not.eql(true);
    });

    it('prevents user in a party from creating another party', async () => {
      await user.post('/groups', {
        name: partyName,
        type: partyType,
      });

      await expect(user.post('/groups')).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageGroupAlreadyInParty'),
      });
    });

    it('prevents creating a public party', async () => {
      await expect(user.post('/groups', {
        name: partyName,
        type: partyType,
        privacy: 'public',
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('partyMustbePrivate'),
      });
    });
  });
});
