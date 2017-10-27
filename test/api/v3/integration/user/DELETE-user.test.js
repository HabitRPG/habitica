import {
  checkExistence,
  createAndPopulateGroup,
  generateGroup,
  generateUser,
  generateChallenge,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import {
  find,
  each,
  map,
} from 'lodash';
import Bluebird from 'bluebird';
import {
  sha1MakeSalt,
  sha1Encrypt as sha1EncryptPassword,
} from '../../../../../website/server/libs/password';
import * as email from '../../../../../website/server/libs/email';

const DELETE_CONFIRMATION = 'DELETE';

describe('DELETE /user', () => {
  let user;
  let password = 'password'; // from habitrpg/test/helpers/api-integration/v3/object-generators.js

  context('user with local auth', async () => {
    beforeEach(async () => {
      user = await generateUser({balance: 10});
    });

    it('returns an error if password is wrong', async () => {
      await expect(user.del('/user', {
        password: 'wrong-password',
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('wrongPassword'),
      });
    });

    it('returns an error if password is not supplied', async () => {
      await expect(user.del('/user', {
        password: '',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('missingPassword'),
      });
    });

    it('deletes the user', async () => {
      await user.del('/user', {
        password,
      });
      await expect(checkExistence('users', user._id)).to.eventually.eql(false);
    });

    it('returns an error if excessive feedback is supplied', async () => {
      let feedbackText = 'spam feedback ';
      let feedback = feedbackText;
      while (feedback.length < 10000) {
        feedback = feedback + feedbackText;
      }

      await expect(user.del('/user', {
        password,
        feedback,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Account deletion feedback is limited to 10,000 characters. For lengthy feedback, email admin@habitica.com.',
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
      await user.post('/tasks/user', {
        text: 'test habit',
        type: 'habit',
      });
      await user.sync();

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

    it('reduces memberCount in challenges user is linked to', async () => {
      let populatedGroup = await createAndPopulateGroup({
        members: 2,
      });

      let group = populatedGroup.group;
      let authorizedUser = populatedGroup.members[1];

      let challenge = await generateChallenge(populatedGroup.groupLeader, group);
      await authorizedUser.post(`/challenges/${challenge._id}/join`);

      await challenge.sync();

      expect(challenge.memberCount).to.eql(2);

      await authorizedUser.del('/user', {
        password,
      });

      await challenge.sync();

      expect(challenge.memberCount).to.eql(1);
    });

    it('sends feedback to the admin email', async () => {
      sandbox.spy(email, 'sendTxn');

      let feedback = 'Reasons for Deletion';
      await user.del('/user', {
        password,
        feedback,
      });

      expect(email.sendTxn).to.be.calledOnce;

      sandbox.restore();
    });

    it('does not send email if no feedback is supplied', async () => {
      sandbox.spy(email, 'sendTxn');

      await user.del('/user', {
        password,
      });

      expect(email.sendTxn).to.not.be.called;

      sandbox.restore();
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

  context('user with Facebook auth', async () => {
    beforeEach(async () => {
      user = await generateUser({
        auth: {
          facebook: {
            id: 'facebook-id',
          },
        },
      });
    });

    it('returns an error if confirmation phrase is wrong', async () => {
      await expect(user.del('/user', {
        password: 'just-do-it',
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('incorrectDeletePhrase', {magicWord: 'DELETE'}),
      });
    });

    it('returns an error if confirmation phrase is not supplied', async () => {
      await expect(user.del('/user', {
        password: '',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('missingPassword'),
      });
    });

    it('deletes a Facebook user', async () => {
      await user.del('/user', {
        password: DELETE_CONFIRMATION,
      });
      await expect(checkExistence('users', user._id)).to.eventually.eql(false);
    });
  });

  context('user with Google auth', async () => {
    beforeEach(async () => {
      user = await generateUser({
        auth: {
          google: {
            id: 'google-id',
          },
        },
      });
    });

    it('deletes a Google user', async () => {
      await user.del('/user', {
        password: DELETE_CONFIRMATION,
      });
      await expect(checkExistence('users', user._id)).to.eventually.eql(false);
    });
  });
});
