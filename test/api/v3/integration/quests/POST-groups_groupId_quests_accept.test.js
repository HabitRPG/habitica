import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';

describe.skip('POST /groups/:groupId/quests/accept', () => {
  let questingGroup;
  let leader;
  let member;

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
    it('does not accept quest without an invite', async () => {
      await expect(leader.post(`/groups/${questingGroup._id}/quests/accept`, {}))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('questInviteNotFound'),
      });
    });

    it('does not accept quest for a group in which user is not a member', async () => {
      await expect(member.post(`/groups/${questingGroup._id}/quests/accept`, {}))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('questInviteNotFound'),
      });
    });
  });
  context('successfully accepting a quest invitation', () => {
    it('joins a quest from an invitation', () => {

    });

    it('does not begin the quest if pending invitations remain', () => {

    });

    it('begins the quest if accepting the last pending invite', () => {

    });
  });
});
