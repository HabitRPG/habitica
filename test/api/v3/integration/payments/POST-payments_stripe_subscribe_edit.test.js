import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('payments - stripe - #subscribeEdit', () => {
  let endpoint = '/stripe/subscribe/edit';
  let user;
  let leader, member, createdGroup;
  let groupDetails = { type: 'guild', privacy: 'private' };

  beforeEach(async () => {
    user = await generateUser();

    let groupData = await createAndPopulateGroup({
      members: 30,
      groupDetails,
    });

    leader = groupData.groupLeader;
    member = groupData.members[0];
    createdGroup = groupData.group;
  });

  it('verifies credentials', async () => {
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('missingSubscription'),
    });
  });
});
