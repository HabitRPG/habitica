import csvStringify from '../../libs/api-v3/csvStringify';
import {
  authWithHeaders,
  authWithSession,
} from '../../middlewares/api-v3/auth';
import { ensureSudo } from '../../middlewares/api-v3/ensureAccessRight';
import { model as Coupon } from '../../models/coupon';
import _ from 'lodash';
import couponCode from 'coupon-code';

let api = {};

/**
 * @api {get} /api/v3/coupons Get coupons
 * @apiDescription Sudo users only
 * @apiVersion 3.0.0
 * @apiName GetCoupons
 * @apiGroup Coupon
 *
 * @apiSuccess {string} Coupons in CSV format
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
 * @apiDescription Sudo users only
 * @apiVersion 3.0.0
 * @apiName GenerateCoupons
 * @apiGroup Coupon
 *
 * @apiParam {string} event The event for which the coupon should be generated
 * @apiParam {number} count Query parameter to specify the number of coupon codes to generate
 *
 * @apiSuccess {array} data Generated coupons
 */
api.generateCoupons = {
  method: 'POST',
  url: '/coupons/generate/:event',
  middlewares: [authWithHeaders(), ensureSudo],
  async handler (req, res) {
    req.checkParams('event', res.t('eventRequired')).notEmpty();
    req.checkQuery('count', res.t('countRequired')).notEmpty().isNumeric();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let coupons = await Coupon.generate(req.params.event, req.query.count);
    res.respond(200, coupons);
  },
};

/**
 * @api {post} /api/v3/user/coupon/:code Enter coupon code
 * @apiVersion 3.0.0
 * @apiName EnterCouponCode
 * @apiGroup Coupon
 *
 * @apiParam {string} code The coupon code to apply
 *
 * @apiSuccess {object} data User object
 */
api.enterCouponCode = {
  method: 'POST',
  url: '/coupons/enter/:code',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('code', res.t('couponCodeRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    await Coupon.apply(user, req, req.params.code);
    res.respond(200, user);
  },
};

/**
 * @api {post} /api/v3/coupons/validate/:code Validate a coupon code
 * @apiVersion 3.0.0
 * @apiName ValidateCoupon
 * @apiGroup Coupon
 *
 * @apiSuccess {boolean} data.valid True or false
 */
api.validateCoupon = {
  method: 'POST',
  url: '/coupons/validate/:code',
  middlewares: [authWithHeaders(true)],
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
