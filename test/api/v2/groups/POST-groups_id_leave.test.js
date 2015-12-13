import {
  checkExistence,
  createAndPopulateGroup,
  generateUser,
  requester,
  translate as t,
} from '../../../helpers/api-integration.helper';
import { find } from 'lodash';

describe('POST /groups/:id/leave', () => {

  context('user is not member of the group', () => {
    it('returns an error');
  });

  context('user is a non-leader member of a guild', () => {
    let api, user, group;

    beforeEach(() => {
      return createAndPopulateGroup({
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
      });
    });

    it('leaves the group', () => {
      return api.post(`/groups/${group._id}/leave`).then((result) => {
        return api.get(`/groups/${group._id}`);
      }).then((group) => {
        let userInGroup = find(group.members, (member) => {
          return member._id === user._id;
        });
        expect(userInGroup).to.not.be.ok;
      });
    });
  });

  context('user is the last member of a public guild', () => {
    let api, user, group;

    beforeEach(() => {
      return createAndPopulateGroup({
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'public',
        },
      }).then((res) => {
        user = res.leader;
        api = requester(user);
        group = res.group;
      });
    });

    it('leaves the group accessible', () => {
      return expect(api.post(`/groups/${group._id}/leave`).then((result) => {
        return api.get(`/groups/${group._id}`);
      })).to.eventually.have.property('_id', group._id);
    });
  });

  context('user is the last member of a private group', () => {
    let api, user, group;

    beforeEach(() => {
      return createAndPopulateGroup({
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'private',
        },
      }).then((res) => {
        user = res.leader;
        api = requester(user);
        group = res.group;
      });
    });

    it('group is deleted', () => {
      return expect(api.post(`/groups/${group._id}/leave`).then((result) => {
        return checkExistence('groups', group._id);
      })).to.eventually.eql(false);
    });
  });

  context('user is the last member of a private group with pending invites', () => {
    let api, user, inviteeRequest1, inviteeRequest2, group;

    beforeEach(() => {
      return createAndPopulateGroup({
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
      });
    });

    it('deletes the group invitations from users', () => {
      return api.post(`/groups/${group._id}/leave`).then((result) => {
        return Promise.all([
          expect(inviteeRequest1.get(`/user`))
            .to.eventually.have.deep.property('invitations.guilds')
            .and.to.be.empty,
          expect(inviteeRequest2.get(`/user`))
            .to.eventually.have.deep.property('invitations.guilds')
            .and.to.be.empty,
        ]);
      });
    });
  });

  context('user is the last member of a party with pending invites', () => {
    let api, user, inviteeRequest1, inviteeRequest2, group;

    beforeEach(() => {
      return createAndPopulateGroup({
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
      });
    });

    it('deletes the group invitations from users', () => {
      return api.post(`/groups/${group._id}/leave`).then((result) => {
        return Promise.all([
          expect(inviteeRequest1.get(`/user`))
            .to.eventually.have.deep.property('invitations.party')
            .and.to.be.empty,
          expect(inviteeRequest2.get(`/user`))
            .to.eventually.have.deep.property('invitations.party')
            .and.to.be.empty,
        ]);
      });
    });
  });
});
