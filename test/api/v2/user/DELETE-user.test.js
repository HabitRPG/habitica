import {
  checkExistence,
  createAndPopulateGroup,
  generateGroup,
  generateUser,
} from '../../../helpers/api-integration/v2';
import {
  find,
  map,
} from 'lodash';
import Q from 'q';

describe('DELETE /user', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('deletes the user', async () => {
    return expect(user.del('/user').then(() => {
      return checkExistence('users', user._id);
    })).to.eventually.eql(false);
  });

  it('deletes the user\'s tasks', async () => {
    // gets the user's todos ids
    let ids = user.todos.map(todo => todo._id);
    expect(ids.length).to.be.above(0); // make sure the user has some task to delete

    await user.del('/user');

    await Q.all(map(ids, id => {
      return expect(checkExistence('tasks', id)).to.eventually.eql(false);
    }));
  });

  context('user has active subscription', () => {
    it('does not delete account');
  });

  context('last member of a party', () => {
    let party;

    beforeEach(async () => {
      return generateGroup(user, {
        type: 'party',
        privacy: 'private',
      }).then((group) => {
        party = group;
      });
    });

    it('deletes party when user is the only member', async () => {
      await user.del('/user');
      await expect(checkExistence('groups', party._id)).to.eventually.eql(false);
    });
  });

  context('last member of a private guild', () => {
    let guild, lastMember;

    beforeEach(async () => {
      let {
        groupLeader,
        group,
      } = await createAndPopulateGroup({
        type: 'guild',
        privacy: 'private',
      });

      guild = group;
      lastMember = groupLeader;
    });

    it('deletes guild when user is the only member', async () => {
      await lastMember.del('/user');
      await expect(checkExistence('groups', guild._id)).to.eventually.eql(false);
    });
  });

  context('groups user is leader of', () => {
    let group, oldLeader, newLeader;

    beforeEach(async () => {
      return createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
        },
        members: 3,
      }).then((res) => {
        group = res.group;
        newLeader = res.members[0];
        oldLeader = res.groupLeader;
      });
    });

    it('chooses new group leader for any group user was the leader of', async () => {
      return oldLeader.del('/user').then(() => {
        return newLeader.get(`/groups/${group._id}`);
      }).then((guild) => {
        expect(guild.leader).to.exist;
        expect(guild.leader._id).to.not.eql(oldLeader._id);
      });
    });
  });

  context('groups user is a part of', () => {
    let group1, group2, userToDelete, otherUser;

    beforeEach(async () => {
      return generateUser({
        balance: 10,
      }).then((_user) => {
        userToDelete = _user;

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

        return userToDelete.post(`/groups/${group2._id}/join`);
      });
    });

    it('removes user from all groups user was a part of', async () => {
      return userToDelete.del('/user').then(() => {
        return otherUser.get(`/groups/${group1._id}`);
      }).then((fetchedGroup1) => {
        expect(fetchedGroup1.members).to.be.empty;

        return otherUser.get(`/groups/${group2._id}`);
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
    let group, userToDelete, otherUser;

    beforeEach(async () => {
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

    it('removes invitations from groups', async () => {
      return userToDelete.del('/user').then(() => {
        return otherUser.get(`/groups/${group._id}`);
      }).then((fetchedGroup) => {
        expect(fetchedGroup.invites).to.have.a.lengthOf(1);
        expect(fetchedGroup.invites[0]._id).to.not.eql(userToDelete._id);
      });
    });
  });
});
