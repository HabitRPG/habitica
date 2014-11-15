/* @see ./routes.coffee for routing*/

var _ = require('lodash');
var logger = require('../logging');
var shared = require('habitrpg-shared');
var nconf = require('nconf');
var async = require('async');
var User = require('./../models/user').model;
var utils = require('./../utils');
var logging = require('./../logging');
var request = require('request');
var moment = require('moment');
var api = module.exports;
var isProduction = nconf.get("NODE_ENV") === "production";
var stripe = require("stripe")(nconf.get('STRIPE_API_KEY'));
var paypal = require('./payments/paypal');

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

var createSubscription = api.createSubscription = function(user, data) {
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
var cancelSubscription = api.cancelSubscription = function(user, data) {
  var du = user.purchased.plan.dateUpdated, now = moment();
  if(isProduction) utils.txnEmail(user, 'cancel-subscription');
  user.purchased.plan.dateTerminated =
    moment( now.format('MM') + '/' + moment(du).format('DD') + '/' + now.format('YYYY') )
    .add({months:1})
    .toDate();
  utils.ga.event('unsubscribe', 'Stripe').send();
}

var buyGems = api.buyGems = function(user, data) {
  user.balance += 5;
  user.purchased.txnCount++;
  if(isProduction) utils.txnEmail(user, 'donation');
  utils.ga.event('checkout', data.paymentMethod).send();
  utils.ga.transaction(data.customerId, 5).item(5, 1, data.paymentMethod.toLowerCase() + "-checkout", "Gems > " + data.paymentMethod).send();
}

/*
 Setup Stripe response when posting payment
 */
api.stripeCheckout = function(req, res, next) {
  var token = req.body.id;
  var user = res.locals.user;

  async.waterfall([
    function(cb){
      if (req.query.plan) {
        stripe.customers.create({
          email: req.body.email,
          metadata: {uuid: res.locals.user._id},
          card: token,
          plan: req.query.plan
        }, cb);
      } else {
        stripe.charges.create({
          amount: "500", // $5
          currency: "usd",
          card: token
        }, cb);
      }
    },
    function(response, cb) {
      if (req.query.plan) {
        createSubscription(user, {customerId: response.id, paymentMethod: 'Stripe'});
      } else {
        buyGems(user, {customerId: response.id, paymentMethod: 'Stripe'});
      }
      user.save(cb);
    }
  ], function(err, saved){
    if (err) return res.send(500, err.toString()); // don't json this, let toString() handle errors
    res.send(200);
    user = token = null;
  });
};

api.stripeSubscribeCancel = function(req, res, next) {
  var user = res.locals.user;
  if (!user.purchased.plan.customerId)
    return res.json(401, {err: "User does not have a plan subscription"});

  async.waterfall([
    function(cb) {
      stripe.customers.del(user.purchased.plan.customerId, cb);
    },
    function(response, cb) {
      cancelSubscription(user);
      user.save(cb);
    }
  ], function(err, saved){
    if (err) return res.send(500, err.toString()); // don't json this, let toString() handle errors
    res.redirect('/');
    user = null;
  });
};

api.stripeSubscribeEdit = function(req, res, next) {
  var token = req.body.id;
  var user = res.locals.user;
  var user_id = user.purchased.plan.customerId;
  var sub_id;

  async.waterfall([
    function(cb){
      stripe.customers.listSubscriptions(user_id, cb);
    },
    function(response, cb) {
      sub_id = response.data[0].id;
      console.warn(sub_id);
      console.warn([user_id, sub_id, { card: token }]);
      stripe.customers.updateSubscription(user_id, sub_id, { card: token }, cb);
    },
    function(response, cb) {
      user.save(cb);
    }
  ], function(err, saved){
    if (err) return res.send(500, err.toString()); // don't json this, let toString() handle errors
    res.send(200);
    token = user = user_id = sub_id;
  });
};

api.paypalSubscribe = paypal.createBillingAgreement;
api.paypalSubscribeSuccess = paypal.executeBillingAgreement;
api.paypalSubscribeCancel = paypal.cancelSubscription;
api.paypalCheckout = paypal.createPayment;
api.paypalCheckoutSuccess = paypal.executePayment;
api.paypalIPN = paypal.ipn;