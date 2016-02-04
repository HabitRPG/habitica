import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /groups/:groupId/quests/leave', () => {
  let questingGroup, member, leader;
  const PET_QUEST = 'whale';
  let userQuestUpdate = {
    items: {
      quests: {},
    },
    'party.quest.RSVPNeeded': true,
    'party.quest.key': PET_QUEST,
  };

  before(async () => {
    let { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: { type: 'party', privacy: 'private' },
      members: 1,
    });

    leader = groupLeader;
    questingGroup = group;
    member = members[0];

    userQuestUpdate.items.quests[PET_QUEST] = 1;
  });

  it('returns an error when group is not found', async () => {
    await expect(member.post(`/groups/${generateUUID()}/quests/leave`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
  });

  it('returns an error when quest is  not active', async () => {
    await expect(member.post(`/groups/${questingGroup._id}/quests/leave`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('noActiveQuestToLeave'),
      });
  });

  it('returns an error when quest leader attempts to leave', async () => {
    await questingGroup.update({quest: {key: PET_QUEST, active: true, leader: leader._id}});

    await expect(leader.post(`/groups/${questingGroup._id}/quests/leave`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('questLeaderCannotLeaveQuest'),
      });
  });

  it('returns an error when non quest member attempts to leave', async () => {
    await expect(member.post(`/groups/${questingGroup._id}/quests/leave`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('notPartOfQuest'),
      });
  });

  it('leaves a quest', async () => {
    await member.update(userQuestUpdate);

    let questMembers = {};
    questMembers[member._id] = true;
    await questingGroup.update({'quest.members': questMembers});

    let leaveResult = await member.post(`/groups/${questingGroup._id}/quests/leave`);
    let userThatLeft = await member.get('/user');
    let updatedGroup = await member.get(`/groups/${questingGroup._id}`);

    expect(userThatLeft.party.quest.key).to.be.null;
    expect(userThatLeft.party.quest.RSVPNeeded).to.be.false;
    expect(updatedGroup.quest.members[member._id]).to.be.false;
    expect(updatedGroup.quest).to.deep.equal(leaveResult);
  });
});
