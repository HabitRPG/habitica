import { v4 as generateUUID } from 'uuid';
import {
  createAndPopulateGroup,
  translate as t,
  server,
  sleep,
} from '../../../../helpers/api-integration/v3';
import { quests as questScrolls } from '../../../../../website/common/script/content/quests';
import { chatModel as Chat } from '../../../../../website/server/models/message';
import apiError from '../../../../../website/server/libs/apiError';

describe('POST /groups/:groupId/quests/invite/:questKey', () => {
  let questingGroup;
  let leader;
  let member;
  const PET_QUEST = 'whale';

  beforeEach(async () => {
    const { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: { type: 'party', privacy: 'private' },
      members: 1,
    });

    questingGroup = group;
    leader = groupLeader;
    member = members[0]; // eslint-disable-line prefer-destructuring
  });

  context('failure conditions', () => {
    it('does not issue invites with an invalid group ID', async () => {
      await expect(leader.post(`/groups/${generateUUID()}/quests/invite/${PET_QUEST}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
    });

    it('does not issue invites for a group in which user is not a member', async () => {
      const { group } = await createAndPopulateGroup({
        groupDetails: { type: 'party', privacy: 'private' },
        members: 1,
      });

      const alternateGroup = group;

      await expect(leader.post(`/groups/${alternateGroup._id}/quests/invite/${PET_QUEST}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
    });

    it('does not issue invites for Guilds', async () => {
      const { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'guild', privacy: 'private' },
        members: 1,
        upgradeToGroupPlan: true,
      });

      await expect(groupLeader.post(`/groups/${group._id}/quests/invite/${PET_QUEST}`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('guildQuestsNotSupported'),
      });
    });

    it('does not issue invites with an invalid quest key', async () => {
      const FAKE_QUEST = 'herkimer';

      await expect(leader.post(`/groups/${questingGroup._id}/quests/invite/${FAKE_QUEST}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: apiError('questNotFound', { key: FAKE_QUEST }),
      });
    });

    it('does not issue invites for a quest the user does not own', async () => {
      await expect(leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('questNotOwned'),
      });
    });

    it('does not issue invites if a quest is already underway', async () => {
      const QUEST_IN_PROGRESS = 'atom1';
      const leaderUpdate = {};
      leaderUpdate[`items.quests.${PET_QUEST}`] = 1;

      await leader.update(leaderUpdate);
      await questingGroup.update({ 'quest.key': QUEST_IN_PROGRESS });

      await expect(leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('questAlreadyUnderway'),
      });
    });
  });

  context('successfully issuing a quest invitation', () => {
    beforeEach(async () => {
      const memberUpdate = {};
      memberUpdate[`items.quests.${PET_QUEST}`] = 1;

      await Promise.all([
        leader.update(memberUpdate),
        member.update(memberUpdate),
      ]);
    });

    it('adds quest details to group object', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      await questingGroup.sync();

      const { quest } = questingGroup;

      expect(quest.key).to.eql(PET_QUEST);
      expect(quest.active).to.eql(false);
      expect(quest.leader).to.eql(leader._id);
      expect(quest.members).to.have.property(leader._id, true);
      expect(quest.members).to.have.property(member._id, null);
      expect(quest).to.have.property('progress');
    });

    it('adds quest details to user objects', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      await sleep(0.1); // member updates happen in the background

      await Promise.all([
        leader.sync(),
        member.sync(),
      ]);

      expect(leader.party.quest.key).to.eql(PET_QUEST);
      expect(member.party.quest.key).to.eql(PET_QUEST);
      expect(leader.party.quest.RSVPNeeded).to.eql(false);
      expect(member.party.quest.RSVPNeeded).to.eql(true);
    });

    it('sends back the quest object', async () => {
      const inviteResponse = await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      expect(inviteResponse.key).to.eql(PET_QUEST);
      expect(inviteResponse.active).to.eql(false);
      expect(inviteResponse.leader).to.eql(leader._id);
      expect(inviteResponse.members).to.have.property(leader._id, true);
      expect(inviteResponse.members).to.have.property(member._id, null);
      expect(inviteResponse).to.have.property('progress');
    });

    it('allows non-party-leader party members to send invites', async () => {
      const inviteResponse = await member.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      await questingGroup.sync();

      expect(inviteResponse.key).to.eql(PET_QUEST);
      expect(questingGroup.quest.key).to.eql(PET_QUEST);
    });

    it('starts quest automatically if user is in a solo party', async () => {
      const leaderDetails = { balance: 10 };
      leaderDetails[`items.quests.${PET_QUEST}`] = 1;
      const { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'party', privacy: 'private' },
        leaderDetails,
      });

      await groupLeader.post(`/groups/${group._id}/quests/invite/${PET_QUEST}`);

      await group.sync();

      expect(group.quest.active).to.eql(true);
    });

    it('starts quest automatically if user is in a solo party and verifies chat', async () => {
      const leaderDetails = { balance: 10 };
      leaderDetails[`items.quests.${PET_QUEST}`] = 1;
      const { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'party', privacy: 'private' },
        leaderDetails,
      });

      await groupLeader.post(`/groups/${group._id}/quests/invite/${PET_QUEST}`);

      const groupChat = await Chat.find({ groupId: group._id }).exec();

      expect(groupChat[0].text).to.exist;
      expect(groupChat[0]._meta).to.exist;
      expect(groupChat[0]._meta).to.have.all.keys(['participatingMembers']);

      const returnedGroup = await groupLeader.get(`/groups/${group._id}`);
      expect(returnedGroup.chat[0]._meta).to.be.undefined;
    });

    it('successfully issues a quest invitation when quest level is higher than user level', async () => {
      const LEVELED_QUEST = 'atom1';
      const LEVELED_QUEST_REQ = questScrolls[LEVELED_QUEST].lvl;
      const leaderUpdate = {};
      leaderUpdate[`items.quests.${LEVELED_QUEST}`] = 1;
      leaderUpdate['stats.lvl'] = LEVELED_QUEST_REQ - 1;

      await leader.update(leaderUpdate);

      await leader.post(`/groups/${questingGroup._id}/quests/invite/${LEVELED_QUEST}`);
    });

    context('sending quest activity webhooks', () => {
      before(async () => {
        await server.start();
      });

      after(async () => {
        await server.close();
      });

      it('sends quest invited webhook', async () => {
        const uuid = generateUUID();

        await member.post('/user/webhook', {
          url: `http://localhost:${server.port}/webhooks/${uuid}`,
          type: 'questActivity',
          enabled: true,
          options: {
            questInvited: true,
          },
        });

        await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

        await sleep();

        const body = server.getWebhookData(uuid);

        expect(body.type).to.eql('questInvited');
        expect(body.group.id).to.eql(questingGroup.id);
        expect(body.group.name).to.eql(questingGroup.name);
        expect(body.quest.key).to.eql(PET_QUEST);
      });

      it('sends quest invited webhook to the inviter too', async () => {
        const uuid = generateUUID();

        await leader.post('/user/webhook', {
          url: `http://localhost:${server.port}/webhooks/${uuid}`,
          type: 'questActivity',
          enabled: true,
          options: {
            questInvited: true,
          },
        });

        await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

        await sleep();

        const body = server.getWebhookData(uuid);

        expect(body.type).to.eql('questInvited');
        expect(body.group.id).to.eql(questingGroup.id);
        expect(body.group.name).to.eql(questingGroup.name);
        expect(body.quest.key).to.eql(PET_QUEST);
        expect(body.quest.questOwner).to.eql(questingGroup.leader._id);
      });
    });
  });
});
