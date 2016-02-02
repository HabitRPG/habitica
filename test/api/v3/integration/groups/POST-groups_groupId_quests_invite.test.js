import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';
import { quests as questScrolls } from '../../../../../common/script/content';

describe('POST /groups/:groupId/quests/invite/:questKey', () => {
  let questingGroup;
  let leader;
  let member;
  const PET_QUEST = 'whale';

  beforeEach(async () => {
    let { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: { type: 'party', privacy: 'private' },
      members: 1,
    });

    questingGroup = group;
    leader = groupLeader;
    member = members[0];
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
      let { group } = await createAndPopulateGroup({
        groupDetails: { type: 'party', privacy: 'private' },
        members: 1,
      });

      let alternateGroup = group;

      await expect(leader.post(`/groups/${alternateGroup._id}/quests/invite/${PET_QUEST}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
    });

    it('does not issue invites for Guilds', async () => {
      let { group } = await createAndPopulateGroup({
        groupDetails: { type: 'guild', privacy: 'public' },
        members: 1,
      });

      let alternateGroup = group;

      await expect(leader.post(`/groups/${alternateGroup._id}/quests/invite/${PET_QUEST}`)).to.eventually.be.rejected.and.eql({
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
        message: t('questNotFound', {key: FAKE_QUEST}),
      });
    });

    it('does not issue invites for a quest the user does not own', async () => {
      await expect(leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('questNotOwned'),
      });
    });

    it('does not issue invites if the user is of insufficient Level', async () => {
      const LEVELED_QUEST = 'atom1';
      const LEVELED_QUEST_REQ = questScrolls[LEVELED_QUEST].lvl;
      const leaderUpdate = {};
      leaderUpdate[`items.quests.${LEVELED_QUEST}`] = 1;
      leaderUpdate['stats.lvl'] = LEVELED_QUEST_REQ - 1;

      await leader.update(leaderUpdate);

      await expect(leader.post(`/groups/${questingGroup._id}/quests/invite/${LEVELED_QUEST}`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('questLevelTooHigh', {level: LEVELED_QUEST_REQ}),
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

    xit('adds quest details to group object', async () => {
      await leader.post(`groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      await questingGroup.sync();

      let quest = questingGroup.quest;

      expect(quest.key).to.eql(PET_QUEST);
      expect(quest.active).to.eql(false);
      expect(quest.leader).to.eql(false);
      expect(quest.members).to.have.property(leader._id, null);
      expect(quest.members).to.have.property(member._id, null);
      expect(quest).to.have.property('progress');
    });

    xit('adds quest details to user objects', async () => {
      await leader.post(`groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      await Promise.all([
        leader.sync(),
        member.sync(),
      ]);

      [leader, member].forEach((user) => {
        let quest = user.party.quest;

        expect(quest.key).to.eql(PET_QUEST);
        expect(quest.active).to.eql(false);
        expect(quest.leader).to.eql(false);
        expect(quest.members).to.have.property(leader._id, null);
        expect(quest.members).to.have.property(member._id, null);
        expect(quest).to.have.property('progress');
      });
    });

    xit('sends back the quest object', async () => {
      let inviteResponse = await leader.post(`groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      expect(inviteResponse.key).to.eql(PET_QUEST);
      expect(inviteResponse.active).to.eql(false);
      expect(inviteResponse.leader).to.eql(false);
      expect(inviteResponse.members).to.have.property(leader._id, null);
      expect(inviteResponse.members).to.have.property(member._id, null);
      expect(inviteResponse).to.have.property('progress');
    });

    xit('allows non-leader party members to send invites', async () => {
      let inviteResponse = await member.post(`groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      expect(inviteResponse.key).to.eql(PET_QUEST);
    });
  });
});
