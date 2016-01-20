import {
  generateChallenge,
  checkExistence,
  createAndPopulateGroup,
  sleep,
} from '../../../../helpers/api-v3-integration.helper';
import {
  each,
} from 'lodash';

describe('POST /groups/:groupId/leave', () => {
  let typesOfGroups = {};
  typesOfGroups['public guild'] = { type: 'guild', privacy: 'public' };
  typesOfGroups['private guild'] = { type: 'guild', privacy: 'private' };
  typesOfGroups.party = { type: 'party', privacy: 'private' };

  each(typesOfGroups, (groupDetails, groupType) => {
    context(`Leaving a ${groupType}`, () => {
      let groupToLeave;
      let leader;
      let member;

      beforeEach(async () => {
        let { group, groupLeader, members } = await createAndPopulateGroup({
          groupDetails,
          members: 1,
        });

        groupToLeave = group;
        leader = groupLeader;
        member = members[0];
      });

      it(`lets user leave a ${groupType}`, async () => {
        await member.post(`/groups/${groupToLeave._id}/leave`);

        let userThatLeftGroup = await member.get('/user');

        expect(userThatLeftGroup.guilds).to.be.empty;
        expect(userThatLeftGroup.party._id).to.not.exist;
      });

      it(`sets a new group leader when leader leaves a ${groupType}`, async () => {
        await leader.post(`/groups/${groupToLeave._id}/leave`);

        let groupToLeaveWithNewLeader = await member.get(`/groups/${groupToLeave._id}`);

        expect(groupToLeaveWithNewLeader.leader._id).to.equal(member._id);
      });

      context('leaving with challenges', () => {
        let challenge;

        beforeEach(async () => {
          challenge = await generateChallenge(leader, groupToLeave);

          await leader.post(`/tasks/challenge/${challenge._id}`, {
            text: 'test habit',
            type: 'habit',
          });
          await sleep(2);
        });

        it('removes all challenge tasks when keep parameter is set to remove', async () => {
          await leader.post(`/groups/${groupToLeave._id}/leave?keep=remove-all`);

          let userWithoutChallenges = await leader.get('/user');

          expect(userWithoutChallenges.challenges.indexOf(challenge._id)).to.equal(-1);
          expect(userWithoutChallenges.tasksOrder.habits.length).to.equal(0);
        });

        it('keeps all challenge tasks when keep parameter is not set', async () => {
          await leader.post(`/groups/${groupToLeave._id}/leave`);

          let userWithChallenges = await leader.get('/user');

          expect(userWithChallenges.challenges.indexOf(challenge._id)).to.equal(-1);
          expect(userWithChallenges.tasksOrder.habits.length).to.equal(1);
        });
      });

      xit('prevents quest leader from leaving a groupToLeave', async () => {});
      xit('prevents a user from leaving during an active quest', async () => {});
    });
  });

  context('Leaving a group as the last member', () => {
    it('removes a group and invitations when the last member leaves a private guild', async () => {
      let { group, groupLeader, invitees } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Private Guild',
          type: 'guild',
        },
        invites: 1,
      });

      await groupLeader.post(`/groups/${group._id}/leave`);

      let groups = await groupLeader.get('/groups?type=party,privateGuilds,publicGuilds,tavern');
      let userWithoutInvitation = await invitees[0].get('/user');

      expect(_.findIndex(groups, {_id: group._id})).to.equal(-1);
      expect(userWithoutInvitation.invitations.guilds).to.be.empty;
      await expect(checkExistence('groups', group._id)).to.eventually.equal(false);
    });

    it('removes invitations but not the group when the last member leaves a public guild', async () => {
      let { group, groupLeader, invitees } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Public Guild',
          type: 'guild',
          privacy: 'public',
        },
        invites: 1,
      });

      await groupLeader.post(`/groups/${group._id}/leave`);

      let groups = await groupLeader.get('/groups?type=party,privateGuilds,publicGuilds,tavern');
      let userWithoutInvitation = await invitees[0].get('/user');

      expect(_.findIndex(groups, {_id: group._id})).to.be.above(-1);
      expect(userWithoutInvitation.invitations.guilds).to.be.empty;
      await expect(checkExistence('groups', group._id)).to.eventually.equal(true);
    });

    it('removes a group and invitations when the last member leaves a party', async () => {
      let { group, groupLeader, invitees } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Party',
          type: 'party',
        },
        invites: 1,
      });

      await groupLeader.post(`/groups/${group._id}/leave`);

      await groupLeader.get('/groups?type=party,privateGuilds,publicGuilds,tavern');
      let userWithoutInvitation = await invitees[0].get('/user');

      expect(groupLeader.party._id).to.equal(undefined);
      expect(userWithoutInvitation.invitations.party).to.be.empty;
      await expect(checkExistence('party', group._id)).to.eventually.equal(false);
    });
  });
});
