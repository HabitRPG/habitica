import {
  generateUser,
  translate as t,
} from '../../../helpers/api-integration/v4';

describe('GET /members/:memberId/purchase-history', () => {
  let user;

  before(async () => {
    user = await generateUser({
      permissions: { userSupport: true },
    });
  });

  it('validates req.params.memberId', async () => {
    await expect(user.get('/members/invalidUUID/purchase-history')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns error if user is not admin', async () => {
    const member = await generateUser();
    const nonAdmin = await generateUser();
    await expect(nonAdmin.get(`/members/${member._id}/purchase-history`)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('noPrivAccess'),
    });
  });

  it('returns purchase history based on given user', async () => {
    const member = await generateUser();
    const response = await user.get(`/members/${member._id}/purchase-history`);
    expect(response.length).to.equal(0);
  });
});
