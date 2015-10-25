import {
  generateGroup,
  generateUser,
  requester,
} from '../../helpers/api.helper';

describe('POST /groups', () => {

  context('All groups', () => {
    let api, leader;

    beforeEach(() => {
      return generateUser().then((user) => {
        leader = user;
        api = requester(user);
      });
    });

    xit('returns defaults? (TODO: it\'s possible to create a group without a type. Should the group default to party? Should we require type to be set?', (done) => {
      api.post('/groups').then((group) => {
        expect(group._id).to.exist;
        expect(group.name).to.eql(`${leader.profile.name}'s group`);
        expect(group.type).to.eql('party');
        expect(group.privacy).to.eql('private');
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('returns a group object', () => {
      let group = {
        name: 'Test Group',
        type: 'party',
        leaderOnly: { challenges: true },
        description: 'Test Group Description',
        leaderMessage: 'Test Group Message',
      };

      return expect(api.post('/groups', group))
        .to.eventually.shallowDeepEqual({
          leader: leader._id,
          name: group.name,
          description: group.description,
          leaderMessage: group.leaderMessage,
          leaderOnly: group.leaderOnly,
          memberCount: 1,
        }).and.to.have.property('_id');
    });

    it('returns a populated members array', () => {
      return expect(api.post('/groups', {
        type: 'party',
      })).to.eventually.have.deep.property('members[0]')
        .and.to.shallowDeepEqual({
          _id: leader._id,
          profile: leader.profile,
          contributor: leader.contributor,
        });
    });
  });

  context('Parties', () => {
    let api, leader;

    beforeEach(() => {
      return generateUser().then((user) => {
        leader = user;
        api = requester(user);
      });
    });

    it('allows party creation without gems', () => {
      return expect(api.post('/groups', {
        type: 'party',
      })).to.eventually.have.property('_id');
    });

    it('prevents party creation if user is already in party', () => {
      return expect(generateGroup(leader, {
        type: 'party',
      }).then((group) => {
        return api.post('/groups', {
          type: 'party',
        });
      })).to.be.rejectedWith('Already in a party, try refreshing.');
    })

    xit('prevents creating a public party. TODO: it is possible to create a public party. Should we send back an error? Automatically switch the privacy to private?', (done) => {
      api.post('/groups', {
        type: 'party',
        privacy: 'public',
      })
      .then((group) => {
        done('Unexpected success');
      })
      .catch((err) => {
        expect(err).to.eql('Parties must be private');
        done();
      });
    });
  });

  context('Guilds', () => {
    let api, leader;

    beforeEach(() => {
      return generateUser({
        balance: 2,
      }).then((user) => {
        leader = user;
        api = requester(user);
      });
    });

    it('prevents guild creation when user does not have enough gems', () => {
      return expect(generateUser({
        balance: 0.75,
      }).then((user) => {
        api = requester(user);
        return api.post('/groups', {
          type: 'guild',
        });
      })).to.be.rejectedWith('Not enough gems!');
    });


    it('can create a public guild', () => {
      return expect(api.post('/groups', {
        type: 'guild',
        privacy: 'public',
      })).to.eventually.have.property('leader', leader._id);
    });

    it('can create a private guild', () => {
      return expect(api.post('/groups', {
        type: 'guild',
        privacy: 'private',
      })).to.eventually.have.property('leader', leader._id);
    });

    it('deducts gems from user and adds them to guild bank', () => {
      return expect(api.post('/groups', {
        type: 'guild',
        privacy: 'private',
      }).then((group) => {
        expect(group.balance).to.eql(1);
        return api.get('/user');
      })).to.eventually.have.deep.property('balance', 1);
    });
  });
});
