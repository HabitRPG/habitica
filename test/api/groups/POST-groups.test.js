import {
  generateGroup,
  generateUser,
  requester,
} from '../../helpers/api.helper';

describe('POST /groups', () => {

  context('All groups', () => {
    let api, leader;

    beforeEach((done) => {
      generateUser().then((user) => {
        leader = user;
        api = requester(user);
        done();
      }).catch(done);
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

    it('returns a group object', (done) => {
      let group = {
        name: 'Test Group',
        type: 'party',
        leaderOnly: { challenges: true },
        description: 'Test Group Description',
        leaderMessage: 'Test Group Message',
      };

      api.post('/groups',
        group
      ).then((createdGroup) => {
        expect(createdGroup._id).to.exist;
        expect(createdGroup.leader).to.eql(leader._id);
        expect(createdGroup.name).to.eql(group.name);
        expect(createdGroup.description).to.eql(group.description);
        expect(createdGroup.leaderMessage).to.eql(group.leaderMessage);
        expect(createdGroup.leaderOnly.challenges).to.eql(group.leaderOnly.challenges);
        expect(createdGroup.memberCount).to.eql(1);
        expect(createdGroup.members).to.have.a.lengthOf(1);
        done();
      })
      .catch((err) => {
        done(err);
      });
    });

    it('returns a populated members array', (done) => {
      api.post('/groups', {
        type: 'party',
      }).then((createdGroup) => {
        let member = createdGroup.members[0];

        expect(member._id).to.eql(leader._id);
        expect(member.profile.name).to.eql(leader.profile.name);
        expect(member.items).to.exist;
        expect(member.stats).to.exist;
        expect(member.achievements).to.exist;
        expect(member.contributor).to.exist;
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });

  context('Parties', () => {
    let api, leader;

    beforeEach((done) => {
      generateUser().then((user) => {
        leader = user;
        api = requester(user);
        done();
      }).catch(done);
    });

    it('allows party creation without gems', (done) => {
      api.post('/groups', {
        type: 'party',
      })
      .then((group) => {
        expect(group._id).to.exist;
        done();
      })
      .catch((err) => {
        done(err);
      });
    });

    it('prevents party creation if user is already in party', (done) => {
      generateGroup(leader, {
        type: 'party',
      }).then((group) => {
        return api.post('/groups', {
          type: 'party',
        });
      }).then((group) => {
        done('Unexpected success');
      })
      .catch((err) => {
        expect(err.code).to.eql(400);
        expect(err.text).to.eql('Already in a party, try refreshing.');
        done();
      });
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
        expect(err.code).to.eql(400);
        expect(err.text).to.eql('Parties must be private');
        done();
      });
    });
  });

  context('Guilds', () => {
    let api, leader;

    beforeEach((done) => {
      generateUser({
        balance: 2,
      }).then((user) => {
        leader = user;
        api = requester(user);
        done();
      }).catch(done);
    });

    it('prevents guild creation when user does not have enough gems', (done) => {
      generateUser({
        balance: 0.75,
      }).then((user) => {
        api = requester(user);
        return api.post('/groups', {
          type: 'guild',
        });
      }).then((group) => {
        done('Unexpected success');
      }).catch((err) => {
        expect(err.code).to.eql(401);
        expect(err.text).to.eql('Not enough gems!');
        done();
      });
    });


    it('can create a public guild', (done) => {
      api.post('/groups', {
        type: 'guild',
        privacy: 'public',
      }).then((group) => {
        expect(group.leader).to.eql(leader._id);
        done();
      })
      .catch((err) => {
        done(err);
      });
    });

    it('can create a private guild', (done) => {
      api.post('/groups', {
        type: 'guild',
        privacy: 'private',
      }).then((group) => {
        expect(group.leader).to.eql(leader._id);
        done();
      })
      .catch((err) => {
        done(err);
      });
    });

    it('deducts gems from user and adds them to guild bank', (done) => {
      api.post('/groups', {
        type: 'guild',
        privacy: 'private',
      }).then((group) => {
        expect(group.balance).to.eql(1);
        return api.get('/user');
      }).then((user) => {
        expect(user.balance).to.eql(1);
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });
});
