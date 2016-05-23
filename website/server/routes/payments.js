var nconf = require('nconf');
var express = require('express');
var router = express.Router();
var auth = require('../controllers/api-v2/auth');
var payments = require('../controllers/payments');
var i18n = require('../libs/api-v2/i18n');
import {
  getUserLanguage
} from '../../middlewares/api-v3/language';

router.get('/paypal/checkout', auth.authWithUrl, getUserLanguage, payments.paypalCheckout);
router.get('/paypal/checkout/success', getUserLanguage, payments.paypalCheckoutSuccess);
router.get('/paypal/subscribe', auth.authWithUrl, getUserLanguage, payments.paypalSubscribe);
router.get('/paypal/subscribe/success', getUserLanguage, payments.paypalSubscribeSuccess);
router.get('/paypal/subscribe/cancel', auth.authWithUrl, getUserLanguage, payments.paypalSubscribeCancel);
router.post('/paypal/ipn', getUserLanguage, payments.paypalIPN); // misc ipn handling

router.post('/stripe/checkout', auth.auth, getUserLanguage, payments.stripeCheckout);
router.post('/stripe/subscribe/edit', auth.auth, getUserLanguage, payments.stripeSubscribeEdit);
//router.get('/stripe/subscribe', auth.authWithUrl, getUserLanguage, payments.stripeSubscribe); // checkout route is used (above) with ?plan= instead
router.get('/stripe/subscribe/cancel', auth.authWithUrl, getUserLanguage, payments.stripeSubscribeCancel);

router.post('/amazon/verifyAccessToken', auth.auth, getUserLanguage, payments.amazonVerifyAccessToken);
router.post('/amazon/createOrderReferenceId', auth.auth, getUserLanguage, payments.amazonCreateOrderReferenceId);
router.post('/amazon/checkout', auth.auth, getUserLanguage, payments.amazonCheckout);
router.post('/amazon/subscribe', auth.auth, getUserLanguage, payments.amazonSubscribe);
router.get('/amazon/subscribe/cancel', auth.authWithUrl, getUserLanguage, payments.amazonSubscribeCancel);

router.post('/iap/android/verify', auth.authWithUrl, /*getUserLanguage, */payments.iapAndroidVerify);
router.post('/iap/ios/verify', auth.auth, /*getUserLanguage, */ payments.iapIosVerify);

router.get('/api/v2/coupons/valid-discount/:code', /*auth.authWithUrl, getUserLanguage, */ payments.validCoupon);

module.exports = router;
