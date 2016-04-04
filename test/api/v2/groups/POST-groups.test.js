import {
  generateGroup,
  generateUser,
  translate as t,
} from '../../../helpers/api-integration/v2';

describe('POST /groups', () => {
  context('All groups', () => {
    let leader;

    beforeEach(async () => {
      leader = await generateUser();
    });

    xit('returns defaults? (TODO: it\'s possible to create a group without a type. Should the group default to party? Should we require type to be set?', async () => {
      return leader.post('/groups').then((group) => {
        expect(group._id).to.exist;
        expect(group.name).to.eql(`${leader.profile.name}'s group`);
        expect(group.type).to.eql('party');
        expect(group.privacy).to.eql('private');
      });
    });

    it('returns a group object', async () => {
      let group = await leader.post('/groups', {
        name: 'Test Group',
        type: 'party',
        leaderOnly: { challenges: true },
        description: 'Test Group Description',
        leaderMessage: 'Test Group Message',
      });

      expect(group._id).to.exist;
      expect(group.leader).to.eql(leader._id);
      expect(group.name).to.eql(group.name);
      expect(group.description).to.eql(group.description);
      expect(group.leaderMessage).to.eql(group.leaderMessage);
      expect(group.leaderOnly).to.eql(group.leaderOnly);
      expect(group.memberCount).to.eql(1);
    });

    it('returns a populated members array', async () => {
      let party = await leader.post('/groups', {
        type: 'party',
      });

      let member = party.members[0];

      expect(member._id).to.eql(leader._id);
      expect(member.profile).to.eql(leader.profile);
      expect(member.contributor).to.eql(leader.contributor);
    });
  });

  context('Parties', () => {
    let leader;

    beforeEach(async () => {
      leader = await generateUser();
    });

    it('allows party creation without gems', async () => {
      let party = await leader.post('/groups', {
        type: 'party',
      });

      expect(party._id).to.exist;
    });

    it('prevents party creation if user is already in party', async () => {
      await generateGroup(leader, {
        name: 'first party that user attempts to create',
        type: 'party',
      });

      await expect(leader.post('/groups', { type: 'party' })).to.eventually.be.rejected.and.eql({
        code: 400,
        text: t('messageGroupAlreadyInParty'),
      });
    });

    xit('prevents creating a public party. TODO: it is possible to create a public party. Should we send back an error? Automatically switch the privacy to private?', async () => {
      return expect(leader.post('/groups', {
        type: 'party',
        privacy: 'public',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        text: 'Parties must be private',
      });
    });
  });

  context('Guilds', () => {
    let leader;

    beforeEach(async () => {
      leader = await generateUser({
        balance: 2,
      });
    });

    it('prevents guild creation when user does not have enough gems', async () => {
      let userWithoutGems = await generateUser({
        balance: 0.75,
      });

      await expect(userWithoutGems.post('/groups', { type: 'guild' })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageInsufficientGems'),
      });
    });

    it('can create a public guild', async () => {
      let guild = await leader.post('/groups', {
        type: 'guild',
        privacy: 'public',
      });

      expect(guild.leader).to.eql(leader._id);
    });

    it('can create a private guild', async () => {
      let privateGuild = await leader.post('/groups', {
        type: 'guild',
        privacy: 'private',
      });

      expect(privateGuild.leader).to.eql(leader._id);
    });

    it('deducts gems from user and adds them to guild bank', async () => {
      let guild = await leader.post('/groups', {
        type: 'guild',
        privacy: 'private',
      });

      expect(guild.balance).to.eql(1);

      let updatedUser = await leader.get('/user');

      expect(updatedUser.balance).to.eql(1);
    });
  });
});
