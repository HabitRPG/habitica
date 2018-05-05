import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /group', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({ balance: 10 });
  });

  context('All Groups', () => {
    it('it returns validation error when type is not provided', async () => {
      await expect(
        user.post('/groups', { name: 'Test Group Without Type' })
      ).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Group validation failed',
      });
    });

    it('it returns validation error when type is not supported', async () => {
      await expect(
        user.post('/groups', { name: 'Group with unsupported type', type: 'foo' })
      ).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Group validation failed',
      });
    });

    it('sets the group leader to the user who created the group', async () => {
      let group = await user.post('/groups', {
        name: 'Test Public Guild',
        type: 'guild',
      });

      expect(group.leader).to.eql({
        _id: user._id,
        profile: {
          name: user.profile.name,
        },
      });
    });
  });

  context('Guilds', () => {
    it('returns an error when a user with insufficient funds attempts to create a guild', async () => {
      await user.update({ balance: 0 });

      await expect(
        user.post('/groups', {
          name: 'Test Public Guild',
          type: 'guild',
        })
      ).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageInsufficientGems'),
      });
    });

    it('adds guild to user\'s list of guilds', async () => {
      let guild = await user.post('/groups', {
        name: 'some guild',
        type: 'guild',
        privacy: 'public',
      });

      let updatedUser = await user.get('/user');

      expect(updatedUser.guilds).to.include(guild._id);
    });

    it('awards the Joined Guild achievement', async () => {
      await user.post('/groups', {
        name: 'some guild',
        type: 'guild',
        privacy: 'public',
      });

      let updatedUser = await user.get('/user');

      expect(updatedUser.achievements.joinedGuild).to.eql(true);
    });

    context('public guild', () => {
      it('creates a group', async () => {
        let groupName = 'Test Public Guild';
        let groupType = 'guild';
        let groupPrivacy = 'public';

        let publicGuild = await user.post('/groups', {
          name: groupName,
          type: groupType,
          privacy: groupPrivacy,
        });

        expect(publicGuild._id).to.exist;
        expect(publicGuild.name).to.equal(groupName);
        expect(publicGuild.type).to.equal(groupType);
        expect(publicGuild.memberCount).to.equal(1);
        expect(publicGuild.privacy).to.equal(groupPrivacy);
        expect(publicGuild.leader).to.eql({
          _id: user._id,
          profile: {
            name: user.profile.name,
          },
        });
      });
    });

    context('private guild', () => {
      let groupName = 'Test Private Guild';
      let groupType = 'guild';
      let groupPrivacy = 'private';

      it('creates a group', async () => {
        let privateGuild = await user.post('/groups', {
          name: groupName,
          type: groupType,
          privacy: groupPrivacy,
        });

        expect(privateGuild._id).to.exist;
        expect(privateGuild.name).to.equal(groupName);
        expect(privateGuild.type).to.equal(groupType);
        expect(privateGuild.memberCount).to.equal(1);
        expect(privateGuild.privacy).to.equal(groupPrivacy);
        expect(privateGuild.leader).to.eql({
          _id: user._id,
          profile: {
            name: user.profile.name,
          },
        });
      });

      it('deducts gems from user and adds them to guild bank', async () => {
        let privateGuild = await user.post('/groups', {
          name: groupName,
          type: groupType,
          privacy: groupPrivacy,
        });

        expect(privateGuild.balance).to.eql(1);

        let updatedUser = await user.get('/user');

        expect(updatedUser.balance).to.eql(user.balance - 1);
      });
    });
  });

  context('Parties', () => {
    let partyName = 'Test Party';
    let partyType = 'party';

    it('creates a party', async () => {
      let party = await user.post('/groups', {
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

    it('does not require gems to create a party', async () => {
      await user.update({ balance: 0 });

      let party = await user.post('/groups', {
        name: partyName,
        type: partyType,
      });

      expect(party._id).to.exist;

      let updatedUser = await user.get('/user');

      expect(updatedUser.balance).to.eql(user.balance);
    });

    it('sets party id on user object', async () => {
      let party = await user.post('/groups', {
        name: partyName,
        type: partyType,
      });

      let updatedUser = await user.get('/user');

      expect(updatedUser.party._id).to.eql(party._id);
    });

    it('does not award Party Up achievement to solo partier', async () => {
      await user.post('/groups', {
        name: partyName,
        type: partyType,
      });

      let updatedUser = await user.get('/user');

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
