import csvStringify from '../../libs/csvStringify';
import {
  authWithHeaders,
  authWithSession,
} from '../../middlewares/auth';
import { ensureSudo } from '../../middlewares/ensureAccessRight';
import _ from 'lodash';
import * as couponsLib from '../../libs/coupons';
import couponCode from 'coupon-code';
import apiError from '../../libs/apiError';
import { model as Coupon } from '../../models/coupon';

let api = {};

/**
 * @apiDefine Sudo Sudo Users
 * Moderators with all access permissions.
 */

/**
 * @api {get} /api/v3/coupons Get coupons
 * @apiName GetCoupons
 * @apiGroup Coupon
 * @apiPermission sudo
 *
 * @apiSuccess {String} Coupons in CSV format
 *
 * @apiSuccessExample {String}
 * code,event,date,user
 * GJG4-WEA4-QX3P,wondercon,1476929528704,user-uuid
 * TT32-EYQA-JPBT,wondercon,1476929528705,
 * V3EK-GE8M-LMJ4,wondercon,1476929528705,another-user-uuid
 *
 */
api.getCoupons = {
  method: 'GET',
  url: '/coupons',
  middlewares: [authWithSession, ensureSudo],
  async handler (req, res) {
    let coupons = await Coupon.find().sort('createdAt').lean().exec();

    let output = [['code', 'event', 'date', 'user']].concat(_.map(coupons, coupon => {
      return [coupon._id, coupon.event, coupon.createdAt, coupon.user];
    }));
    let csv = await csvStringify(output);

    res.set({
      'Content-Type': 'text/csv',
      'Content-disposition': 'attachment; filename=habitica-coupons.csv',
    });
    res.status(200).send(csv);
  },
};

/**
 * @api {post} /api/v3/coupons/generate/:event Generate coupons for an event
 * @apiName GenerateCoupons
 * @apiGroup Coupon
 * @apiPermission sudo
 *
 * @apiParam (Path) {String=wondercon,google_6mo} event The event for which the coupon should be generated
 * @apiParam (Query) {Number} count The number of coupon codes to generate
 *
 * @apiSuccess {Array} data Generated coupons
 *
 * @apiError (400) {BadRequest} CouponValidationError The request was missing the count query parameter or used an invalid event.
 *
 */
api.generateCoupons = {
  method: 'POST',
  url: '/coupons/generate/:event',
  middlewares: [authWithHeaders(), ensureSudo],
  async handler (req, res) {
    req.checkParams('event', apiError('eventRequired')).notEmpty();
    req.checkQuery('count', apiError('countRequired')).notEmpty().isNumeric();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let coupons = await Coupon.generate(req.params.event, req.query.count);
    res.respond(200, coupons);
  },
};

/* NOTE this route has also an API v4 version */

/**
 * @api {post} /api/v3/coupons/enter/:code Redeem a coupon code
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
    const user = res.locals.user;
    await couponsLib.enterCode(req, res, user);
    const userToJSON = await user.toJSONWithInbox();
    res.respond(200, userToJSON);
  },
};

/**
 * @api {post} /api/v3/coupons/validate/:code Validate a coupon code
 * @apiName ValidateCoupon
 * @apiGroup Coupon
 *
 * @apiParam (Path) {String} code The coupon code to validate
 *
 * @apiSuccess {Boolean} data.valid True or False
 */
api.validateCoupon = {
  method: 'POST',
  url: '/coupons/validate/:code',
  middlewares: [authWithHeaders({
    optional: true,
  })],
  async handler (req, res) {
    req.checkParams('code', res.t('couponCodeRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let valid = false;
    let code = couponCode.validate(req.params.code);
    if (code) {
      let coupon = await Coupon.findOne({_id: code}).exec();
      valid = coupon ? true : false;
    }

    res.respond(200, {valid});
  },
};

module.exports = api;
