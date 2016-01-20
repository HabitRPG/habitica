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

          expect(userWithoutChallenges.challenges).to.not.include(challenge._id);
          expect(userWithoutChallenges.tasksOrder.habits.length).to.equal(0);
        });

        it('keeps all challenge tasks when keep parameter is not set', async () => {
          await leader.post(`/groups/${groupToLeave._id}/leave`);

          let userWithChallenges = await leader.get('/user');

          expect(userWithChallenges.challenges).to.not.include(challenge._id);
          expect(userWithChallenges.tasksOrder.habits.length).to.equal(1);
        });
      });

      it('prevents quest leader from leaving a groupToLeave');
      it('prevents a user from leaving during an active quest');
    });
  });

  context('Leaving a group as the last member', () => {
    context('private guild', () => {
      let privateGuild;
      let leader;
      let invitedUser;

      beforeEach(async () => {
        let { group, groupLeader, invitees } = await createAndPopulateGroup({
          groupDetails: {
            name: 'Test Private Guild',
            type: 'guild',
          },
          invites: 1,
        });

        privateGuild = group;
        leader = groupLeader;
        invitedUser = invitees[0];
      });

      it('removes a group when the last member leaves', async () => {
        await leader.post(`/groups/${privateGuild._id}/leave`);

        let groups = await leader.get('/groups?type=party,privateGuilds,publicGuilds,tavern');

        expect(_.findIndex(groups, {_id: privateGuild._id})).to.equal(-1);
        await expect(checkExistence('groups', privateGuild._id)).to.eventually.equal(false);
      });

      it('removes invitations when the last member leaves', async () => {
        await leader.post(`/groups/${privateGuild._id}/leave`);

        let userWithoutInvitation = await invitedUser.get('/user');

        expect(userWithoutInvitation.invitations.guilds).to.be.empty;
      });
    });

    context('public guild', () => {
      let publicGuild;
      let leader;
      let invitedUser;

      beforeEach(async () => {
        let { group, groupLeader, invitees } = await createAndPopulateGroup({
          groupDetails: {
            name: 'Test Public Guild',
            type: 'guild',
            privacy: 'public',
          },
          invites: 1,
        });

        publicGuild = group;
        leader = groupLeader;
        invitedUser = invitees[0];
      });

      it('keeps the group when the last member leaves a public guild', async () => {
        await leader.post(`/groups/${publicGuild._id}/leave`);

        let groups = await leader.get('/groups?type=party,privateGuilds,publicGuilds,tavern');

        expect(_.findIndex(groups, {_id: publicGuild._id})).to.be.above(-1);
        await expect(checkExistence('groups', publicGuild._id)).to.eventually.equal(true);
      });

      it('keeps the invitations when the last member leaves a public guild', async () => {
        await leader.post(`/groups/${publicGuild._id}/leave`);

        let userWithoutInvitation = await invitedUser.get('/user');

        expect(userWithoutInvitation.invitations.guilds).to.not.be.empty;
      });
    });

    context('party', () => {
      let party;
      let leader;
      let invitedUser;

      beforeEach(async () => {
        let { group, groupLeader, invitees } = await createAndPopulateGroup({
          groupDetails: {
            name: 'Test Party',
            type: 'party',
          },
          invites: 1,
        });

        party = group;
        leader = groupLeader;
        invitedUser = invitees[0];
      });

      it('removes a group when the last member leaves a party', async () => {
        await leader.post(`/groups/${party._id}/leave`);

        await leader.get('/groups?type=party,privateGuilds,publicGuilds,tavern');

        expect(leader.party._id).to.equal(undefined);
        await expect(checkExistence('party', party._id)).to.eventually.equal(false);
      });

      it('removes invitations when the last member leaves a party', async () => {
        await leader.post(`/groups/${party._id}/leave`);

        let userWithoutInvitation = await invitedUser.get('/user');

        expect(userWithoutInvitation.invitations.party).to.be.empty;
      });
    });
  });
});
