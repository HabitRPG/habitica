import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('GET /members/:memberId/achievements', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('validates req.params.memberId', async () => {
    await expect(user.get('/members/invalidUUID/achievements')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns achievements based on given user', async () => {
    let member = await generateUser({
      contributor: {level: 1},
      backer: {tier: 3},
    });
    let achievementsRes = await user.get(`/members/${member._id}/achievements`);

    expect(achievementsRes.special.achievements.contributor.earned).to.equal(true);
    expect(achievementsRes.special.achievements.contributor.value).to.equal(1);

    expect(achievementsRes.special.achievements.kickstarter.earned).to.equal(true);
    expect(achievementsRes.special.achievements.kickstarter.value).to.equal(3);
  });

  it('handles non-existing members', async () => {
    let dummyId = generateUUID();
    await expect(user.get(`/members/${dummyId}/achievements`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('userWithIDNotFound', {userId: dummyId}),
    });
  });
});
