import {
  generateGroup,
  generateUser,
  resetHabiticaDB,
  requester,
} from '../../../helpers/api-integration.helper';

describe('GET /groups', () => {
  const NUMBER_OF_PUBLIC_GUILDS = 3;
  const NUMBER_OF_USERS_GUILDS = 2;

  let user, api;

  before(() => {
    let leader, createdGroup;

    // Set up a world with a mixture of public and private guilds
    // Invite user to a few of them
    return resetHabiticaDB().then(() => {
      return generateUser();
    }).then((_user) => {
      user = _user;

      return generateUser({
        balance: 10,
      });
    }).then((_user) => {
      leader = _user;
      api = requester(leader);

      let publicGuildWithUserAsMember = generateGroup(leader, {
        name: 'public guild - is member',
        type: 'guild',
        privacy: 'public',
        members: [leader._id, user._id],
      });

      let publicGuildWithoutUserAsMember = generateGroup(leader, {
        name: 'public guild - is not member',
        type: 'guild',
        privacy: 'public',
      });

      let privateGuildWithUserAsMember = generateGroup(leader, {
        name: 'private guild - is member',
        type: 'guild',
        privacy: 'private',
        members: [leader._id, user._id],
      });

      let privateGuildWithoutUserAsMember = generateGroup(leader, {
        name: 'private guild - is not member',
        type: 'guild',
        privacy: 'private',
      });

      let partyWithoutUserAsMember = generateGroup(leader, {
        name: 'party name',
        type: 'party',
        privacy: 'private',
      });

      let promises = [
        publicGuildWithUserAsMember,
        publicGuildWithoutUserAsMember,
        privateGuildWithUserAsMember,
        privateGuildWithoutUserAsMember,
        partyWithoutUserAsMember,
      ];

      return Promise.all(promises);
    }).then((groups) => {
      api = requester(user);
      return api.post('/groups', {
        type: 'party',
        name: 'user\'s party',
        privacy: 'private',
      });
    });
  });

  context('no query passed in', () => {

    xit('lists all public guilds, the tavern, user\'s party, and any private guilds that user is a part of - TODO query includes duplicates - IE, tavern is included as tavern and part of public guilds. Refactor so this is not the case');
  });

  context('tavern passed in as query', () => {

    it('returns only the tavern', () => {
      return expect(api.get('/groups', null, {type: 'tavern'}))
        .to.eventually.have.a.lengthOf(1)
        .and.to.have.deep.property('[0]')
        .and.to.have.property('_id', 'habitrpg');
    });
  });

  context('party passed in as query', () => {

    it('returns only the user\'s party', () => {
      return expect(api.get('/groups', null, {type: 'party'}))
        .to.eventually.have.a.lengthOf(1)
        .and.to.have.deep.property('[0]')
        .and.to.have.property('leader', user._id);
    });
  });

  context('public passed in as query', () => {

    it('returns all public guilds', () => {
      return expect(api.get('/groups', null, {type: 'public'}))
        .to.eventually.have.a.lengthOf(NUMBER_OF_PUBLIC_GUILDS);
    });
  });

  context('guilds passed in as query', () => {

    it('returns all guilds user is a part of ', () => {
      return expect(api.get('/groups', null, {type: 'guilds'}))
        .to.eventually.have.a.lengthOf(NUMBER_OF_USERS_GUILDS);
    });
  });
});
