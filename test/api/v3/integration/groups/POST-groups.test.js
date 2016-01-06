import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('POST /group', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  context('Guilds', () => {
    it('returns an error when a user with insufficient funds attempts to create a guild', async () => {
      let groupName = 'Test Public Guild';
      let groupType = 'guild';

      await expect(
        user.post('/groups', {
          name: groupName,
          type: groupType,
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
        let userThatCreatsGuild = await generateUser({balance: 1});
        let group = await userThatCreatsGuild.post('/groups', {
          name: groupName,
          type: groupType,
        });

        expect(group._id).to.exist;
        expect(group.name).to.equal(groupName);
        expect(group.type).to.equal(groupType);
        expect(group.memberCount).to.equal(1);
      });
    });

    context('private guild', () => {
      it('creates a group', async () => {
        let groupName = 'Test Private Guild';
        let groupType = 'guild';
        let groupPrivacy = 'private';
        let userThatCreatsGuild = await generateUser({balance: 1});
        let group = await userThatCreatsGuild.post('/groups', {
          name: groupName,
          type: groupType,
          privacy: groupPrivacy,
        });

        expect(group._id).to.exist;
        expect(group.name).to.equal(groupName);
        expect(group.type).to.equal(groupType);
        expect(group.memberCount).to.equal(1);
        expect(group.privacy).to.equal(groupPrivacy);
      });
    });
  });

  context('Parties', () => {
    it('creates a party', async () => {
      let groupName = 'Test Party';
      let groupType = 'party';
      let party = await user.post('/groups', {
        name: groupName,
        type: groupType,
      });

      expect(party._id).to.exist;
      expect(party.name).to.equal(groupName);
      expect(party.type).to.equal(groupType);
      expect(party.memberCount).to.equal(1);
    });

    it('prevents user in a party from creating another party', async () => {
      let groupName = 'Test Party';
      let groupType = 'party';
      let userThatCreatesTwoParties = await generateUser();
      let firstParty = await userThatCreatesTwoParties.post('/groups', {
        name: groupName,
        type: groupType,
      });

      expect(firstParty.name).to.equal(groupName);
      expect(firstParty.type).to.equal(groupType);
      await expect(userThatCreatesTwoParties.post('/groups'))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('messageGroupAlreadyInParty'),
        });
    });
  });
});
