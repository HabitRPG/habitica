import {
  createAndPopulateGroup,
  translate as t,
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';
import Bluebird from 'bluebird';

describe('POST /groups/:groupId/quests/force-start', () => {
  const PET_QUEST = 'whale';

  let questingGroup;
  let leader;
  let partyMembers;

  beforeEach(async () => {
    let { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: { type: 'party', privacy: 'private' },
      members: 3,
    });

    questingGroup = group;
    leader = groupLeader;
    partyMembers = members;

    await leader.update({
      [`items.quests.${PET_QUEST}`]: 1,
    });
  });

  context('failure conditions', () => {
    it('does not force start a quest for a group in which user is not a member', async () => {
      let nonMember = await generateUser();

      await expect(nonMember.post(`/groups/${questingGroup._id}/quests/force-start`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
    });

    it('does not force start quest for a guild', async () => {
      let { group: guild, groupLeader: guildLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'guild', privacy: 'private' },
      });

      await expect(guildLeader.post(`/groups/${guild._id}/quests/force-start`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('guildQuestsNotSupported'),
      });
    });

    it('does not force start for a party without a pending quest', async () => {
      await expect(leader.post(`/groups/${questingGroup._id}/quests/force-start`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('questNotPending'),
      });
    });

    it('does not force start for a quest already underway', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
      await partyMembers[1].post(`/groups/${questingGroup._id}/quests/accept`);
      // quest will start after everyone has accepted
      await partyMembers[2].post(`/groups/${questingGroup._id}/quests/accept`);

      await expect(leader.post(`/groups/${questingGroup._id}/quests/force-start`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('questAlreadyUnderway'),
      });
    });

    it('does not allow non-quest leader or non-group leader to force start a quest', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/force-start`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('questOrGroupLeaderOnlyStartQuest'),
      });
    });
  });

  context('successfully force starting a quest', () => {
    it('allows quest leader to force start quest', async () => {
      let questLeader = partyMembers[0];
      await questLeader.update({[`items.quests.${PET_QUEST}`]: 1});
      await questLeader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      await questLeader.post(`/groups/${questingGroup._id}/quests/force-start`);

      await questingGroup.sync();

      expect(questingGroup.quest.active).to.eql(true);
    });

    it('allows group leader to force start quest', async () => {
      let questLeader = partyMembers[0];
      await questLeader.update({[`items.quests.${PET_QUEST}`]: 1});
      await questLeader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      await leader.post(`/groups/${questingGroup._id}/quests/force-start`);

      await questingGroup.sync();

      expect(questingGroup.quest.active).to.eql(true);
    });

    it('sends back the quest object', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      let quest = await leader.post(`/groups/${questingGroup._id}/quests/force-start`);

      expect(quest.active).to.eql(true);
      expect(quest.key).to.eql(PET_QUEST);
      expect(quest.members).to.eql({
        [`${leader._id}`]: true,
      });
    });

    it('cleans up user quest data for non-quest members', async () => {
      let partyMemberThatRejects = partyMembers[1];
      let partyMemberThatIgnores = partyMembers[2];

      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
      await partyMemberThatRejects.post(`/groups/${questingGroup._id}/quests/reject`);

      await leader.post(`/groups/${questingGroup._id}/quests/force-start`);

      await Bluebird.delay(500);

      await Promise.all([
        partyMemberThatRejects.sync(),
        partyMemberThatIgnores.sync(),
      ]);

      expect(partyMemberThatRejects.party.quest.RSVPNeeded).to.eql(false);
      expect(partyMemberThatRejects.party.quest.key).to.not.exist;
      expect(partyMemberThatRejects.party.quest.completed).to.not.exist;
      expect(partyMemberThatIgnores.party.quest.RSVPNeeded).to.eql(false);
      expect(partyMemberThatIgnores.party.quest.key).to.not.exist;
      expect(partyMemberThatIgnores.party.quest.completed).to.not.exist;
    });

    it('removes users who have not accepted the quest from quest.members', async () => {
      let partyMemberThatRejects = partyMembers[1];
      let partyMemberThatIgnores = partyMembers[2];
      let partyMemberThatAccepts = partyMembers[0];

      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMemberThatAccepts.post(`/groups/${questingGroup._id}/quests/accept`);
      await partyMemberThatRejects.post(`/groups/${questingGroup._id}/quests/reject`);

      await leader.post(`/groups/${questingGroup._id}/quests/force-start`);

      await Bluebird.delay(500);

      await questingGroup.sync();

      expect(questingGroup.quest.members[partyMemberThatRejects._id]).to.not.exist;
      expect(questingGroup.quest.members[partyMemberThatIgnores._id]).to.not.exist;
      expect(questingGroup.quest.members[partyMemberThatAccepts._id]).to.exist;
      expect(questingGroup.quest.members[leader._id]).to.exist;
    });

    it('removes users who are not in the party from quest.members', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      let notInPartyUser = await generateUser();

      await questingGroup.update({
        [`quest.members.${notInPartyUser._id}`]: true,
      });
      await questingGroup.sync();

      expect(questingGroup.quest.members[notInPartyUser._id]).to.eql(true);

      await leader.post(`/groups/${questingGroup._id}/quests/force-start`);

      await Bluebird.delay(500);

      await questingGroup.sync();

      expect(questingGroup.quest.members[notInPartyUser._id]).to.not.exist;
    });

    it('removes users who have been deleted from quest.members', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);

      await partyMembers[0].del('/user', {
        password: 'password',
      });

      await leader.post(`/groups/${questingGroup._id}/quests/force-start`);

      await Bluebird.delay(500);

      await questingGroup.sync();

      expect(questingGroup.quest.members[partyMembers[0]._id]).to.not.exist;
    });

    it('removes users who don\'t have true value in quest.members from quest.members', async () => {
      let partyMemberThatRejects = partyMembers[1];
      let partyMemberThatIgnores = partyMembers[2];

      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);

      await questingGroup.update({
        [`quest.members.${partyMemberThatRejects._id}`]: false,
        [`quest.members.${partyMemberThatIgnores._id}`]: null,
      });

      await leader.post(`/groups/${questingGroup._id}/quests/force-start`);

      await Bluebird.delay(500);

      await questingGroup.sync();

      expect(questingGroup.quest.members[partyMemberThatRejects._id]).to.not.exist;
      expect(questingGroup.quest.members[partyMemberThatIgnores._id]).to.not.exist;
      expect(questingGroup.quest.members[partyMembers[0]._id]).to.exist;
      expect(questingGroup.quest.members[leader._id]).to.exist;
    });

    it('allows group leader to force start quest and verifies chat', async () => {
      let questLeader = partyMembers[0];
      await questLeader.update({[`items.quests.${PET_QUEST}`]: 1});
      await questLeader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      await leader.post(`/groups/${questingGroup._id}/quests/force-start`);

      await questingGroup.sync();

      expect(questingGroup.chat[0].text).to.exist;
      expect(questingGroup.chat[0]._meta).to.exist;
      expect(questingGroup.chat[0]._meta).to.have.all.keys(['participatingMembers']);

      let returnedGroup = await leader.get(`/groups/${questingGroup._id}`);
      expect(returnedGroup.chat[0]._meta).to.be.undefined;
    });
  });
});
