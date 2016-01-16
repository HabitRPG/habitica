import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';

describe('PUT /group', () => {
  let groupLeader;
  let groupName = 'Test Public Guild';
  let groupType = 'guild';
  let groupToUpdate;
  let groupUpdatedName = 'Test Public Guild Updated';

  beforeEach(async () => {
    groupLeader = await generateUser({balance: 1});
    groupToUpdate = await groupLeader.post('/groups', {
      name: groupName,
      type: groupType,
    });
  });

  it('returns an error when a non group leader tries to update', async () => {
    let memberToAttemptUpdate = await generateUser();

    await groupLeader.post(`/groups/${groupToUpdate._id}/invite`, {
      uuids: [memberToAttemptUpdate._id],
    });
    await memberToAttemptUpdate.post(`/groups/${groupToUpdate._id}/join`);

    await expect(memberToAttemptUpdate.put(`/groups/${groupToUpdate._id}`, {
      name: groupUpdatedName,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('messageGroupOnlyLeaderCanUpdate'),
    });
  });

  it('updates a group', async () => {
    let updatedGroup = await groupLeader.put(`/groups/${groupToUpdate._id}`, {
      name: groupUpdatedName,
    });

    expect(updatedGroup.name).to.equal(groupUpdatedName);
  });
});
