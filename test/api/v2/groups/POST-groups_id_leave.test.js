import {
  checkExistence,
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../helpers/api-integration.helper';
import { find } from 'lodash';

describe('POST /groups/:id/leave', () => {

  context('user is not member of the group', () => {
    it('returns an error');
  });

  context('user is a non-leader member of a guild', () => {
    let user, group;

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
        group = res.group;
      });
    });

    it('leaves the group', () => {
      return user.post(`/groups/${group._id}/leave`).then((result) => {
        return user.get(`/groups/${group._id}`);
      }).then((group) => {
        let userInGroup = find(group.members, (member) => {
          return member._id === user._id;
        });
        expect(userInGroup).to.not.be.ok;
      });
    });
  });

  context('user is the last member of a public guild', () => {
    let user, group;

    beforeEach(() => {
      return createAndPopulateGroup({
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'public',
        },
      }).then((res) => {
        user = res.leader;
        group = res.group;
      });
    });

    it('leaves the group accessible', () => {
      return expect(user.post(`/groups/${group._id}/leave`).then((result) => {
        return user.get(`/groups/${group._id}`);
      })).to.eventually.have.property('_id', group._id);
    });
  });

  context('user is the last member of a private group', () => {
    let user, group;

    beforeEach(() => {
      return createAndPopulateGroup({
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'private',
        },
      }).then((res) => {
        user = res.leader;
        group = res.group;
      });
    });

    it('group is deleted', () => {
      return expect(user.post(`/groups/${group._id}/leave`).then((result) => {
        return checkExistence('groups', group._id);
      })).to.eventually.eql(false);
    });
  });

  context('user is the last member of a private group with pending invites', () => {
    let user, invitee1, invitee2, group;

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
        invitee1 = res.invitees[0];
        invitee2 = res.invitees[1];
        group = res.group;
      });
    });

    it('deletes the group invitations from users', () => {
      return user.post(`/groups/${group._id}/leave`).then((result) => {
        return Promise.all([
          expect(invitee1.get(`/user`))
            .to.eventually.have.deep.property('invitations.guilds')
            .and.to.be.empty,
          expect(invitee2.get(`/user`))
            .to.eventually.have.deep.property('invitations.guilds')
            .and.to.be.empty,
        ]);
      });
    });
  });

  context('user is the last member of a party with pending invites', () => {
    let user, invitee1, invitee2, group;

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
        invitee1 = res.invitees[0];
        invitee2 = res.invitees[1];
        group = res.group;
      });
    });

    it('deletes the group invitations from users', () => {
      return user.post(`/groups/${group._id}/leave`).then((result) => {
        return Promise.all([
          expect(invitee1.get(`/user`))
            .to.eventually.have.deep.property('invitations.party')
            .and.to.be.empty,
          expect(invitee2.get(`/user`))
            .to.eventually.have.deep.property('invitations.party')
            .and.to.be.empty,
        ]);
      });
    });
  });
});
