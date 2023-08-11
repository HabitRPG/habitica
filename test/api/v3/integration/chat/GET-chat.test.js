import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /groups/:groupId/chat', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  context('private Guild', () => {
    let group;
    before(async () => {
      ({ group } = await createAndPopulateGroup({
        groupDetails: {
          name: 'test group',
          type: 'guild',
          privacy: 'private',
        },
        members: 1,
        upgradeToGroupPlan: true,
        chat: [
          'Hello',
          'Welcome to the Guild',
        ],
      }));
    });

    it('returns error if user is not member of requested private group', async () => {
      await expect(user.get(`/groups/${group._id}/chat`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
    });
  });
});
