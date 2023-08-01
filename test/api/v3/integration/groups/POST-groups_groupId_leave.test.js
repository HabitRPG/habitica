import { v4 as generateUUID } from 'uuid';
import each from 'lodash/each';
import moment from 'moment';
import {
  generateChallenge,
  checkExistence,
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { model as User } from '../../../../../website/server/models/user';
import payments from '../../../../../website/server/libs/payments/payments';
import calculateSubscriptionTerminationDate from '../../../../../website/server/libs/payments/calculateSubscriptionTerminationDate';

describe('POST /groups/:groupId/leave', () => {
  let groupToLeave;
  let leader;
  let member;
  let members;
  let memberCount;

  context('Leaving a Group Plan', () => {
    beforeEach(async () => {
      ({ group: groupToLeave, groupLeader: leader, members } = await createAndPopulateGroup({
        type: 'guild',
        privacy: 'private',
        members: 1,
        upgradeToGroupPlan: true,
      }));

      [member] = members;
      memberCount = groupToLeave.memberCount;
      await leader.update({ 'auth.timestamps.created': new Date('2022-01-01') });
    });

    it('prevents non members from leaving', async () => {
      const user = await generateUser();
      await expect(user.post(`/groups/${groupToLeave._id}/leave`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
    });

    it('lets user leave', async () => {
      await member.post(`/groups/${groupToLeave._id}/leave`);

      const userThatLeftGroup = await member.get('/user');

      expect(userThatLeftGroup.guilds).to.be.empty;
      expect(userThatLeftGroup.party._id).to.not.exist;
      await groupToLeave.sync();
      expect(groupToLeave.memberCount).to.equal(memberCount - 1);
    });

    it('removes new messages for that group from user', async () => {
      await leader.post(`/groups/${groupToLeave._id}/chat`, { message: 'Some message' });
      await member.sync();

      expect(member.notifications.find(n => n.type === 'NEW_CHAT_MESSAGE' && n.data.group.id === groupToLeave._id)).to.exist;
      expect(member.newMessages[groupToLeave._id]).to.not.be.empty;

      await member.post(`/groups/${groupToLeave._id}/leave`);
      await member.sync();

      expect(member.notifications.find(n => n.type === 'NEW_CHAT_MESSAGE' && n.data.group.id === groupToLeave._id)).to.not.exist;
      expect(member.newMessages[groupToLeave._id]).to.be.undefined;
    });

    context('with challenges', () => {
      let challenge;

      beforeEach(async () => {
        challenge = await generateChallenge(leader, groupToLeave);
        await member.post(`/challenges/${challenge._id}/join`);

        await leader.post(`/tasks/challenge/${challenge._id}`, {
          text: 'test habit',
          type: 'habit',
        });
      });

      it('removes all challenge tasks when keep parameter is set to remove', async () => {
        await member.post(`/groups/${groupToLeave._id}/leave?keep=remove-all`);

        const userWithoutChallengeTasks = await member.get('/user');

        expect(userWithoutChallengeTasks.challenges).to.not.include(challenge._id);
        expect(userWithoutChallengeTasks.tasksOrder.habits).to.be.empty;
      });

      it('keeps all challenge tasks when keep parameter is not set', async () => {
        await member.post(`/groups/${groupToLeave._id}/leave`);

        const userWithChallengeTasks = await member.get('/user');

        expect(userWithChallengeTasks.tasksOrder.habits).to.not.be.empty;
      });

      it('keeps the user in the challenge when the keepChallenges parameter is set to remain-in-challenges', async () => {
        await member.post(`/groups/${groupToLeave._id}/leave`, { keepChallenges: 'remain-in-challenges' });

        const userWithChallengeTasks = await member.get('/user');

        expect(userWithChallengeTasks.challenges).to.include(challenge._id);
      });

      it('drops the user in the challenge when the keepChallenges parameter isn\'t set', async () => {
        await member.post(`/groups/${groupToLeave._id}/leave`);

        const userWithChallengeTasks = await member.get('/user');

        expect(userWithChallengeTasks.challenges).to.not.include(challenge._id);
      });
    });
  });

  context('Leaving a Party', () => {
    let invitees;
    let invitedUser;

    beforeEach(async () => {
      ({
        group: groupToLeave,
        groupLeader: leader,
        members,
        invitees,
      } = await createAndPopulateGroup({
        type: 'party',
        privacy: 'private',
        members: 1,
        invites: 1,
      }));

      [member] = members;
      [invitedUser] = invitees;
      memberCount = groupToLeave.memberCount;
      await leader.update({ 'auth.timestamps.created': new Date('2022-01-01') });
    });

    it('prevents non members from leaving', async () => {
      const user = await generateUser();
      await expect(user.post(`/groups/${groupToLeave._id}/leave`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
    });

    it('lets user leave', async () => {
      await member.post(`/groups/${groupToLeave._id}/leave`);

      const userThatLeftGroup = await member.get('/user');

      expect(userThatLeftGroup.guilds).to.be.empty;
      expect(userThatLeftGroup.party._id).to.not.exist;
      await groupToLeave.sync();
      expect(groupToLeave.memberCount).to.equal(memberCount - 1);
    });

    it('sets a new group leader when leader leaves', async () => {
      await leader.post(`/groups/${groupToLeave._id}/leave`);

      await groupToLeave.sync();
      expect(groupToLeave.memberCount).to.equal(memberCount - 1);
      expect(groupToLeave.leader).to.equal(member._id);
    });

    it('removes new messages for that group from user', async () => {
      await leader.post(`/groups/${groupToLeave._id}/chat`, { message: 'Some message' });
      await member.sync();

      expect(member.notifications.find(n => n.type === 'NEW_CHAT_MESSAGE' && n.data.group.id === groupToLeave._id)).to.exist;
      expect(member.newMessages[groupToLeave._id]).to.not.be.empty;

      await member.post(`/groups/${groupToLeave._id}/leave`);
      await member.sync();

      expect(member.notifications.find(n => n.type === 'NEW_CHAT_MESSAGE' && n.data.group.id === groupToLeave._id)).to.not.exist;
      expect(member.newMessages[groupToLeave._id]).to.be.undefined;
    });

    it('removes a party when the last member leaves', async () => {
      await member.post(`/groups/${groupToLeave._id}/leave`);
      await leader.post(`/groups/${groupToLeave._id}/leave`);

      await expect(checkExistence('party', groupToLeave._id)).to.eventually.equal(false);
    });

    it('removes invitations when the last member leaves a party', async () => {
      await member.post(`/groups/${groupToLeave._id}/leave`);
      await leader.post(`/groups/${groupToLeave._id}/leave`);

      const userWithoutInvitation = await invitedUser.get('/user');

      expect(userWithoutInvitation.invitations.parties[0]).to.be.undefined;
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

    context('with challenges', () => {
      let challenge;

      beforeEach(async () => {
        challenge = await generateChallenge(leader, groupToLeave);
        await member.post(`/challenges/${challenge._id}/join`);

        await leader.post(`/tasks/challenge/${challenge._id}`, {
          text: 'test habit',
          type: 'habit',
        });
      });

      it('removes all challenge tasks when keep parameter is set to remove', async () => {
        await member.post(`/groups/${groupToLeave._id}/leave?keep=remove-all`);

        const userWithoutChallengeTasks = await member.get('/user');

        expect(userWithoutChallengeTasks.challenges).to.not.include(challenge._id);
        expect(userWithoutChallengeTasks.tasksOrder.habits).to.be.empty;
      });

      it('keeps all challenge tasks when keep parameter is not set', async () => {
        await member.post(`/groups/${groupToLeave._id}/leave`);

        const userWithChallengeTasks = await member.get('/user');

        expect(userWithChallengeTasks.tasksOrder.habits).to.not.be.empty;
      });

      it('keeps the user in the challenge when the keepChallenges parameter is set to remain-in-challenges', async () => {
        await member.post(`/groups/${groupToLeave._id}/leave`, { keepChallenges: 'remain-in-challenges' });

        const userWithChallengeTasks = await member.get('/user');

        expect(userWithChallengeTasks.challenges).to.include(challenge._id);
      });

      it('drops the user in the challenge when the keepChallenges parameter isn\'t set', async () => {
        await member.post(`/groups/${groupToLeave._id}/leave`);

        const userWithChallengeTasks = await member.get('/user');

        expect(userWithChallengeTasks.challenges).to.not.include(challenge._id);
      });
    });
  });

  const typesOfGroups = {
    'private guild': { type: 'guild', privacy: 'private' },
    party: { type: 'party', privacy: 'private' },
  };

  each(typesOfGroups, (groupDetails, groupType) => {
    context(`Leaving a group plan when the group is a ${groupType}`, () => {
      let groupWithPlan;

      beforeEach(async () => {
        ({ group: groupWithPlan, groupLeader: leader, members } = await createAndPopulateGroup({
          groupDetails,
          members: 1,
          upgradeToGroupPlan: true,
        }));
        [member] = members;
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
    });
  });

  each(typesOfGroups, (groupDetails, groupType) => {
    context(`Leaving a group with extraMonths left plan when the group is a ${groupType}`, () => {
      const extraMonths = 12;
      let groupWithPlan;

      beforeEach(async () => {
        ({ group: groupWithPlan, members } = await createAndPopulateGroup({
          groupDetails,
          members: 1,
          upgradeToGroupPlan: true,
        }));
        [member] = members;
        await member.update({
          'purchased.plan.extraMonths': extraMonths,
        });
      });

      it('calculates dateTerminated and sets extraMonths to zero after user leaves the group', async () => {
        const userBeforeLeave = await User.findById(member._id).exec();

        await member.post(`/groups/${groupWithPlan._id}/leave`);
        const userAfterLeave = await User.findById(member._id).exec();

        const dateTerminatedBefore = userBeforeLeave.purchased.plan.dateTerminated;
        const extraMonthsBefore = userBeforeLeave.purchased.plan.extraMonths;
        const dateTerminatedAfter = userAfterLeave.purchased.plan.dateTerminated;
        const extraMonthsAfter = userAfterLeave.purchased.plan.extraMonths;

        const expectedTerminationDate = calculateSubscriptionTerminationDate(null, {
          customerId: payments.constants.GROUP_PLAN_CUSTOMER_ID,
          extraMonths,
        }, payments.constants.GROUP_PLAN_CUSTOMER_ID);

        expect(extraMonthsBefore).to.gte(12);
        expect(extraMonthsAfter).to.equal(0);
        expect(dateTerminatedBefore).to.be.null;
        expect(dateTerminatedAfter).to.exist;

        expect(moment(dateTerminatedAfter).diff(expectedTerminationDate, 'days')).to.equal(0);
      });
    });
  });
});
