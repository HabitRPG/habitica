var nconf = require('nconf');
var express = require('express');
var router = express.Router();
var auth = require('../../controllers/api-v2/auth');
var coupon = require('../../controllers/api-v2/coupon');
var i18n = require('../../libs/api-v2/i18n');
import {
  getUserLanguage
} from '../../middlewares/api-v3/language';

router.get('/coupons', auth.authWithUrl, getUserLanguage, coupon.ensureAdmin, coupon.getCoupons);
router.post('/coupons/generate/:event', auth.auth, getUserLanguage, coupon.ensureAdmin, coupon.generateCoupons);
router.post('/user/coupon/:code', auth.auth, getUserLanguage, coupon.enterCode);

module.exports = router;
