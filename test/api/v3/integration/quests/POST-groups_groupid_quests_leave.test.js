import { v4 as generateUUID } from 'uuid';
import {
  createAndPopulateGroup,
  translate as t,
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /groups/:groupId/quests/leave', () => {
  let questingGroup;
  let partyMembers;
  let user;
  let leader;

  const PET_QUEST = 'whale';

  beforeEach(async () => {
    const { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: { type: 'party', privacy: 'private' },
      members: 2,
    });

    questingGroup = group;
    leader = groupLeader;
    partyMembers = members;

    await leader.update({
      [`items.quests.${PET_QUEST}`]: 1,
    });
    user = await generateUser();
  });

  context('failure conditions', () => {
    it('returns an error when group is not found', async () => {
      await expect(partyMembers[0].post(`/groups/${generateUUID()}/quests/leave`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });
    });

    it('returns an error for a group in which user is not a member', async () => {
      await expect(user.post(`/groups/${questingGroup._id}/quests/leave`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });
    });

    it('returns an error when group is a guild', async () => {
      const { group: guild, groupLeader: guildLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'guild', privacy: 'private' },
        upgradeToGroupPlan: true,
      });

      await expect(guildLeader.post(`/groups/${guild._id}/quests/leave`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('guildQuestsNotSupported'),
        });
    });

    it('returns an error when quest leader attempts to leave', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
      await partyMembers[1].post(`/groups/${questingGroup._id}/quests/accept`);

      await expect(leader.post(`/groups/${questingGroup._id}/quests/leave`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('questLeaderCannotLeaveQuest'),
        });
    });

    it('returns an error when non quest member attempts to leave', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
      await partyMembers[1].post(`/groups/${questingGroup._id}/quests/reject`);

      await expect(partyMembers[1].post(`/groups/${questingGroup._id}/quests/leave`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('notPartOfQuest'),
        });
    });
  });

  async function letPartyMemberLeaveAndCheckChanges (partyMember) {
    const leaveResult = await partyMember.post(`/groups/${questingGroup._id}/quests/leave`);
    await Promise.all([
      partyMember.sync(),
      questingGroup.sync(),
    ]);

    expect(partyMember.party.quest).to.eql({
      key: null,
      progress: {
        up: 0,
        down: 0,
        collect: {},
        collectedItems: 0,
      },
      completed: null,
      RSVPNeeded: false,
    });
    expect(questingGroup.quest).to.deep.equal(leaveResult);
    expect(questingGroup.quest.members[partyMember._id]).to.be.false;
  }

  it('leaves an active quest', async () => {
    await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
    await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
    await partyMembers[1].post(`/groups/${questingGroup._id}/quests/accept`);

    await questingGroup.sync();

    expect(questingGroup.quest.active).to.eql(true);

    await letPartyMemberLeaveAndCheckChanges(partyMembers[0]);
  });

  it('leaves an inactive quest ', async () => {
    await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
    await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);

    await questingGroup.sync();

    expect(questingGroup.quest.active).to.eql(false);

    await letPartyMemberLeaveAndCheckChanges(partyMembers[0]);
  });
});
