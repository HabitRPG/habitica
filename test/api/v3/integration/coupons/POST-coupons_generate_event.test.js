import couponCode from 'coupon-code';
import {
  generateUser,
  translate as t,
  resetHabiticaDB,
} from '../../../../helpers/api-integration/v3';
import apiError from '../../../../../website/server/libs/apiError';

describe('POST /coupons/generate/:event', () => {
  let user;
  before(async () => {
    await resetHabiticaDB();
  });

  beforeEach(async () => {
    user = await generateUser({
      'contributor.sudo': true,
    });
  });

  it('returns an error if user has no sudo permission', async () => {
    await user.update({
      'contributor.sudo': false,
    });

    await expect(user.post('/coupons/generate/aaa')).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: apiError('noSudoAccess'),
    });
  });

  it('returns an error if event is invalid', async () => {
    await expect(user.post('/coupons/generate/notValid?count=1')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Coupon validation failed',
    });
  });

  it('returns an error if count is missing', async () => {
    await expect(user.post('/coupons/generate/notValid')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('should generate coupons', async () => {
    await user.update({
      'contributor.sudo': true,
    });

    const coupons = await user.post('/coupons/generate/wondercon?count=2');
    expect(coupons.length).to.equal(2);
    expect(coupons[0].event).to.equal('wondercon');
    expect(couponCode.validate(coupons[1]._id)).to.not.equal(''); // '' means invalid
  });
});
