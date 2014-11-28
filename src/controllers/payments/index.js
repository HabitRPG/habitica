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
  //if (!recipient.purchased.plan) recipient.purchased.plan = {}; // FIXME double-check, this should never be the case
  var p = recipient.purchased.plan;
  var months = data.gift ? data.gift.subscription.months : data.sub.months;
  var block = shared.content.subscriptionBlocks[months];

  if (data.gift) {
    if (!p.customerId) p.customerId = 'Gift'; // don't override existing customer, but all sub need a customerId
    if (p.dateTerminated) { // User already has a plan
      p.dateTerminated = moment(p.dateTerminated).add({months: months}).toDate();
    } else {
      p.extraMonths += +months;
    }
  } else {
    _(p).merge({ // override with these values
      planId: block.key,
      customerId: data.customerId,
      dateUpdated: new Date(),
      gemsBought: 0,
      paymentMethod: data.paymentMethod,
      extraMonths: +p.extraMonths
        + +(p.dateTerminated ? moment(p.dateTerminated).diff(new Date(),'months',true) : 0),
      dateTerminated: null
    }).defaults({ // allow non-override if a plan was previously used
      dateCreated: new Date(),
      mysteryItems: []
    });
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
    data.gift && utils.txnEmail(data.user, 'subscription-begins');
    utils.ga.event('subscribe', data.paymentMethod).send();
    utils.ga.transaction(data.user._id, block.price).item(block.price, 1, data.paymentMethod.toLowerCase() + '-subscription', data.paymentMethod).send();
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
  var p = user.purchased.plan, now = moment();
  p.dateTerminated =
    moment( now.format('MM') + '/' + moment(p.dateUpdated).format('DD') + '/' + now.format('YYYY') )
    .add({months:1}) // end their subscription 1mo from their last payment
    .add({months: Math.ceil(p.extraMonths)})// plus any extra time (carry-over, gifted subscription, etc) they have. FIXME: moment can't add months in fractions...
    .toDate();
  p.extraMonths = 0; // clear extra time. If they subscribe again, it'll be recalculated from p.dateTerminated

  if(isProduction) utils.txnEmail(user, 'cancel-subscription');
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