import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('GET /members/:toUserId/objections-to/:interaction', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('validates req.params.memberId', async () => {
    await expect(
      user.get('/members/invalidUUID/objections-to/send-private-message')
    ).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('handles non-existing members', async () => {
    let dummyId = generateUUID();
    await expect(
      user.get(`/members/${dummyId}/objections-to/send-private-message`)
    ).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('userWithIDNotFound', {userId: dummyId}),
    });
  });

  it('handles non-existing interactions', async () => {
    let receiver = await generateUser();

    await expect(
      user.get(`/members/${receiver._id}/objections-to/hug-a-whole-forest-of-trees`)
    ).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: 'Unknown kind of interaction: "hug-a-whole-forest-of-trees", expected one of send-private-message, transfer-gems',
      // FIXME: Very fragile message, not sure what to do here
    });
  });

  it('returns nothing if there are no objections', async () => {
    let receiver = await generateUser();

    await expect(
      user.get(`/members/${receiver._id}/objections-to/send-private-message`)
    ).to.eventually.be.fulfilled.and.eql([]);
  });
});
