import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe.skip('POST /groups/:groupId/quests/invite', () => {
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
      let { alternateGroup } = await createAndPopulateGroup({
        groupDetails: { type: 'party', privacy: 'private' },
        members: 1,
      });

      await expect(leader.post(`/groups/${alternateGroup._id}/quests/invite/${PET_QUEST}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
    });

    it('does not issue invites for Guilds', async () => {
      let { alternateGroup } = await createAndPopulateGroup({
        groupDetails: { type: 'guild', privacy: 'public' },
        members: 1,
      });

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
      const LEVELED_QUEST_REQ = 15;
      leader.items.quests[LEVELED_QUEST] = 1;

      await expect(leader.post(`/groups/${questingGroup._id}/quests/invite/${LEVELED_QUEST}`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('questLevelTooHigh', {level: LEVELED_QUEST_REQ}),
      });
    });

    it('does not issue invites if a quest is already underway', async () => {
      leader.items.quests[PET_QUEST] = 2;

      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      await expect(leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('questAlreadyUnderway'),
      });
    });
  });

  context('successfully issuing a quest invitation', () => {
    let inviteResponse = {
      key: PET_QUEST,
      active: false,
      leader: leader._id,
      members: {},
      progress: {
        collect: {},
      },
    };
    inviteResponse.members[member._id] = null;
    inviteResponse.members[leader._id] = null;

    it('sends an invite to all party members', async () => {
      leader.items.quests[PET_QUEST] = 1;

      await expect(leader.post(`groups/${questingGroup._id}/quests/invite/${PET_QUEST}`)).to.eventually.deep.equal(inviteResponse);
    });

    it('allows non-leader party members to send invites', async () => {
      member.items.quests[PET_QUEST] = 1;

      await expect(member.post(`groups/${questingGroup._id}/quests/invite/${PET_QUEST}`)).to.eventually.deep.equal(inviteResponse);
    });
  });
});
