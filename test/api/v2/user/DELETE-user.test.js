import {
  checkExistence,
  createAndPopulateGroup,
  generateGroup,
  generateUser,
  requester,
  translate as t,
} from '../../../helpers/api-integration.helper';
import { find } from 'lodash';

describe('DELETE /user', () => {
  let api, user;

  beforeEach(() => {
    return generateUser().then((usr) => {
      api = requester(usr);
      user = usr;
    });
  });

  it('deletes the user', () => {
    return expect(api.del('/user').then((fetchedUser) => {
      return checkExistence('users', user._id);
    })).to.eventually.eql(false);
  });

  context('user has active subscription', () => {
    it('does not delete account');
  });

  context('last member of a party', () => {
    let party;

    beforeEach(() => {
      return generateGroup(user, {
        type: 'party',
        privacy: 'private'
      }).then((group) => {
        party = group;
      });
    });

    it('deletes party when user is the only member', () => {
    return expect(api.del('/user').then((result) => {
        return checkExistence('groups', party._id);
      })).to.eventually.eql(false);
    });
  });

  context('last member of a private guild', () => {
    let guild;

    beforeEach(() => {
      return generateGroup(user, {
        type: 'guild',
        privacy: 'private'
      }).then((group) => {
        guild = group;
      });
    });

    it('deletes guild when user is the only member', () => {
    return expect(api.del('/user').then((result) => {
        return checkExistence('groups', guild._id);
      })).to.eventually.eql(false);
    });
  });

  context('groups user is leader of', () => {
    let api, group, oldLeader, newLeader;

    beforeEach(() => {
      return createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
        },
        members: 3,
      }).then((res) => {
        group = res.group;
        newLeader = res.members[0];
        oldLeader = res.leader;
        api = requester(oldLeader);
      });
    });

    it('chooses new group leader for any group user was the leader of', () => {
      return api.del('/user').then((res) => {
        return requester(newLeader).get(`/groups/${group._id}`);
      }).then((guild) => {
        expect(guild.leader).to.exist;
        expect(guild.leader._id).to.not.eql(oldLeader._id);
      });
    });
  });

  context('groups user is a part of', () => {
    let api, group1, group2, userToDelete, otherUser;

    beforeEach(() => {
      return generateUser({
        balance: 10,
      }).then((user) => {
        userToDelete = user;
        api = requester(userToDelete);

        return generateGroup(userToDelete, {
          type: 'guild',
          privacy: 'public',
        });
      }).then((newGroup) => {
        group1 = newGroup;

        return createAndPopulateGroup({
          groupDetails: {
            type: 'guild',
            privacy: 'public',
          },
          members: 3,
        });
      }).then((res) => {
        group2 = res.group;
        otherUser = res.members[0];

        return api.post(`/groups/${group2._id}/join`);
      });
    });

    it('removes user from all groups user was a part of', () => {
      return api.del('/user').then((res) => {
        return requester(otherUser).get(`/groups/${group1._id}`);
      }).then((fetchedGroup1) => {
        expect(fetchedGroup1.members).to.be.empty;

        return requester(otherUser).get(`/groups/${group2._id}`);
      }).then((fetchedGroup2) => {
        expect(fetchedGroup2.members).to.not.be.empty;

        let userInGroup = find(fetchedGroup2.members, (member) => {
          return member._id === userToDelete._id;
        });

        expect(userInGroup).to.not.be.ok;
      });
    });

  });

  context('pending invitation to group', () => {
    let api, group, userToDelete, otherUser;

    beforeEach(() => {
      return createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
        },
        members: 3,
        invites: 2,
      }).then((res) => {
        group = res.group;
        otherUser = res.members[0];
        userToDelete = res.invitees[0];
      });
    });

    it('removes invitations from groups', () => {
      return requester(userToDelete).del('/user').then((res) => {
        return requester(otherUser).get(`/groups/${group._id}`);
      }).then((fetchedGroup) => {
        expect(fetchedGroup.invites).to.have.a.lengthOf(1);
        expect(fetchedGroup.invites[0]._id).to.not.eql(userToDelete._id);
      });
    });
  });
});
