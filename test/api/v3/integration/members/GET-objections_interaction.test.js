import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('GET /members/:toUserId/objections/:interaction', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('validates req.params.memberId', async () => {
    await expect(
      user.get('/members/invalidUUID/objections/send-private-message')
    ).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('handles non-existing members', async () => {
    let dummyId = generateUUID();
    await expect(
      user.get(`/members/${dummyId}/objections/send-private-message`)
    ).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('userWithIDNotFound', {userId: dummyId}),
    });
  });

  it('handles non-existing interactions', async () => {
    let receiver = await generateUser();

    await expect(
      user.get(`/members/${receiver._id}/objections/hug-a-whole-forest-of-trees`)
    ).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns an empty array if there are no objections', async () => {
    let receiver = await generateUser();

    await expect(
      user.get(`/members/${receiver._id}/objections/send-private-message`)
    ).to.eventually.be.fulfilled.and.eql([]);
  });

  it('returns an array of objections if any exist', async () => {
    let receiver = await generateUser({'inbox.blocks': [user._id]});

    await expect(
      user.get(`/members/${receiver._id}/objections/send-private-message`)
    ).to.eventually.be.fulfilled.and.eql([
      t('notAuthorizedToSendMessageToThisUser'),
    ]);
  });
});
