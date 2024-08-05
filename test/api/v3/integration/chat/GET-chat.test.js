import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { model as Group } from '../../../../../website/server/models/group';

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

  context('public Guild', () => {
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

      // Creation API is shut down, we need to simulate an extant public group
      await Group.updateOne({ _id: group._id }, { $set: { privacy: 'public' }, $unset: { 'purchased.plan': 1 } }).exec();
    });

    it('returns error if user attempts to fetch a sunset Guild', async () => {
      await expect(user.get(`/groups/${group._id}/chat`)).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('featureRetired'),
      });
    });
  });
});
