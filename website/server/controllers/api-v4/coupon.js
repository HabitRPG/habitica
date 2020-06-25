import { authWithHeaders } from '../../middlewares/auth';
import * as couponsLib from '../../libs/coupons';

/*
* NOTE most coupons routes are still in the v3 controller
* here there are only routes that had to be split from the v3 version because of
* some breaking change (for example because their returned the entire user object).
*/

const api = {};

/* NOTE this route has also an API v3 version */

/**
 * @apiIgnore
 * @api {post} /api/v4/coupons/enter/:code Redeem a coupon code
 * @apiName RedeemCouponCode
 * @apiGroup Coupon
 *
 * @apiParam (Path) {String} code The coupon code to apply
 *
 * @apiSuccess {Object} data User object
 */
api.enterCouponCode = {
  method: 'POST',
  url: '/coupons/enter/:code',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    await couponsLib.enterCode(req, res, user);
    res.respond(200, user);
  },
};

export default api;
