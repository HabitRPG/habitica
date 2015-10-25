import {
  createAndPopulateGroup,
  generateUser,
  requester,
} from '../../helpers/api.helper';
import {
  find,
  each
} from 'lodash';

describe('GET /groups/:id', () => {

  let typesOfGroups = {};
  typesOfGroups['public guild'] = { type: 'guild', privacy: 'public' };
  typesOfGroups['private guild'] = { type: 'guild', privacy: 'private' };
  typesOfGroups['party'] = { type: 'party', privacy: 'private' };

  each(typesOfGroups, (groupData, groupType) => {
    context(`Member of a ${groupType}`, () => {
      let leader, member, createdGroup;

      before((done) => {
        createAndPopulateGroup({
          members: 30,
          groupDetails: {
            name: 'test guild',
            type: 'guild',
            privacy: 'public',
          },
        }).then((res) => {
          leader = res.leader;
          member = res.members[0];
          createdGroup = res.group;
          done();
        }).catch(done);
      });

      it('returns the group object', (done) => {
        let api = requester(member);
        api.get(`/groups/${createdGroup._id}`)
          .then((group) => {
            expect(group._id).to.eql(createdGroup._id);
            expect(group.name).to.eql(createdGroup.name);
            expect(group.type).to.eql(createdGroup.type);
            expect(group.privacy).to.eql(createdGroup.privacy);
            done();
          }).catch(done);
      });

      it('transforms members array to an array of user objects', (done) => {
        let api = requester(member);
        api.get(`/groups/${createdGroup._id}`).then((group) => {
          let foundMember = group.members[0];
          expect(foundMember._id).to.exist;
          expect(foundMember.profile.name).to.exist;
          expect(foundMember.items).to.exist;
          expect(foundMember.stats).to.exist;
          expect(foundMember.achievements).to.exist;
          expect(foundMember.contributor).to.exist;
          done();
        }).catch(done);
      });

      it('transforms leader id to leader object', (done) => {
        let api = requester(member);
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

      it('includes the user in the members list', (done) => {
        let api = requester(member);
        api.get(`/groups/${createdGroup._id}`).then((group) => {
          let members = group.members;
          let userInGroup = find(members, (user) => {
            return member._id === user._id;
          });
          expect(userInGroup).to.be.ok;
          done();
        }).catch(done);
      });
    });
  });

  context('Non-member of a public guild', () => {
    let leader, nonMember, createdGroup;

    before((done) => {
      createAndPopulateGroup({
        members: 1,
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'public',
        },
      }).then((res) => {
        leader = res.leader;
        createdGroup = res.group;
        return generateUser();
      }).then((user) => {
        nonMember = user;
        done();
      }).catch(done);
    });

    it('returns the group object for a non-member', (done) => {
      let api = requester(nonMember);
      api.get(`/groups/${createdGroup._id}`)
        .then((group) => {
          expect(group._id).to.eql(createdGroup._id);
          expect(group.name).to.eql(createdGroup.name);
          expect(group.type).to.eql(createdGroup.type);
          expect(group.privacy).to.eql(createdGroup.privacy);
          done();
        }).catch(done);
    });

    it('does not include user in members list', (done) => {
      let api = requester(nonMember);
      api.get(`/groups/${createdGroup._id}`)
        .then((group) => {
          let userInGroup = find(group.members, (user) => {
            return nonMember._id === user._id;
          });
          expect(userInGroup).to.not.be.ok;
          done();
        }).catch(done);
    });
  });

  context('Private Guilds', () => {
    let leader, nonMember, createdGroup;

    before((done) => {
      createAndPopulateGroup({
        members: 1,
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'private',
        },
      }).then((res) => {
        leader = res.leader;
        createdGroup = res.group;
        return generateUser();
      }).then((user) => {
        nonMember = user;
        done();
      }).catch(done);
    });

    it('does not return the group object for a non-member', (done) => {
      let api = requester(nonMember);
      api.get(`/groups/${createdGroup._id}`)
        .then((done)).catch((err) => {
          expect(err).to.eql('Group not found or you don\'t have access.');
          done()
      });
    });
  });

  context('Non-member of a party', () => {
    let leader, nonMember, createdGroup;

    before((done) => {
      createAndPopulateGroup({
        members: 1,
        groupDetails: {
          name: 'test party',
          type: 'party',
          privacy: 'private',
        },
      }).then((res) => {
        leader = res.leader;
        createdGroup = res.group;
        return generateUser();
      }).then((user) => {
        nonMember = user;
        done();
      }).catch(done);
    });

    it('does not return the group object for a non-member', (done) => {
      let api = requester(nonMember);
      api.get(`/groups/${createdGroup._id}`)
        .then((done)).catch((err) => {
          expect(err).to.eql('Group not found or you don\'t have access.');
          done()
        });
    });
  });

  context('Member of a party', () => {
    let leader, member, createdGroup;

    before((done) => {
      createAndPopulateGroup({
        members: 1,
        groupDetails: {
          name: 'test party',
          type: 'party',
          privacy: 'private',
        },
      }).then((res) => {
        leader = res.leader;
        createdGroup = res.group;
        member = res.members[0];
        done();
      }).catch(done);
    });

    it('returns the user\'s party if an id of "party" is passed in', (done) => {
      let api = requester(member);
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

  context('Non-existent group', () => {
    let user;

    beforeEach((done) => {
      generateUser().then((_user) => {
        user = _user;
        done();
      }).catch(done);
    });

    it('returns error if group does not exist', (done) => {
      let api = requester(user);
      api.get('/groups/group-that-does-not-exist')
        .then((done)).catch((err) => {
          expect(err).to.eql('Group not found or you don\'t have access.');
          done()
        });
    });
  });
});
