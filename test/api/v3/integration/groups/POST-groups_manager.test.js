import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /group/:groupId/add-manager', () => {
  let leader; let nonLeader; let
    groupToUpdate;
  const groupName = 'Test Public Guild';
  const groupType = 'guild';
  let nonMember;

  context('Guilds', () => {
    beforeEach(async () => {
      const { group, groupLeader, members } = await createAndPopulateGroup({
        groupDetails: {
          name: groupName,
          type: groupType,
          privacy: 'private',
        },
        members: 1,
        upgradeToGroupPlan: true,
      });

      groupToUpdate = group;
      leader = groupLeader;
      nonLeader = members[0]; // eslint-disable-line prefer-destructuring
      nonMember = await generateUser();
    });

    it('returns an error when a non group leader tries to add member', async () => {
      await expect(nonLeader.post(`/groups/${groupToUpdate._id}/add-manager`, {
        managerId: nonLeader._id,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageGroupOnlyLeaderCanUpdate'),
      });
    });

    it('returns an error when trying to promote a non member', async () => {
      await expect(leader.post(`/groups/${groupToUpdate._id}/add-manager`, {
        managerId: nonMember._id,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('userMustBeMember'),
      });
    });

    it('allows a leader to add managers', async () => {
      const updatedGroup = await leader.post(`/groups/${groupToUpdate._id}/add-manager`, {
        managerId: nonLeader._id,
      });

      expect(updatedGroup.managers[nonLeader._id]).to.be.true;
    });
  });

  context('Party', () => {
    let party; let partyLeader; let
      partyNonLeader;

    beforeEach(async () => {
      const { group, groupLeader, members } = await createAndPopulateGroup({
        groupDetails: {
          name: groupName,
          type: 'party',
          privacy: 'private',
        },
        members: 1,
      });

      party = group;
      partyLeader = groupLeader;
      partyNonLeader = members[0]; // eslint-disable-line prefer-destructuring
    });

    it('allows leader of party to add managers', async () => {
      const updatedGroup = await partyLeader.post(`/groups/${party._id}/add-manager`, {
        managerId: partyNonLeader._id,
      });

      expect(updatedGroup.managers[partyNonLeader._id]).to.be.true;
    });
  });
});
