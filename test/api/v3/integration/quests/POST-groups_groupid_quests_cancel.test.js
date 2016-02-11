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
    await expect(leader.post(`/groups/${generateUUID()}/quests/cancel`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
  });

  it('cancels a quest', async () => {
    await member.update(userQuestUpdate);
    await questingGroup.update({'quest.key': PET_QUEST});

    let questMembers = {};
    questMembers[member._id] = true;
    await questingGroup.update({'quest.members': questMembers});

    await leader.post(`/groups/${questingGroup._id}/quests/cancel`);
    let userThatCanceled = await member.get('/user');
    let updatedGroup = await member.get(`/groups/${questingGroup._id}`);

    expect(userThatCanceled.party.quest.key).to.be.null;
    expect(userThatCanceled.party.quest.RSVPNeeded).to.be.false;
    expect(updatedGroup.quest.members).to.be.empty;
  });

  it('returns an error when quest is active', async () => {
    await questingGroup.update({'quest.active': true});
    await expect(leader.post(`/groups/${questingGroup._id}/quests/cancel`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('cantCancelActiveQuest'),
      });
  });
});
