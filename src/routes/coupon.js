var express = require('express');
var router = new express.Router();
var auth = require('../controllers/auth');
var coupon = require('../controllers/coupon');

router.get('/api/v2/coupons', auth.authWithUrl, coupon.ensureAdmin, coupon.getCoupons);
router.post('/api/v2/coupons/generate/:event', auth.auth, coupon.ensureAdmin, coupon.generateCoupons);
router.post('/api/v2/user/coupon/:code', auth.auth, coupon.enterCode);

module.exports = router;