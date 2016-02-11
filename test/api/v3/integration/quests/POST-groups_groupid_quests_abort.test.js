import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /groups/:groupId/quests/abort', () => {
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
    await expect(leader.post(`/groups/${generateUUID()}/quests/abort`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
  });

  it('returns an error when quest is  not active', async () => {
    await expect(leader.post(`/groups/${questingGroup._id}/quests/abort`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('noActiveQuestToAbort'),
      });
  });

  xit('returns an error when non quest leader attempts to abort', async () => {
    await questingGroup.update({quest: {key: PET_QUEST, active: true, leader: leader._id}});

    await expect(member.post(`/groups/${questingGroup._id}/quests/abort`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('questLeaderCannotAbortQuest'),
      });
  });

  it('aborts a quest', async () => {
    await member.update(userQuestUpdate);

    let questMembers = {};
    questMembers[member._id] = true;
    await questingGroup.update({'quest.members': questMembers});
    await questingGroup.update({quest: {key: PET_QUEST, active: true, leader: leader._id}});

    let abortResult = await leader.post(`/groups/${questingGroup._id}/quests/abort`);
    let updatedMember = await member.get('/user');
    let updatedLeader = await leader.get('/user');
    let updatedGroup = await member.get(`/groups/${questingGroup._id}`);

    expect(updatedMember.party.quest.key).to.be.null;
    expect(updatedMember.party.quest.RSVPNeeded).to.be.false;
    expect(updatedLeader.items.quests[PET_QUEST]).to.equal(1);
    expect(updatedGroup.quest).to.deep.equal(abortResult);
  });
});
