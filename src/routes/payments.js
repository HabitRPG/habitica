var nconf = require('nconf');
var express = require('express');
var router = new express.Router();
var auth = require('../controllers/auth');
var payments = require('../controllers/payments');

router.get('/paypal/checkout', auth.authWithUrl, payments.paypalCheckout);
router.get('/paypal/checkout/success', payments.paypalCheckoutSuccess);
router.get('/paypal/subscribe', auth.authWithUrl, payments.paypalSubscribe);
router.get('/paypal/subscribe/success', payments.paypalSubscribeSuccess);
router.get('/paypal/subscribe/cancel', auth.authWithUrl, payments.paypalSubscribeCancel);
router.post('/paypal/ipn', payments.paypalIPN); // misc ipn handling

router.post("/stripe/checkout", auth.auth, payments.stripeCheckout);
//router.get("/stripe/subscribe", auth.authWithUrl, payments.stripeSubscribe); // checkout route is used (above) with ?plan= instead
router.get("/stripe/subscribe/cancel", auth.authWithUrl, payments.stripeSubscribeCancel);

module.exports = router;