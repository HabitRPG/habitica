import { v4 as generateUUID } from 'uuid';
import {
  createAndPopulateGroup,
  translate as t,
  generateUser,
} from '../../../../helpers/api-integration/v3';
import { model as Group } from '../../../../../website/server/models/group';

describe('POST /groups/:groupId/quests/abort', () => {
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
      await expect(partyMembers[0].post(`/groups/${generateUUID()}/quests/abort`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });
    });

    it('returns an error for a group in which user is not a member', async () => {
      await expect(user.post(`/groups/${questingGroup._id}/quests/abort`))
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

      await expect(guildLeader.post(`/groups/${guild._id}/quests/abort`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('guildQuestsNotSupported'),
        });
    });

    it('returns an error when quest is not active', async () => {
      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/abort`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('noActiveQuestToAbort'),
        });
    });

    it('returns an error when non quest leader attempts to abort', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
      await partyMembers[1].post(`/groups/${questingGroup._id}/quests/accept`);

      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/abort`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('onlyLeaderAbortQuest'),
        });
    });
  });

  it('aborts a quest', async () => {
    await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
    await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
    await partyMembers[1].post(`/groups/${questingGroup._id}/quests/accept`);

    const stub = sandbox.spy(Group.prototype, 'sendChat');

    const res = await leader.post(`/groups/${questingGroup._id}/quests/abort`);
    await Promise.all([
      leader.sync(),
      questingGroup.sync(),
      partyMembers[0].sync(),
      partyMembers[1].sync(),
    ]);

    const cleanUserQuestObj = {
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

    expect(leader.party.quest).to.eql(cleanUserQuestObj);
    expect(partyMembers[0].party.quest).to.eql(cleanUserQuestObj);
    expect(partyMembers[1].party.quest).to.eql(cleanUserQuestObj);
    expect(leader.items.quests[PET_QUEST]).to.equal(1);
    expect(questingGroup.quest).to.deep.equal(res);
    expect(questingGroup.quest).to.eql({
      key: null,
      active: false,
      leader: null,
      progress: {
        collect: {},
      },
      members: {},
    });
    expect(Group.prototype.sendChat).to.be.calledOnce;
    expect(Group.prototype.sendChat).to.be.calledWithMatch({
      message: sinon.match(/aborted the party quest Wail of the Whale.`/),
      info: {
        quest: 'whale',
        type: 'quest_abort',
      },
    });

    stub.restore();
  });
});
