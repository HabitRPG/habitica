import {
  createAndPopulateGroup,
  translate as t,
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /groups/:groupId/quests/cancel', () => {
  let questingGroup;
  let partyMembers;
  let user;
  let leader;

  const PET_QUEST = 'whale';

  beforeEach(async () => {
    let { group, groupLeader, members } = await createAndPopulateGroup({
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
      await expect(partyMembers[0].post(`/groups/${generateUUID()}/quests/cancel`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });
    });

    it('does not reject quest for a group in which user is not a member', async () => {
      await expect(user.post(`/groups/${questingGroup._id}/quests/cancel`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
    });

    it('returns an error when group is a guild', async () => {
      let { group: guild, groupLeader: guildLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'guild', privacy: 'private' },
      });

      await expect(guildLeader.post(`/groups/${guild._id}/quests/cancel`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('guildQuestsNotSupported'),
      });
    });

    it('returns an error when group is not on a quest', async () => {
      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/cancel`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('questInvitationDoesNotExist'),
        });
    });

    it('only the leader can cancel the quest', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/cancel`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyLeaderCancelQuest'),
      });
    });

    it('does not cancel a quest already underway', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
      // quest will start after everyone has accepted
      await partyMembers[1].post(`/groups/${questingGroup._id}/quests/accept`);

      await expect(leader.post(`/groups/${questingGroup._id}/quests/cancel`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('cantCancelActiveQuest'),
      });
    });
  });

  it('cancels a quest', async () => {
    await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
    await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);

    let res = await leader.post(`/groups/${questingGroup._id}/quests/cancel`);

    await Promise.all([
      leader.sync(),
      partyMembers[0].sync(),
      partyMembers[1].sync(),
      questingGroup.sync(),
    ]);

    let clean = {
      key: null,
      progress: {
        up: 0,
        down: 0,
        collect: {},
        collectedItems: 0,
      },
      completed: null,
      RSVPNeeded: false,
    };

    expect(leader.party.quest).to.eql(clean);
    expect(partyMembers[1].party.quest).to.eql(clean);
    expect(partyMembers[0].party.quest).to.eql(clean);

    expect(res).to.eql(questingGroup.quest);
    expect(questingGroup.quest).to.eql({
      key: null,
      active: false,
      leader: null,
      progress: {
        collect: {},
      },
      members: {},
    });
  });
});
