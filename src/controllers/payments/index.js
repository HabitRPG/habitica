/* @see ./routes.coffee for routing*/
var _ = require('lodash');
var shared = require('habitrpg-shared');
var nconf = require('nconf');
var utils = require('./../../utils');
var moment = require('moment');
var isProduction = nconf.get("NODE_ENV") === "production";
var stripe = require('./stripe');
var paypal = require('./paypal');
var iap = require('./iap');

function revealMysteryItems(user) {
  _.each(shared.content.gear.flat, function(item) {
    if (
      item.klass === 'mystery' &&
        moment().isAfter(item.mystery.start) &&
        moment().isBefore(item.mystery.end) &&
        !user.items.gear.owned[item.key] &&
        !~user.purchased.plan.mysteryItems.indexOf(item.key)
      ) {
      user.purchased.plan.mysteryItems.push(item.key);
    }
  });
}

exports.createSubscription = function(user, data) {
  if (!user.purchased.plan) user.purchased.plan = {};
  _(user.purchased.plan)
    .merge({ // override with these values
      planId:'basic_earned',
      customerId: data.customerId,
      dateUpdated: new Date(),
      gemsBought: 0,
      paymentMethod: data.paymentMethod,
      dateTerminated: null
    })
    .defaults({ // allow non-override if a plan was previously used
      dateCreated: new Date(),
      mysteryItems: []
    });
  revealMysteryItems(user);
  if(isProduction) utils.txnEmail(user, 'subscription-begins');
  user.purchased.txnCount++;
  utils.ga.event('subscribe', data.paymentMethod).send();
  utils.ga.transaction(data.customerId, 5).item(5, 1, data.paymentMethod.toLowerCase() + '-subscription', data.paymentMethod + " > Stripe").send();
}

/**
 * Sets their subscription to be cancelled later
 */
exports.cancelSubscription = function(user, data) {
  var du = user.purchased.plan.dateUpdated, now = moment();
  if(isProduction) utils.txnEmail(user, 'cancel-subscription');
  user.purchased.plan.dateTerminated =
    moment( now.format('MM') + '/' + moment(du).format('DD') + '/' + now.format('YYYY') )
    .add({months:1})
    .toDate();
  utils.ga.event('unsubscribe', 'Stripe').send();
}

exports.buyGems = function(user, data) {
  user.balance += 5;
  user.purchased.txnCount++;
  if(isProduction) utils.txnEmail(user, 'donation');
  utils.ga.event('checkout', data.paymentMethod).send();
  utils.ga.transaction(data.customerId, 5).item(5, 1, data.paymentMethod.toLowerCase() + "-checkout", "Gems > " + data.paymentMethod).send();
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

exports.iapAndroidVerify = iap.androidVerify;
exports.iapIosVerify = iap.iosVerify;