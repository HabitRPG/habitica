var _ = require('lodash');
var shared = require('../../../../common');
var nconf = require('nconf');
var utils = require('./../../libs/api-v2/utils');
var moment = require('moment');
var isProduction = nconf.get("NODE_ENV") === "production";
var stripe = require('./stripe');
var paypal = require('./paypal');
var amazon = require('./amazon');
var members = require('../api-v2/members')
var async = require('async');
var iap = require('./iap');
var mongoose= require('mongoose');
var cc = require('coupon-code');
var pushNotify = require('./../api-v2/pushNotifications');

function revealMysteryItems(user) {
  _.each(shared.content.gear.flat, function(item) {
    if (
      item.klass === 'mystery' &&
        moment().isAfter(shared.content.mystery[item.mystery].start) &&
        moment().isBefore(shared.content.mystery[item.mystery].end) &&
        !user.items.gear.owned[item.key] &&
        !~user.purchased.plan.mysteryItems.indexOf(item.key)
      ) {
      user.purchased.plan.mysteryItems.push(item.key);
    }
  });
}

exports.createSubscription = function(data, cb) {
  var recipient = data.gift ? data.gift.member : data.user;
  //if (!recipient.purchased.plan) recipient.purchased.plan = {}; // TODO double-check, this should never be the case
  var p = recipient.purchased.plan;
  var block = shared.content.subscriptionBlocks[data.gift ? data.gift.subscription.key : data.sub.key];
  var months = +block.months;

  if (data.gift) {
    if (p.customerId && !p.dateTerminated) { // User has active plan
      p.extraMonths += months;
    } else {
      p.dateTerminated = moment(p.dateTerminated).add({months: months}).toDate();
      if (!p.dateUpdated) p.dateUpdated = new Date();
    }
    if (!p.customerId) p.customerId = 'Gift'; // don't override existing customer, but all sub need a customerId
  } else {
    _(p).merge({ // override with these values
      planId: block.key,
      customerId: data.customerId,
      dateUpdated: new Date(),
      gemsBought: 0,
      paymentMethod: data.paymentMethod,
      extraMonths: +p.extraMonths
        + +(p.dateTerminated ? moment(p.dateTerminated).diff(new Date(),'months',true) : 0),
      dateTerminated: null,
      // Specify a lastBillingDate just for Amazon Payments
      // Resetted every time the subscription restarts
      lastBillingDate: data.paymentMethod === 'Amazon Payments' ? new Date() : undefined
    }).defaults({ // allow non-override if a plan was previously used
      dateCreated: new Date(),
      mysteryItems: []
    }).value();
  }

  // Block sub perks
  var perks = Math.floor(months/3);
  if (perks) {
    p.consecutive.offset += months;
    p.consecutive.gemCapExtra += perks*5;
    if (p.consecutive.gemCapExtra > 25) p.consecutive.gemCapExtra = 25;
    p.consecutive.trinkets += perks;
  }
  revealMysteryItems(recipient);
  if(isProduction) {
    if (!data.gift) utils.txnEmail(data.user, 'subscription-begins');

    var analyticsData = {
      uuid: data.user._id,
      itemPurchased: 'Subscription',
      sku: data.paymentMethod.toLowerCase() + '-subscription',
      purchaseType: 'subscribe',
      paymentMethod: data.paymentMethod,
      quantity: 1,
      gift: !!data.gift, // coerced into a boolean
      purchaseValue: block.price
    }
    utils.analytics.trackPurchase(analyticsData);
  }
  data.user.purchased.txnCount++;
  if (data.gift){
    members.sendMessage(data.user, data.gift.member, data.gift);

    var byUserName = utils.getUserInfo(data.user, ['name']).name;

    if(data.gift.member.preferences.emailNotifications.giftedSubscription !== false){
      utils.txnEmail(data.gift.member, 'gifted-subscription', [
        {name: 'GIFTER', content: byUserName},
        {name: 'X_MONTHS_SUBSCRIPTION', content: months}
      ]);
    }

    if (data.gift.member._id != data.user._id) { // Only send push notifications if sending to a user other than yourself
      pushNotify.sendNotify(data.gift.member, shared.i18n.t('giftedSubscription'), months + " months - by "+ byUserName);
    }
  }
  async.parallel([
    function(cb2){data.user.save(cb2)},
    function(cb2){data.gift ? data.gift.member.save(cb2) : cb2(null);}
  ], cb);
}

/**
 * Sets their subscription to be cancelled later
 */
exports.cancelSubscription = function(data, cb) {
  var p = data.user.purchased.plan,
    now = moment(),
    remaining = data.nextBill ? moment(data.nextBill).diff(new Date, 'days') : 30;

  p.dateTerminated =
    moment( now.format('MM') + '/' + moment(p.dateUpdated).format('DD') + '/' + now.format('YYYY') )
    .add({days: remaining}) // end their subscription 1mo from their last payment
    .add({months: Math.ceil(p.extraMonths)})// plus any extra time (carry-over, gifted subscription, etc) they have. TODO: moment can't add months in fractions...
    .toDate();
  p.extraMonths = 0; // clear extra time. If they subscribe again, it'll be recalculated from p.dateTerminated

  data.user.save(cb);
  utils.txnEmail(data.user, 'cancel-subscription');
  var analyticsData = {
    uuid: data.user._id,
    gaCategory: 'commerce',
    gaLabel: data.paymentMethod,
    paymentMethod: data.paymentMethod
  }
  utils.analytics.track('unsubscribe', analyticsData);
}

exports.buyGems = function(data, cb) {
  var amt = data.amount || 5;
  amt = data.gift ? data.gift.gems.amount/4 : amt;
  (data.gift ? data.gift.member : data.user).balance += amt;
  data.user.purchased.txnCount++;
  if(isProduction) {
    if (!data.gift) utils.txnEmail(data.user, 'donation');

    var analyticsData = {
      uuid: data.user._id,
      itemPurchased: 'Gems',
      sku: data.paymentMethod.toLowerCase() + '-checkout',
      purchaseType: 'checkout',
      paymentMethod: data.paymentMethod,
      quantity: 1,
      gift: !!data.gift, // coerced into a boolean
      purchaseValue: amt
    }
    utils.analytics.trackPurchase(analyticsData);
  }

  if (data.gift){
    var byUsername = utils.getUserInfo(data.user, ['name']).name;
    var gemAmount = data.gift.gems.amount || 20;

    members.sendMessage(data.user, data.gift.member, data.gift);
    if(data.gift.member.preferences.emailNotifications.giftedGems !== false){
      utils.txnEmail(data.gift.member, 'gifted-gems', [
        {name: 'GIFTER', content: byUsername},
        {name: 'X_GEMS_GIFTED', content: gemAmount}
      ]);
    }

    if (data.gift.member._id != data.user._id) { // Only send push notifications if sending to a user other than yourself
      pushNotify.sendNotify(data.gift.member, shared.i18n.t('giftedGems'), gemAmount + ' Gems - by '+byUsername);
    }
  }
  async.parallel([
    function(cb2){data.user.save(cb2)},
    function(cb2){data.gift ? data.gift.member.save(cb2) : cb2(null);}
  ], cb);
}

exports.validCoupon = function(req, res, next){
  mongoose.model('Coupon').findOne({_id:cc.validate(req.params.code), event:'google_6mo'}, function(err, coupon){
    if (err) return next(err);
    if (!coupon) return res.status(401).json({err:"Invalid coupon code"});
    return res.sendStatus(200);
  });
}

exports.stripeCheckout = stripe.checkout;
exports.stripeSubscribeCancel = stripe.subscribeCancel;
exports.stripeSubscribeEdit = stripe.subscribeEdit;

exports.paypalSubscribe = paypal.createBillingAgreement;
exports.paypalSubscribeSuccess = paypal.executeBillingAgreement;
exports.paypalSubscribeCancel = paypal.cancelSubscription;
exports.paypalCheckout = paypal.createPayment;
exports.paypalCheckoutSuccess = paypal.executePayment;
exports.paypalIPN = paypal.ipn;

exports.amazonVerifyAccessToken = amazon.verifyAccessToken;
exports.amazonCreateOrderReferenceId = amazon.createOrderReferenceId;
exports.amazonCheckout = amazon.checkout;
exports.amazonSubscribe = amazon.subscribe;
exports.amazonSubscribeCancel = amazon.subscribeCancel;

exports.iapAndroidVerify = iap.androidVerify;
exports.iapIosVerify = iap.iosVerify;
