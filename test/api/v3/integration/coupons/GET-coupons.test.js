import {
  generateUser,
  resetHabiticaDB,
} from '../../../../helpers/api-v3-integration.helper';
import apiMessages from '../../../../../website/server/libs/apiMessages';

describe('GET /coupons/', () => {
  let user;
  before(async () => {
    await resetHabiticaDB();
  });

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns an error if user has no sudo permission', async () => {
    await user.get('/user'); // needed so the request after this will authenticate with the correct cookie session
    await expect(user.get('/coupons')).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: apiMessages('noSudoAccess'),
    });
  });

  it('should return the coupons in CSV format ordered by creation date', async () => {
    await user.update({
      'contributor.sudo': true,
    });

    let coupons = await user.post('/coupons/generate/wondercon?count=11');
    let res = await user.get('/coupons');
    let splitRes = res.split('\n');

    expect(splitRes.length).to.equal(13);
    expect(splitRes[0]).to.equal('code,event,date,user');
    expect(splitRes[6].split(',')[1]).to.equal(coupons[5].event);
  });
});
