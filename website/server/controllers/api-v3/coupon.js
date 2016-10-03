import csvStringify from '../../libs/csvStringify';
import {
  authWithHeaders,
  authWithSession,
} from '../../middlewares/auth';
import { ensureSudo } from '../../middlewares/ensureAccessRight';
import { model as Coupon } from '../../models/coupon';
import _ from 'lodash';
import couponCode from 'coupon-code';

let api = {};

/**
 * @api {get} /api/v3/coupons Get coupons
 * @apiDescription Sudo users only
 * @apiName GetCoupons
 * @apiGroup Coupon
 *
 * @apiSuccess {String} Coupons in CSV format
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
 * @apiName GenerateCoupons
 * @apiGroup Coupon
 *
 * @apiParam {String} event The event for which the coupon should be generated
 * @apiParam {Number} count Query parameter to specify the number of coupon codes to generate
 *
 * @apiSuccess {Array} data Generated coupons
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
 * @api {post} /api/v3/coupons/enter/:code Enter coupon code
 * @apiName EnterCouponCode
 * @apiGroup Coupon
 *
 * @apiParam {String} code The coupon code to apply
 *
 * @apiSuccess {Object} data User object
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
 * @apiName ValidateCoupon
 * @apiGroup Coupon
 *
 * @apiSuccess {Boolean} data.valid True or false
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
