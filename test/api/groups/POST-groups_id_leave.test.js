import {
  createAndPopulateGroup,
  generateGroup,
  generateUser,
  requester,
} from '../../helpers/api.helper';

describe('POST /groups/:id/leave', () => {

  context('user is not member of the group', () => {
    it('returns an error');
  });

  context('user is a non-leader member of a guild', () => {
    let api, user, group;

    beforeEach((done) => {
      createAndPopulateGroup({
        members: 3,
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'public',
        },
      }).then((res) => {
        user = res.members[0];
        api = requester(user);
        group = res.group;
        done();
      }).catch(done);
    });

    it('leaves the group', (done) => {
      api.post(`/groups/${group._id}/leave`).then((result) => {
        return api.get(`/groups/${group._id}`);
      }).then((group) => {
        expect(group.members).to.not.include(user._id);
        done();
      }).catch(done);
    });
  });

  context('user is the last member of a public guild', () => {
    let api, user, group;

    beforeEach((done) => {
      createAndPopulateGroup({
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'public',
        },
      }).then((res) => {
        user = res.leader;
        api = requester(user);
        group = res.group;
        done();
      }).catch(done);
    });

    it('leaves the group accessible', (done) => {
      api.post(`/groups/${group._id}/leave`).then((result) => {
        return api.get(`/groups/${group._id}`);
      }).then((group) => {
        expect(group._id).to.eql(group._id);
        done();
      }).catch(done);
    });
  });

  context('user is the last member of a private group', () => {
    let api, user, group;

    beforeEach((done) => {
      createAndPopulateGroup({
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'private',
        },
      }).then((res) => {
        user = res.leader;
        api = requester(user);
        group = res.group;
        done();
      }).catch(done);
    });

    it('group is not accessible after leaving', (done) => {
      api.post(`/groups/${group._id}/leave`).then((result) => {
        return api.get(`/groups/${group._id}`);
      }).then(done).catch((err) => {
        expect(err).to.eql('Group not found or you don\'t have access.');
        done();
      });
    });
  });

  context('user is the last member of a private group with pending invites', () => {
    let api, user, inviteeRequest1, inviteeRequest2, group;

    beforeEach((done) => {
      createAndPopulateGroup({
        invites: 2,
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'private',
        },
      }).then((res) => {
        user = res.leader;
        inviteeRequest1 = requester(res.invitees[0]);
        inviteeRequest2 = requester(res.invitees[1]);
        api = requester(user);
        group = res.group;
        done();
      }).catch(done);
    });

    it('deletes the group invitations from users', (done) => {
      api.post(`/groups/${group._id}/leave`).then((result) => {
        return Promise.all([
          inviteeRequest1.get(`/user`),
          inviteeRequest2.get(`/user`),
        ]);
      }).then((users) => {
        expect(users[0].invitations.guilds[0]).to.not.exist;
        expect(users[1].invitations.guilds[0]).to.not.exist;
        done();
      }).catch(done);
    });
  });

  context('user is the last member of a party with pending invites', () => {
    let api, user, inviteeRequest1, inviteeRequest2, group;

    beforeEach((done) => {
      createAndPopulateGroup({
        invites: 2,
        groupDetails: {
          name: 'test party',
          type: 'party',
          privacy: 'private',
        },
      }).then((res) => {
        user = res.leader;
        inviteeRequest1 = requester(res.invitees[0]);
        inviteeRequest2 = requester(res.invitees[1]);
        api = requester(user);
        group = res.group;
        done();
      }).catch(done);
    });

    it('deletes the group invitations from users', (done) => {
      api.post(`/groups/${group._id}/leave`).then((result) => {
        return Promise.all([
          inviteeRequest1.get(`/user`),
          inviteeRequest2.get(`/user`),
        ]);
      }).then((users) => {
        expect(users[0].invitations.party).to.be.empty;
        expect(users[1].invitations.party).to.be.empty;
        done();
      }).catch(done);
    });
  });
});
