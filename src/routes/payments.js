var nconf = require('nconf');
var express = require('express');
var router = new express.Router();
var auth = require('../controllers/auth');
var payments = require('../controllers/payments');
var i18n = require('../i18n');

router.get('/paypal/checkout', auth.authWithUrl, i18n.getUserLanguage, payments.paypalCheckout);
router.get('/paypal/checkout/success', i18n.getUserLanguage, payments.paypalCheckoutSuccess);
router.get('/paypal/subscribe', auth.authWithUrl, i18n.getUserLanguage, payments.paypalSubscribe);
router.get('/paypal/subscribe/success', i18n.getUserLanguage, payments.paypalSubscribeSuccess);
router.get('/paypal/subscribe/cancel', auth.authWithUrl, i18n.getUserLanguage, payments.paypalSubscribeCancel);
router.post('/paypal/ipn', i18n.getUserLanguage, payments.paypalIPN); // misc ipn handling

router.post("/stripe/checkout", auth.auth, i18n.getUserLanguage, payments.stripeCheckout);
router.post("/stripe/subscribe/edit", auth.auth, i18n.getUserLanguage, payments.stripeSubscribeEdit)
//router.get("/stripe/subscribe", auth.authWithUrl, i18n.getUserLanguage, payments.stripeSubscribe); // checkout route is used (above) with ?plan= instead
router.get("/stripe/subscribe/cancel", auth.authWithUrl, i18n.getUserLanguage, payments.stripeSubscribeCancel);

router.post("/iap/android/verify", auth.authWithUrl, /*i18n.getUserLanguage, */payments.iapAndroidVerify);
router.post("/iap/ios/verify", /*auth.authWithUrl, i18n.getUserLanguage, */ payments.iapIosVerify);

router.get("/api/v2/coupons/valid-discount/:code", /*auth.authWithUrl, i18n.getUserLanguage, */ payments.validCoupon);

module.exports = router;