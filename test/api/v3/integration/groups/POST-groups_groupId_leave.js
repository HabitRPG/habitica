import {
  generateUser,
  generateChallenge,
  checkExistence,
  sleep,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /groups/:groupId/leave', () => {
  let user;
  let userToInvite;

  beforeEach(async () => {
    user = await generateUser({balance: 2});
    userToInvite = await generateUser();
  });

  context('leaving guilds', () => {
    let guild;

    beforeEach(async () => {
      guild = await user.post('/groups', {
        name: 'Test Guild',
        type: 'guild',
      });
      await user.post(`/groups/${guild._id}/invite`, {
        uuids: [userToInvite._id],
      });
    });

    it('lets user leave a guild', async () => {
      await userToInvite.post(`/groups/${guild._id}/join`);
      await userToInvite.post(`/groups/${guild._id}/leave`);

      let userThatLeftGuild = await userToInvite.get('/user');

      expect(userThatLeftGuild.guilds).to.be.empty;
    });

    it('sets a new group leader when leader leaves a guild', async () => {
      await userToInvite.post(`/groups/${guild._id}/join`);
      await user.post(`/groups/${guild._id}/leave`);

      let guildWithNewLeader = await userToInvite.get(`/groups/${guild._id}`);

      expect(guildWithNewLeader.leader._id).to.equal(userToInvite._id);
    });

    it('removes a group and invitations when the last member leaves', async () => {
      await user.post(`/groups/${guild._id}/leave`);

      let groups = await user.get('/groups?type=party,privateGuilds,publicGuilds,tavern');
      let userWithoutInvitation = await userToInvite.get('/user');

      expect(_.findIndex(groups, {_id: guild._id})).to.equal(-1);
      expect(userWithoutInvitation.invitations.guilds).to.be.empty;
      await expect(checkExistence('groups', guild._id)).to.eventually.equal(false);
    });

    context('leaving with challenges', () => {
      let challenge;

      beforeEach(async () => {
        challenge = await generateChallenge(user, guild);

        await user.post(`/tasks/challenge/${challenge._id}`, {
          text: 'test habit',
          type: 'habit',
        });
        await sleep(2);
      });

      it('removes all challenge tasks when keep parameter is set to remove', async () => {
        await user.post(`/groups/${guild._id}/leave?keep=remove-all`);

        let userWithoutChallenges = await user.get('/user');

        expect(userWithoutChallenges.challenges.indexOf(challenge._id)).to.equal(-1);
        expect(userWithoutChallenges.tasksOrder.habits.length).to.equal(0);
      });

      it('keeps all challenge tasks when keep parameter is not set', async () => {
        await user.post(`/groups/${guild._id}/leave`);

        let userWithChallenges = await user.get('/user');

        expect(userWithChallenges.challenges.indexOf(challenge._id)).to.equal(-1);
        expect(userWithChallenges.tasksOrder.habits.length).to.equal(1);
      });
    });
  });

  context('leaving parties', () => {
    let party;

    beforeEach(async () => {
      party = await user.post('/groups', {
        name: 'Test Party',
        type: 'party',
      });
      await user.post(`/groups/${party._id}/invite`, {
        uuids: [userToInvite._id],
      });
      await userToInvite.post(`/groups/${party._id}/join`);
    });

    it('lets user leave a party', async () => {
      await userToInvite.post(`/groups/${party._id}/leave`);

      let userWithoutParty = await userToInvite.get('/user');
      expect(userWithoutParty.party._id).to.not.exist;
    });

    it('sets a new group leader when leader leaves a party', async () => {
      await user.post(`/groups/${party._id}/leave`);

      let partyWithNewLeader = await userToInvite.get(`/groups/${party._id}`);

      expect(partyWithNewLeader.leader._id).to.equal(userToInvite._id);
    });

    it('removes a group and invitations when the last member party', async () => {
      await user.post(`/groups/${party._id}/leave`);

      await user.get('/groups?type=party,privateGuilds,publicGuilds,tavern');
      let userWithoutInvitation = await userToInvite.get('/user');

      expect(user.party._id).to.equal(undefined);
      expect(userWithoutInvitation.invitations.party).to.be.empty;
      await expect(checkExistence('party', party._id)).to.eventually.equal(false);
    });

    context('leaving with challenges', () => {
      let challenge;

      beforeEach(async () => {
        challenge = await generateChallenge(user, party);

        await user.post(`/tasks/challenge/${challenge._id}`, {
          text: 'test habit',
          type: 'habit',
        });
        await sleep(2);
      });

      it('removes all challenge tasks when keep parameter is set to remove', async () => {
        await user.post(`/groups/${party._id}/leave?keep=remove-all`);

        let userWithoutChallenges = await user.get('/user');

        expect(userWithoutChallenges.challenges.indexOf(challenge._id)).to.equal(-1);
        expect(userWithoutChallenges.tasksOrder.habits.length).to.equal(0);
      });

      it('keeps all challenge tasks when keep parameter is not set', async () => {
        await user.post(`/groups/${party._id}/leave`);

        let userWithChallenges = await user.get('/user');

        expect(userWithChallenges.challenges.indexOf(challenge._id)).to.equal(-1);
        expect(userWithChallenges.tasksOrder.habits.length).to.equal(1);
      });
    });

    xit('prevents quest leader from leaving a guild', async () => {});
    xit('prevents a user from leaving during an active quest', async () => {});
  });
});
