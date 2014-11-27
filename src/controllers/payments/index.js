/* @see ./routes.coffee for routing*/
var _ = require('lodash');
var shared = require('habitrpg-shared');
var nconf = require('nconf');
var utils = require('./../../utils');
var moment = require('moment');
var isProduction = nconf.get("NODE_ENV") === "production";
var stripe = require('./stripe');
var paypal = require('./paypal');
var User = require('mongoose').model('User');
var members = require('../members')
var async = require('async');

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

exports.createSubscription = function(data, cb) {
  var recipient = data.gift ? data.gift.member : data.user;
  if (!recipient.purchased.plan) recipient.purchased.plan = {};
  var p = recipient.purchased.plan;
  _(p).merge({ // override with these values
    planId:'basic_earned',
    customerId: data.customerId,
    dateUpdated: new Date(),
    gemsBought: 0,
    paymentMethod: data.paymentMethod,
    extraMonths: +p.extraMonths
      + +(p.dateTerminated ? moment(p.dateTerminated).diff(new Date(),'months',true) : 0)
      + +(data.gift ? data.gift.subscription.months : 0),
    dateTerminated: null
  }).defaults({ // allow non-override if a plan was previously used
    dateCreated: new Date(),
    mysteryItems: []
  });
  revealMysteryItems(recipient);
  if(isProduction) {
    utils.txnEmail(data.user, 'subscription-begins');
    //TODO proper ga.event / transaction
    utils.ga.event('subscribe', data.paymentMethod).send();
    utils.ga.transaction(data.customerId, 5).item(5, 1, data.paymentMethod.toLowerCase() + '-subscription', data.paymentMethod + " > Stripe").send();
  }
  data.user.purchased.txnCount++;
  if (data.gift) members.sendMessage(data.user, data.gift.member, data.gift);
  async.parallel([
    function(cb2){data.user.save(cb2)},
    function(cb2){data.gift ? data.gift.member.save(cb2) : cb2(null);}
  ], cb);
}

/**
 * Sets their subscription to be cancelled later
 */
exports.cancelSubscription = function(user, data) {
  var p = user.purchased.plan,
    now = moment();
  if(isProduction) utils.txnEmail(user, 'cancel-subscription');
  p.dateTerminated =
    moment( now.format('MM') + '/' + moment(p.dateUpdated).format('DD') + '/' + now.format('YYYY') )
    .add({months:1})// end their subscription 1mo from their last payment
    .add({months:p.extraMonths})// plus any extra time (carry-over, gifted subscription, etc) they have
    .toDate();
  p.extraMonths = 0; // clear extra time. If they subscribe again, it'll be recalculated from p.dateTerminated

  utils.ga.event('unsubscribe', 'Stripe').send();
}

exports.buyGems = function(data, cb) {
  var amt = data.gift ? data.gift.gems.amount/4 : 5;
  (data.gift ? data.gift.member : data.user).balance += amt;
  data.user.purchased.txnCount++;
  if(isProduction) {
    utils.txnEmail(data.user, 'donation');
    utils.ga.event('checkout', data.paymentMethod).send();
    //TODO ga.transaction to reflect whether this is gift or self-purchase
    utils.ga.transaction(data.customerId, amt).item(amt, 1, data.paymentMethod.toLowerCase() + "-checkout", "Gems > " + data.paymentMethod).send();
  }
  if (data.gift) members.sendMessage(data.user, data.gift.member, data.gift);
  async.parallel([
    function(cb2){data.user.save(cb2)},
    function(cb2){data.gift ? data.gift.member.save(cb2) : cb2(null);}
  ], cb);
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