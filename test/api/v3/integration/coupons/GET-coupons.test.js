import {
  generateUser,
  resetHabiticaDB,
} from '../../../../helpers/api-integration/v3';
import apiError from '../../../../../website/server/libs/apiError';

describe('GET /coupons/', () => {
  let user;
  before(async () => {
    await resetHabiticaDB();
  });

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns an error if user has no coupons permission', async () => {
    await user.get('/user'); // needed so the request after this will authenticate with the correct cookie session
    await expect(user.get('/coupons')).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: apiError('noPrivAccess'),
    });
  });

  it('should return the coupons in CSV format ordered by creation date', async () => {
    await user.update({
      'permissions.coupons': true,
    });

    const coupons = await user.post('/coupons/generate/wondercon?count=11');
    const res = await user.get('/coupons');
    const splitRes = res.split('\n');

    expect(splitRes.length).to.equal(13);
    expect(splitRes[0]).to.equal('code,event,date,user');
    expect(splitRes[6].split(',')[1]).to.equal(coupons[5].event);
  });
});
