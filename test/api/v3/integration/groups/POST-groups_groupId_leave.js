import {
  generateChallenge,
  checkExistence,
  createAndPopulateGroup,
  sleep,
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';
import {
  each,
} from 'lodash';

describe('POST /groups/:groupId/leave', () => {
  let typesOfGroups = {
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
        let { group, groupLeader, members } = await createAndPopulateGroup({
          groupDetails,
          members: 1,
        });

        groupToLeave = group;
        leader = groupLeader;
        member = members[0];
        memberCount = group.memberCount;
      });

      it('prevents non members from leaving', async () => {
        let user = await generateUser();
        await expect(user.post(`/groups/${groupToLeave._id}/leave`)).to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });
      });

      it(`lets user leave a ${groupType}`, async () => {
        await member.post(`/groups/${groupToLeave._id}/leave`);

        let userThatLeftGroup = await member.get('/user');

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

      context('With challenges', () => {
        let challenge;

        beforeEach(async () => {
          challenge = await generateChallenge(leader, groupToLeave);

          await leader.post(`/tasks/challenge/${challenge._id}`, {
            text: 'test habit',
            type: 'habit',
          });

          await sleep(0.5);
        });

        it('removes all challenge tasks when keep parameter is set to remove', async () => {
          await leader.post(`/groups/${groupToLeave._id}/leave?keep=remove-all`);

          let userWithoutChallengeTasks = await leader.get('/user');

          expect(userWithoutChallengeTasks.challenges).to.not.include(challenge._id);
          expect(userWithoutChallengeTasks.tasksOrder.habits).to.be.empty;
        });

        it('keeps all challenge tasks when keep parameter is not set', async () => {
          await leader.post(`/groups/${groupToLeave._id}/leave`);

          let userWithChallengeTasks = await leader.get('/user');

          expect(userWithChallengeTasks.challenges).to.not.include(challenge._id);
          // @TODO find elegant way to assert against the task existing
          expect(userWithChallengeTasks.tasksOrder.habits).to.not.be.empty;
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

      it('keeps the group when the last member leaves', async () => {
        await leader.post(`/groups/${publicGuild._id}/leave`);

        await expect(checkExistence('groups', publicGuild._id)).to.eventually.equal(true);
      });

      it('keeps the invitations when the last member leaves a public guild', async () => {
        await leader.post(`/groups/${publicGuild._id}/leave`);

        let userWithoutInvitation = await invitedUser.get('/user');

        expect(userWithoutInvitation.invitations.guilds).to.not.be.empty;
      });

      it('deletes non existant guild from user when user tries to leave', async () => {
        let nonExistentGuildId = generateUUID();
        let userWithNonExistentGuild = await generateUser({guilds: [nonExistentGuildId]});
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

        await expect(checkExistence('party', party._id)).to.eventually.equal(false);
      });

      it('removes invitations when the last member leaves a party', async () => {
        await leader.post(`/groups/${party._id}/leave`);

        let userWithoutInvitation = await invitedUser.get('/user');

        expect(userWithoutInvitation.invitations.party).to.be.empty;
      });
    });

    it('deletes non existant party from user when user tries to leave', async () => {
      let nonExistentPartyId = generateUUID();
      let userWithNonExistentParty = await generateUser({'party._id': nonExistentPartyId});
      expect(userWithNonExistentParty.party._id).to.be.eql(nonExistentPartyId);

      await expect(userWithNonExistentParty.post(`/groups/${nonExistentPartyId}/leave`))
        .to.eventually.be.rejected;

      await userWithNonExistentParty.sync();

      expect(userWithNonExistentParty.party).to.eql({});
    });
  });
});
