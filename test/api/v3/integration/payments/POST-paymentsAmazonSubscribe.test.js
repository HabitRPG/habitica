import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import cc from 'coupon-code';
import { model as Coupon } from '../../../../../website/src/models/coupon';

describe('payments - amazon - #subscribe', () => {
  let endpoint = '/payments/amazon/subscribe';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('successfully subscribes', async () => {
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('missingSubscriptionCode'),
    });
  });

  it('applies discount', async (done) => {
    let coupon = new Coupon({ _id: cc.generate(), event: 'google_6mo' });
    await coupon.save();
    try {
      await user.post(endpoint, {
        subscription: 'google_6mo', 
        coupon: coupon._id
      });
    } catch (e) {
      expect(e.code).to.eql(400);
      expect(e.error).to.eql('BadRequest'); // Parameter AWSAccessKeyId cannot be empty.
      done();
    }    
  });
});
