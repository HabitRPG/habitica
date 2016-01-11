import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('POST /group', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  context('All Groups', () => {
    it('it returns validation error when type is not provided', async () => {
      let userToCreateGroup = await generateUser({balance: 1});
      await expect(userToCreateGroup.post('/groups', { name: 'Test Group Without Type' }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Group validation failed',
      });
    });
  });

  context('Guilds', () => {
    let userToCreateGuild;

    beforeEach(async () => {
      userToCreateGuild = await generateUser({balance: 1});
    });

    it('returns an error when a user with insufficient funds attempts to create a guild', async () => {
      await expect(
        user.post('/groups', {
          name: 'Test Public Guild',
          type: 'guild',
        })
      )
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageInsufficientGems'),
      });
    });

    context('public guild', () => {
      it('creates a group', async () => {
        let groupName = 'Test Public Guild';
        let groupType = 'guild';
        let groupPrivacy = 'public';
        let publicGuild = await userToCreateGuild.post('/groups', {
          name: groupName,
          type: groupType,
          privacy: groupPrivacy,
        });

        expect(publicGuild._id).to.exist;
        expect(publicGuild.name).to.equal(groupName);
        expect(publicGuild.type).to.equal(groupType);
        expect(publicGuild.memberCount).to.equal(1);
        expect(publicGuild.privacy).to.equal(groupPrivacy);
      });
    });

    context('private guild', () => {
      let groupName = 'Test Private Guild';
      let groupType = 'guild';
      let groupPrivacy = 'private';

      it('creates a group', async () => {
        let privateGuild = await userToCreateGuild.post('/groups', {
          name: groupName,
          type: groupType,
          privacy: groupPrivacy,
        });

        expect(privateGuild._id).to.exist;
        expect(privateGuild.name).to.equal(groupName);
        expect(privateGuild.type).to.equal(groupType);
        expect(privateGuild.memberCount).to.equal(1);
        expect(privateGuild.privacy).to.equal(groupPrivacy);
      });

      it('deducts gems from user and adds them to guild bank', async () => {
        let privateGuild = await userToCreateGuild.post('/groups', {
          name: groupName,
          type: groupType,
          privacy: groupPrivacy,
        });

        expect(privateGuild.balance).to.eql(1);

        let updatedUser = await userToCreateGuild.get('/user');

        expect(updatedUser.balance).to.eql(0);
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
    });

    it('prevents user in a party from creating another party', async () => {
      let userToCreateTwoParties = await generateUser();

      await userToCreateTwoParties.post('/groups', {
        name: partyName,
        type: partyType,
      });

      await expect(userToCreateTwoParties.post('/groups'))
      .to.eventually.be.rejected.and.eql({
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
