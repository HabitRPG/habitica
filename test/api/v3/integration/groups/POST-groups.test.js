import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('POST /group', () => {
  let user;

  beforeEach(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  context('Guilds', () => {
    it('returns an error when a user with insufficient funds attempts to create a guild', () => {
      let groupName = 'Test Public Guild';
      let groupType = 'guild';

      return expect(
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
      it('creates a group', () => {
        let groupName = 'Test Public Guild';
        let groupType = 'guild';

        return generateUser({balance: 1}).then((generatedUser) => {
          return generatedUser.post('/groups', {
            name: groupName,
            type: groupType,
          });
        })
        .then((result) => {
          expect(result._id).to.exist;
          expect(result.name).to.equal(groupName);
          expect(result.type).to.equal(groupType);
        });
      });
    });

    context('private guild', () => {
      it('creates a group', () => {
        let groupName = 'Test Private Guild';
        let groupType = 'guild';
        let groupPrivacy = 'private';

        return generateUser({balance: 1}).then((generatedUser) => {
          return generatedUser.post('/groups', {
            name: groupName,
            type: groupType,
            privacy: groupPrivacy,
          });
        })
        .then((result) => {
          expect(result._id).to.exist;
          expect(result.name).to.equal(groupName);
          expect(result.type).to.equal(groupType);
          expect(result.privacy).to.equal(groupPrivacy);
        });
      });
    });
  });

  context('Parties', () => {
    it('creates a party', () => {
      let groupName = 'Test Party';
      let groupType = 'party';

      return user.post('/groups', {
        name: groupName,
        type: groupType,
      })
      .then((result) => {
        expect(result._id).to.exist;
        expect(result.name).to.equal(groupName);
        expect(result.type).to.equal(groupType);
      });
    });

    it('prevents user in a party from creating another party', () => {
      let tmpUser;
      let groupName = 'Test Party';
      let groupType = 'party';

      return generateUser().then((generatedUser) => {
        tmpUser = generatedUser;
        return tmpUser.post('/groups', {
          name: groupName,
          type: groupType,
        });
      })
      .then(() => {
        return expect(tmpUser.post('/groups')).to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('messageGroupAlreadyInParty'),
        });
      });
    });
  });
});
