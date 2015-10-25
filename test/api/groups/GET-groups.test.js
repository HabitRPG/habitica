import {
  generateGroup,
  generateUser,
  resetHabiticaDB,
  requester,
} from '../../helpers/api.helper';

describe('GET /groups', () => {
  let user, api;

  before((done) => {
    let leader, createdGroup;

    // Set up a world with a mixture of public and private guilds
    // Invite user to a few of them
    resetHabiticaDB().then(() => {
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
    })
    .then((party) => {
      done();
    }).catch(done);
  });

  context('no query passed in', () => {

    xit('lists all public guilds, the tavern, user\'s party, and any private guilds that user is a part of - TODO query includes duplicates - IE, tavern is included as tavern and part of public guilds. Refactor so this is not the case', (done) => {
      api.get('/groups').then((groups) => {
        expect(groups.length).to.eql(4);
        done();
      }).catch(done);
    });
  });

  context('tavern passed in as query', () => {

    it('returns only the tavern', (done) => {
      api.get('/groups', null, {type: 'tavern'}).then((groups) => {
        expect(groups).to.have.a.lengthOf(1);

        let tavern = groups[0];
        expect(tavern._id).to.eql('habitrpg');
        done();
      }).catch((err) => {
        done(err);
      });
    });
  });

  context('party passed in as query', () => {

    it('returns only the user\'s party', (done) => {
      api.get('/groups', null, {type: 'party'}).then((groups) => {
        expect(groups).to.have.a.lengthOf(1);

        let party = groups[0];
        expect(party.leader).to.eql(user._id);

        done();
      }).catch(done);
    });
  });

  context('public passed in as query', () => {

    it('returns all public guilds', (done) => {
      api.get('/groups', null, {type: 'public'}).then((groups) => {
        expect(groups).to.have.a.lengthOf(3);

        done();
      }).catch(done);
    });
  });

  context('guilds passed in as query', () => {

    it('returns all guilds user is a part of ', (done) => {
      api.get('/groups', null, {type: 'guilds'}).then((groups) => {
        expect(groups).to.have.a.lengthOf(2);

        done();
      }).catch(done);
    });
  });
});
