import { v4 as generateUUID } from 'uuid';
import {
  each,
} from 'lodash';
import {
  generateChallenge,
  checkExistence,
  createAndPopulateGroup,
  sleep,
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { model as User } from '../../../../../website/server/models/user';
import payments from '../../../../../website/server/libs/payments/payments';

describe('POST /groups/:groupId/leave', () => {
  const typesOfGroups = {
    'public guild': { type: 'guild', privacy: 'public' },
    'private guild': { type: 'guild', privacy: 'private' },
    party: { type: 'party', privacy: 'private' },
  };

  each(typesOfGroups, (groupDetails, groupType) => {
    context(`Leaving a ${groupType}`, () => {
      let groupToLeave;
      let leader;
      let member;
      let memberCount;

      beforeEach(async () => {
        const { group, groupLeader, members } = await createAndPopulateGroup({
          groupDetails,
          members: 1,
        });

        groupToLeave = group;
        leader = groupLeader;
        member = members[0]; // eslint-disable-line prefer-destructuring
        memberCount = group.memberCount;
      });

      it('prevents non members from leaving', async () => {
        const user = await generateUser();
        await expect(user.post(`/groups/${groupToLeave._id}/leave`)).to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });
      });

      it(`lets user leave a ${groupType}`, async () => {
        await member.post(`/groups/${groupToLeave._id}/leave`);

        const userThatLeftGroup = await member.get('/user');

        expect(userThatLeftGroup.guilds).to.be.empty;
        expect(userThatLeftGroup.party._id).to.not.exist;
        await groupToLeave.sync();
        expect(groupToLeave.memberCount).to.equal(memberCount - 1);
      });

      it(`sets a new group leader when leader leaves a ${groupType}`, async () => {
        await leader.post(`/groups/${groupToLeave._id}/leave`);

        await groupToLeave.sync();
        expect(groupToLeave.memberCount).to.equal(memberCount - 1);
        expect(groupToLeave.leader).to.equal(member._id);
      });

      it('removes new messages for that group from user', async () => {
        await member.post(`/groups/${groupToLeave._id}/chat`, { message: 'Some message' });

        await sleep(0.5);

        await leader.sync();

        expect(leader.notifications.find(n => n.type === 'NEW_CHAT_MESSAGE' && n.data.group.id === groupToLeave._id)).to.exist;
        expect(leader.newMessages[groupToLeave._id]).to.not.be.empty;

        await leader.post(`/groups/${groupToLeave._id}/leave`);
        await leader.sync();

        expect(leader.notifications.find(n => n.type === 'NEW_CHAT_MESSAGE' && n.data.group.id === groupToLeave._id)).to.not.exist;
        expect(leader.newMessages[groupToLeave._id]).to.be.undefined;
      });

      context('with challenges', () => {
        let challenge;

        beforeEach(async () => {
          challenge = await generateChallenge(leader, groupToLeave);
          await leader.post(`/challenges/${challenge._id}/join`);

          await leader.post(`/tasks/challenge/${challenge._id}`, {
            text: 'test habit',
            type: 'habit',
          });

          await sleep(0.5);
        });

        it('removes all challenge tasks when keep parameter is set to remove', async () => {
          await leader.post(`/groups/${groupToLeave._id}/leave?keep=remove-all`);

          const userWithoutChallengeTasks = await leader.get('/user');

          expect(userWithoutChallengeTasks.challenges).to.not.include(challenge._id);
          expect(userWithoutChallengeTasks.tasksOrder.habits).to.be.empty;
        });

        it('keeps all challenge tasks when keep parameter is not set', async () => {
          await leader.post(`/groups/${groupToLeave._id}/leave`);

          const userWithChallengeTasks = await leader.get('/user');

          // @TODO find elegant way to assert against the task existing
          expect(userWithChallengeTasks.tasksOrder.habits).to.not.be.empty;
        });

        it('keeps the user in the challenge when the keepChallenges parameter is set to remain-in-challenges', async () => {
          await leader.post(`/groups/${groupToLeave._id}/leave`, { keepChallenges: 'remain-in-challenges' });

          const userWithChallengeTasks = await leader.get('/user');

          expect(userWithChallengeTasks.challenges).to.include(challenge._id);
        });

        it('drops the user in the challenge when the keepChallenges parameter isn\'t set', async () => {
          await leader.post(`/groups/${groupToLeave._id}/leave`);

          const userWithChallengeTasks = await leader.get('/user');

          expect(userWithChallengeTasks.challenges).to.not.include(challenge._id);
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
        const { group, groupLeader, invitees } = await createAndPopulateGroup({
          groupDetails: {
            name: 'Test Private Guild',
            type: 'guild',
          },
          invites: 1,
        });

        privateGuild = group;
        leader = groupLeader;
        invitedUser = invitees[0]; // eslint-disable-line prefer-destructuring

        await leader.post(`/groups/${group._id}/chat`, { message: 'Some message' });
      });

      it('removes a group when the last member leaves', async () => {
        await leader.post(`/groups/${privateGuild._id}/leave`);

        await expect(checkExistence('groups', privateGuild._id)).to.eventually.equal(false);
      });

      it('removes invitations when the last member leaves', async () => {
        await leader.post(`/groups/${privateGuild._id}/leave`);

        const userWithoutInvitation = await invitedUser.get('/user');

        expect(userWithoutInvitation.invitations.guilds).to.be.empty;
      });
    });

    context('public guild', () => {
      let publicGuild;
      let leader;
      let invitedUser;

      beforeEach(async () => {
        const { group, groupLeader, invitees } = await createAndPopulateGroup({
          groupDetails: {
            name: 'Test Public Guild',
            type: 'guild',
            privacy: 'public',
          },
          invites: 1,
        });

        publicGuild = group;
        leader = groupLeader;
        invitedUser = invitees[0]; // eslint-disable-line prefer-destructuring
      });

      it('keeps the group when the last member leaves', async () => {
        await leader.post(`/groups/${publicGuild._id}/leave`);

        await expect(checkExistence('groups', publicGuild._id)).to.eventually.equal(true);
      });

      it('keeps the invitations when the last member leaves a public guild', async () => {
        await leader.post(`/groups/${publicGuild._id}/leave`);

        const userWithoutInvitation = await invitedUser.get('/user');

        expect(userWithoutInvitation.invitations.guilds).to.not.be.empty;
      });

      it('deletes non existent guild from user when user tries to leave', async () => {
        const nonExistentGuildId = generateUUID();
        const userWithNonExistentGuild = await generateUser({ guilds: [nonExistentGuildId] });
        expect(userWithNonExistentGuild.guilds).to.contain(nonExistentGuildId);

        await expect(userWithNonExistentGuild.post(`/groups/${nonExistentGuildId}/leave`))
          .to.eventually.be.rejected;

        await userWithNonExistentGuild.sync();

        expect(userWithNonExistentGuild.guilds).to.not.contain(nonExistentGuildId);
      });
    });

    context('party', () => {
      let party;
      let leader;
      let invitedUser;

      beforeEach(async () => {
        const { group, groupLeader, invitees } = await createAndPopulateGroup({
          groupDetails: {
            name: 'Test Party',
            type: 'party',
          },
          invites: 1,
        });

        party = group;
        leader = groupLeader;
        invitedUser = invitees[0]; // eslint-disable-line prefer-destructuring
      });

      it('removes a group when the last member leaves a party', async () => {
        await leader.post(`/groups/${party._id}/leave`);

        await expect(checkExistence('party', party._id)).to.eventually.equal(false);
      });

      it('removes invitations when the last member leaves a party', async () => {
        await leader.post(`/groups/${party._id}/leave`);

        const userWithoutInvitation = await invitedUser.get('/user');

        expect(userWithoutInvitation.invitations.parties[0]).to.be.undefined;
      });
    });

    it('deletes non existent party from user when user tries to leave', async () => {
      const nonExistentPartyId = generateUUID();
      const userWithNonExistentParty = await generateUser({ 'party._id': nonExistentPartyId });
      expect(userWithNonExistentParty.party._id).to.eql(nonExistentPartyId);

      await expect(userWithNonExistentParty.post(`/groups/${nonExistentPartyId}/leave`))
        .to.eventually.be.rejected;

      await userWithNonExistentParty.sync();

      expect(userWithNonExistentParty.party).to.eql({});
    });
  });

  each(typesOfGroups, (groupDetails, groupType) => {
    context(`Leaving a group plan when the group is a ${groupType}`, () => {
      let groupWithPlan;
      let leader;
      let member;

      beforeEach(async () => {
        const { group, groupLeader, members } = await createAndPopulateGroup({
          groupDetails,
          members: 1,
        });
        leader = groupLeader;
        member = members[0]; // eslint-disable-line prefer-destructuring
        groupWithPlan = group;
        const userWithFreePlan = await User.findById(leader._id).exec();

        // Create subscription
        const paymentData = {
          user: userWithFreePlan,
          groupId: groupWithPlan._id,
          sub: {
            key: 'basic_3mo',
          },
          customerId: 'customer-id',
          paymentMethod: 'Payment Method',
          headers: {
            'x-client': 'habitica-web',
            'user-agent': '',
          },
        };
        await payments.createSubscription(paymentData);
        await member.sync();
      });

      it('cancels the free subscription', async () => {
        expect(member.purchased.plan.planId).to.equal('group_plan_auto');
        expect(member.purchased.plan.dateTerminated).to.not.exist;

        // Leave
        await member.post(`/groups/${groupWithPlan._id}/leave`);
        await member.sync();
        expect(member.purchased.plan.dateTerminated).to.exist;
      });

      it('preserves the free subscription when leaving a any other group without a plan', async () => {
        // Joining a guild without a group plan
        const { group: groupWithNoPlan } = await createAndPopulateGroup({
          groupDetails: {
            name: 'Group Without Plan',
            type: 'guild',
            privacy: 'public',
          },
        });

        await member.post(`/groups/${groupWithNoPlan._id}/join`);
        await member.sync();
        expect(member.purchased.plan.planId).to.equal('group_plan_auto');
        expect(member.purchased.plan.dateTerminated).to.not.exist;

        // Leaving the guild without a group plan
        await member.post(`/groups/${groupWithNoPlan._id}/leave`);
        await member.sync();
        expect(member.purchased.plan.dateTerminated).to.not.exist;
      });
    });
  });
});
