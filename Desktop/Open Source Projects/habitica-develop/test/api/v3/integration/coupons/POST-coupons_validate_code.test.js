import {
  generateUser,
  requester,
  resetHabiticaDB,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /coupons/validate/:code', () => {
  let api = requester();

  before(async () => {
    await resetHabiticaDB();
  });

  it('returns an error if code is missing', async () => {
    await expect(api.post('/coupons/validate')).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: 'Not found.',
    });
  });

  it('returns true if coupon code is valid', async () => {
    let sudoUser = await generateUser({
      'contributor.sudo': true,
    });

    let [coupon] = await sudoUser.post('/coupons/generate/wondercon?count=1');
    let res = await api.post(`/coupons/validate/${coupon._id}`);
    expect(res).to.eql({valid: true});
  });

  it('returns false if coupon code is valid', async () => {
    let res = await api.post('/coupons/validate/notValid');
    expect(res).to.eql({valid: false});
  });
});
