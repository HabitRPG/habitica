import {
  generateGroup,
  generateUser,
  requester,
} from '../../helpers/api.helper';

describe('GET /groups/:id', () => {

  context('All Groups', () => {
    let api, leader, createdGroup;

    beforeEach((done) => {
      generateUser({
        balance: 1,
      }).then((user) => {
        leader = user;
        api = requester(user);
        return generateGroup(leader, {
          name: 'group name',
          type: 'guild',
          privacy: 'public',
        });
      }).then((group) => {
        createdGroup = group;
        done();
      }).catch(done);
    });

    it('transforms members array to an array of user objects', (done) => {
      api.get(`/groups/${createdGroup._id}`).then((group) => {
        let member = group.members[0];
        expect(member._id).to.eql(leader._id);
        expect(member.profile.name).to.eql(leader.profile.name);
        expect(member.items).to.exist;
        expect(member.stats).to.exist;
        expect(member.achievements).to.exist;
        expect(member.contributor).to.exist;
        done();
      }).catch(done);
    });

    it('transforms leader id to leader object', (done) => {
      api.get(`/groups/${createdGroup._id}`).then((group) => {
        expect(group.leader._id).to.eql(leader._id);
        expect(group.leader.profile.name).to.eql(leader.profile.name);
        expect(group.leader.items).to.exist;
        expect(group.leader.stats).to.exist;
        expect(group.leader.achievements).to.exist;
        expect(group.leader.contributor).to.exist;
        done();
      }).catch(done);
    });

    it('returns error if group does not exist', (done) => {
      generateUser().then((user) => {
        api = requester(user);
        return api.get('/groups/group-that-does-not-exist');
      }).then((done)).catch((err) => {
        expect(err.code).to.eql(404);
        expect(err.text).to.eql('Group not found or you don\'t have access.');
        done()
      });
    });
  });

  context('Public Guilds', () => {
    let api, leader, createdGroup;

    beforeEach((done) => {
      generateUser({
        balance: 1,
      }).then((user) => {
        leader = user;
        api = requester(user);
        return generateGroup(leader, {
          name: 'group name',
          type: 'guild',
          privacy: 'public',
        });
      }).then((group) => {
        createdGroup = group;
        done();
      }).catch(done);
    });

    it('returns the group object', (done) => {
      api.get(`/groups/${createdGroup._id}`)
        .then((group) => {
          expect(group._id).to.eql(createdGroup._id);
          expect(group.name).to.eql(createdGroup.name);
          expect(group.type).to.eql(createdGroup.type);
          expect(group.privacy).to.eql(createdGroup.privacy);
          done();
        }).catch(done);
    });

    it('returns the group object for a non-member', (done) => {
      generateUser().then((user) => {
        api = requester(user);
        return api.get(`/groups/${createdGroup._id}`);
      }).then((group) => {
        expect(group._id).to.eql(createdGroup._id);
        expect(group.name).to.eql(createdGroup.name);
        expect(group.type).to.eql(createdGroup.type);
        expect(group.privacy).to.eql(createdGroup.privacy);
        done();
      }).catch(done);
    });
  });

  context('Private Guilds', () => {
    let api, leader, createdGroup;

    beforeEach((done) => {
      generateUser({
        balance: 1,
      }).then((user) => {
        leader = user;
        api = requester(user);
        return generateGroup(leader, {
          name: 'group name',
          type: 'guild',
          privacy: 'private',
        });
      }).then((group) => {
        createdGroup = group;
        done();
      }).catch(done);
    });

    it('returns the group object', (done) => {
      api.get(`/groups/${createdGroup._id}`)
        .then((group) => {
          expect(group._id).to.eql(createdGroup._id);
          expect(group.name).to.eql(createdGroup.name);
          expect(group.type).to.eql(createdGroup.type);
          expect(group.privacy).to.eql(createdGroup.privacy);
          done();
        }).catch(done);
    });

    it('does not return the group object for a non-member', (done) => {
      generateUser().then((user) => {
        api = requester(user);
        return api.get(`/groups/${createdGroup._id}`);
      }).then((done)).catch((err) => {
        expect(err.code).to.eql(404);
        expect(err.text).to.eql('Group not found or you don\'t have access.');
        done()
      });
    });
  });

  context('Parties', () => {
    let api, leader, createdGroup;

    beforeEach((done) => {
      generateUser({
        balance: 1,
      }).then((user) => {
        leader = user;
        api = requester(user);
        return generateGroup(leader, {
          name: 'group name',
          type: 'party',
        });
      }).then((group) => {
        createdGroup = group;
        done();
      }).catch(done);
    });

    it('returns the group object', (done) => {
      api.get(`/groups/${createdGroup._id}`)
        .then((group) => {
          expect(group._id).to.eql(createdGroup._id);
          expect(group.name).to.eql(createdGroup.name);
          expect(group.type).to.eql(createdGroup.type);
          expect(group.privacy).to.eql(createdGroup.privacy);
          done();
        }).catch(done);
    });

    it('does not return the group object for a non-member', (done) => {
      generateUser().then((user) => {
        api = requester(user);
        return api.get(`/groups/${createdGroup._id}`);
      }).then((done)).catch((err) => {
        expect(err.code).to.eql(404);
        expect(err.text).to.eql('Group not found or you don\'t have access.');
        done()
      });
    });

    it('returns the user\'s party if an id of "party" is passed in', (done) => {
      api.get('/groups/party')
        .then((group) => {
          expect(group._id).to.eql(createdGroup._id);
          expect(group.name).to.eql(createdGroup.name);
          expect(group.type).to.eql(createdGroup.type);
          expect(group.privacy).to.eql(createdGroup.privacy);
          done();
        }).catch(done);
    });
  });
});
