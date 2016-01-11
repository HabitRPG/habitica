import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('Put /group', () => {
  let groupLeader;
  let groupName = 'Test Public Guild';
  let groupType = 'guild';

  beforeEach(async () => {
    groupLeader = await generateUser({balance: 1});
  });

  xit('returns an error when a non group leader tries to update', async () => {
    let groupToUpdate = await groupLeader.post('/groups', {
      name: groupName,
      type: groupType,
    });
    let groupUpdatedName = 'Test Public Guild Updated';
    let memberToAttemptUpdate = await generateUser();

    await groupLeader.post(`/groups/${groupToUpdate._id}/invite`, {
      uuids: [memberToAttemptUpdate._id],
    });
    await memberToAttemptUpdate.post(`/groups/${groupToUpdate._id}/join`);

    await expect(memberToAttemptUpdate.put(`/groups/${groupToUpdate._id}`, {
      name: groupUpdatedName,
    }))
    .to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('messageGroupOnlyLeaderCanUpdate'),
    });
  });

  it('updates a group', async () => {
    let groupUpdatedName = 'Test Public Guild Updated';
    let group = await groupLeader.post('/groups', {
      name: groupName,
      type: groupType,
    });
    let updatedGroup = await groupLeader.put(`/groups/${group._id}`, {
      name: groupUpdatedName,
    });

    expect(updatedGroup.name).to.equal(groupUpdatedName);
  });
});
