import {
  createAndPopulateGroup,
  translate as t,
  generateUser,
  sleep,
} from '../../../../helpers/api-integration/v3';
import { chatModel as Chat } from '../../../../../website/server/models/message';

describe('POST /groups/:groupId/quests/accept', () => {
  const PET_QUEST = 'whale';

  let questingGroup;
  let leader;
  let partyMembers;
  let user;

  beforeEach(async () => {
    user = await generateUser();

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
  });

  context('failure conditions', () => {
    it('does not accept quest without an invite', async () => {
      await expect(leader.post(`/groups/${questingGroup._id}/quests/accept`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('questInviteNotFound'),
        });
    });

    it('does not accept quest for a group in which user is not a member', async () => {
      await expect(user.post(`/groups/${questingGroup._id}/quests/accept`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });
    });

    it('does not accept quest for a guild', async () => {
      const { group: guild, groupLeader: guildLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'guild', privacy: 'private' },
        upgradeToGroupPlan: true,
      });

      await expect(guildLeader.post(`/groups/${guild._id}/quests/accept`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('guildQuestsNotSupported'),
        });
    });

    it('does not accept invite twice', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);

      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('questAlreadyAccepted'),
        });
    });

    it('clears the invalid invite from the user when the request fails', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);

      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('questAlreadyAccepted'),
        });

      await partyMembers[0].sync();
      expect(partyMembers[0].party.quest.RSVPNeeded).to.be.false;
    });

    it('does not accept invite for a quest already underway', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
      // quest will start after everyone has accepted
      await partyMembers[1].post(`/groups/${questingGroup._id}/quests/accept`);

      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('questAlreadyStartedFriendly'),
        });
    });
  });

  context('successfully accepting a quest invitation', () => {
    it('joins a quest from an invitation', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);

      await Promise.all([partyMembers[0].sync(), questingGroup.sync()]);
      expect(leader.party.quest.RSVPNeeded).to.equal(false);
      expect(questingGroup.quest.members[partyMembers[0]._id]).to.equal(true);
    });

    it('does not begin the quest if pending invitations remain', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);

      await questingGroup.sync();
      expect(questingGroup.quest.active).to.equal(false);
    });

    it('begins the quest if accepting the last pending invite', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
      // quest will start after everyone has accepted
      await partyMembers[1].post(`/groups/${questingGroup._id}/quests/accept`);

      await questingGroup.sync();
      expect(questingGroup.quest.active).to.equal(true);
    });

    it('cleans up user quest data for non-quest members when last member accepts', async () => {
      const rejectingMember = partyMembers[0];

      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await rejectingMember.post(`/groups/${questingGroup._id}/quests/reject`);
      // quest will start after everyone has accepted
      await partyMembers[1].post(`/groups/${questingGroup._id}/quests/accept`);

      await sleep(0.5);

      await rejectingMember.sync();

      expect(rejectingMember.party.quest.RSVPNeeded).to.eql(false);
      expect(rejectingMember.party.quest.key).to.not.exist;
      expect(rejectingMember.party.quest.completed).to.not.exist;
    });

    it('begins the quest if accepting the last pending invite and verifies chat', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
      // quest will start after everyone has accepted
      await partyMembers[1].post(`/groups/${questingGroup._id}/quests/accept`);

      const groupChat = await Chat.find({ groupId: questingGroup._id }).exec();

      expect(groupChat[0].text).to.exist;
      expect(groupChat[0]._meta).to.exist;
      expect(groupChat[0]._meta).to.have.all.keys(['participatingMembers']);

      const returnedGroup = await leader.get(`/groups/${questingGroup._id}`);
      expect(returnedGroup.chat[0]._meta).to.be.undefined;
    });
  });
});
