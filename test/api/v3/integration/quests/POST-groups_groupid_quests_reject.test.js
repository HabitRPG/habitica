import {
  createAndPopulateGroup,
  translate as t,
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';
import Bluebird from 'bluebird';

describe('POST /groups/:groupId/quests/reject', () => {
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
      await expect(partyMembers[0].post(`/groups/${generateUUID()}/quests/reject`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
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

    it('returns an error when group is a guild', async () => {
      let { group: guild, groupLeader: guildLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'guild', privacy: 'private' },
      });

      await expect(guildLeader.post(`/groups/${guild._id}/quests/reject`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('guildQuestsNotSupported'),
      });
    });

    it('returns an error when group is not on a quest', async () => {
      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/reject`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('questInvitationDoesNotExist'),
        });
    });

    it('return an error when a user rejects an invite twice', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/reject`);

      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/reject`))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('questAlreadyRejected'),
      });
    });

    it('clears the user rsvp needed if the request fails because the request is invalid', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/reject`);

      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/reject`))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('questAlreadyRejected'),
      });

      await partyMembers[0].sync();
      expect(partyMembers[0].party.quest.RSVPNeeded).to.be.false;
    });

    it('return an error when a user rejects an invite already accepted', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);

      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/reject`))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('questAlreadyAccepted'),
      });
    });

    it('does not reject invite for a quest already underway', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
      // quest will start after everyone has accepted
      await partyMembers[1].post(`/groups/${questingGroup._id}/quests/accept`);

      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/reject`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('questAlreadyUnderway'),
      });
    });
  });

  context('successfully quest rejection', () => {
    let cleanUserQuestObj = {
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

    it('rejects a quest invitation', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      let res = await partyMembers[0].post(`/groups/${questingGroup._id}/quests/reject`);
      await partyMembers[0].sync();
      await questingGroup.sync();

      expect(partyMembers[0].party.quest).to.eql(cleanUserQuestObj);
      expect(questingGroup.quest.members[partyMembers[0]._id]).to.be.false;
      expect(questingGroup.quest.active).to.be.false;
      expect(res).to.eql(questingGroup.quest);
    });

    it('starts the quest when the last user reject', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
      await partyMembers[1].post(`/groups/${questingGroup._id}/quests/reject`);
      await questingGroup.sync();

      expect(questingGroup.quest.active).to.be.true;
    });

    it('cleans up user quest data for non-quest members when last member rejects', async () => {
      let rejectingMember = partyMembers[1];

      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
      // quest will start after everyone has accepted or rejected
      await rejectingMember.post(`/groups/${questingGroup._id}/quests/reject`);

      await Bluebird.delay(500);

      await questingGroup.sync();

      expect(questingGroup.quest.active).to.be.true;

      await rejectingMember.sync();

      expect(rejectingMember.party.quest.RSVPNeeded).to.eql(false);
      expect(rejectingMember.party.quest.key).to.not.exist;
      expect(rejectingMember.party.quest.completed).to.not.exist;
    });

    it('starts the quest when the last user reject and verifies chat', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
      await partyMembers[1].post(`/groups/${questingGroup._id}/quests/reject`);
      await questingGroup.sync();

      expect(questingGroup.chat[0].text).to.exist;
      expect(questingGroup.chat[0]._meta).to.exist;
      expect(questingGroup.chat[0]._meta).to.have.all.keys(['participatingMembers']);

      let returnedGroup = await leader.get(`/groups/${questingGroup._id}`);
      expect(returnedGroup.chat[0]._meta).to.be.undefined;
    });
  });
});
