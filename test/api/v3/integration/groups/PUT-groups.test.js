import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('Put /group', () => {
  let user;

  beforeEach(() => {
    return generateUser({balance: 1}).then((generatedUser) => {
      user = generatedUser;
    });
  });

  xit('returns an error when a non group leader tries to update', async () => {
    let groupName = 'Test Public Guild';
    let groupType = 'guild';
    let groupToUpdate = await user.post('/groups', {
      name: groupName,
      type: groupType,
    });
    let groupUpdatedName = 'Test Public Guild Updated';
    let newUser = await generateUser();
    let userInviteResult = await user.post(`/groups/${groupToUpdate._id}/invite`, {
      uuids: [newUser._id],
    });
    let userJoinResult = await newUser.post(`/groups/${groupToUpdate._id}/join`);

    expect(userInviteResult).to.exist;
    expect(userJoinResult).to.exist;
    await expect(newUser.put(`/groups/${groupToUpdate._id}`, {
      name: groupUpdatedName,
    }))
    .to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('messageGroupOnlyLeaderCanUpdate'),
    });
  });

  it('updates a group', async () => {
    let groupName = 'Test Public Guild';
    let groupType = 'guild';
    let groupUpdatedName = 'Test Public Guild Updated';
    let group = await user.post('/groups', {
      name: groupName,
      type: groupType,
    });
    let updatedGroup = await user.put(`/groups/${group._id}`, {
      name: groupUpdatedName,
    });

    expect(updatedGroup.name).to.equal(groupUpdatedName);
  });
});
