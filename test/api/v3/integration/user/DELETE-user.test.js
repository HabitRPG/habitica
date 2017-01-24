import {
  checkExistence,
  createAndPopulateGroup,
  generateGroup,
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import {
  find,
  each,
  map,
} from 'lodash';
import Bluebird from 'bluebird';
import {
  bcryptCompare,
  sha1MakeSalt,
  sha1Encrypt as sha1EncryptPassword,
} from '../../../../../website/server/libs/password';

describe('DELETE /user', () => {
  let user;
  let password = 'password'; // from habitrpg/test/helpers/api-integration/v3/object-generators.js

  beforeEach(async () => {
    user = await generateUser({balance: 10});
  });

  it('returns an errors if password is wrong', async () => {
    await expect(user.del('/user', {
      password: 'wrong-password',
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('wrongPassword'),
    });
  });

  it('returns an error if user has active subscription', async () => {
    let userWithSubscription = await generateUser({'purchased.plan.customerId': 'fake-customer-id'});

    await expect(userWithSubscription.del('/user', {
      password,
    })).to.be.rejected.and.to.eventually.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('cannotDeleteActiveAccount'),
    });
  });

  it('deletes the user\'s tasks', async () => {
    // gets the user's tasks ids
    let ids = [];
    each(user.tasksOrder, (idsForOrder) => {
      ids.push(...idsForOrder);
    });

    expect(ids.length).to.be.above(0); // make sure the user has some task to delete

    await user.del('/user', {
      password,
    });

    await Bluebird.all(map(ids, id => {
      return expect(checkExistence('tasks', id)).to.eventually.eql(false);
    }));
  });

  it('deletes the user', async () => {
    await user.del('/user', {
      password,
    });
    await expect(checkExistence('users', user._id)).to.eventually.eql(false);
  });

  it('deletes the user with a legacy sha1 password', async () => {
    let textPassword = 'mySecretPassword';
    let salt = sha1MakeSalt();
    let sha1HashedPassword = sha1EncryptPassword(textPassword, salt);

    await user.update({
      'auth.local.hashed_password': sha1HashedPassword,
      'auth.local.passwordHashMethod': 'sha1',
      'auth.local.salt': salt,
    });

    await user.sync();

    expect(user.auth.local.passwordHashMethod).to.equal('sha1');
    expect(user.auth.local.salt).to.equal(salt);
    expect(user.auth.local.hashed_password).to.equal(sha1HashedPassword);

    // delete the user
    await user.del('/user', {
      password: textPassword,
    });
    await expect(checkExistence('users', user._id)).to.eventually.eql(false);
  });

  context('last member of a party', () => {
    let party;

    beforeEach(async () => {
      party = await generateGroup(user, {
        type: 'party',
        privacy: 'private',
      });
    });

    it('deletes party when user is the only member', async () => {
      await user.del('/user', {
        password,
      });
      await expect(checkExistence('party', party._id)).to.eventually.eql(false);
    });
  });

  context('last member of a private guild', () => {
    let privateGuild;

    beforeEach(async () => {
      privateGuild = await generateGroup(user, {
        type: 'guild',
        privacy: 'private',
      });
    });

    it('deletes guild when user is the only member', async () => {
      await user.del('/user', {
        password,
      });
      await expect(checkExistence('groups', privateGuild._id)).to.eventually.eql(false);
    });
  });

  context('groups user is leader of', () => {
    let guild, oldLeader, newLeader;

    beforeEach(async () => {
      let { group, groupLeader, members } = await createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
        },
        members: 1,
      });

      guild = group;
      newLeader = members[0];
      oldLeader = groupLeader;
    });

    it('chooses new group leader for any group user was the leader of', async () => {
      await oldLeader.del('/user', {
        password,
      });

      let updatedGuild = await newLeader.get(`/groups/${guild._id}`);

      expect(updatedGuild.leader).to.exist;
      expect(updatedGuild.leader._id).to.not.eql(oldLeader._id);
    });
  });

  context('groups user is a part of', () => {
    let group1, group2, userToDelete, otherUser;

    beforeEach(async () => {
      userToDelete = await generateUser({balance: 10});

      group1 = await generateGroup(userToDelete, {
        type: 'guild',
        privacy: 'public',
      });

      let {group, members} = await createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
        },
        members: 3,
      });

      group2 = group;
      otherUser = members[0];

      await userToDelete.post(`/groups/${group2._id}/join`);
    });

    it('removes user from all groups user was a part of', async () => {
      await userToDelete.del('/user', {
        password,
      });

      let updatedGroup1Members = await otherUser.get(`/groups/${group1._id}/members`);
      let updatedGroup2Members = await otherUser.get(`/groups/${group2._id}/members`);
      let userInGroup = find(updatedGroup2Members, (member) => {
        return member._id === userToDelete._id;
      });

      expect(updatedGroup1Members).to.be.empty;
      expect(updatedGroup2Members).to.not.be.empty;
      expect(userInGroup).to.not.exist;
    });
  });
});
