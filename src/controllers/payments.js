/* @see ./routes.coffee for routing*/

var _ = require('lodash');
var logger = require('../logging');
var ipn = require('paypal-ipn');
var shared = require('habitrpg-shared');
var nconf = require('nconf');
var async = require('async');
var User = require('./../models/user').model;
var Order = require('./../models/order').model;
var utils = require('./../utils');
var logging = require('./../logging');
var userAPI = require('./user');
var request = require('request');
var moment = require('moment');
var api = module.exports;
var isProduction = nconf.get("NODE_ENV") === "production";
var stripe = require("stripe")(nconf.get('STRIPE_API_KEY'));
var bitauth = require('bitauth');
var bitpay = require('bitpay');

var PaypalRecurring = require('paypal-recurring');
var paypalRecurring = new PaypalRecurring({
  username:  nconf.get('PAYPAL_USERNAME'),
  password:  nconf.get('PAYPAL_PASSWORD'),
  signature: nconf.get('PAYPAL_SIGNATURE')
}, isProduction ? "production" : "sandbox");
var paypalCheckout = require('paypal-express-checkout')
  .init(nconf.get('PAYPAL_USERNAME'), nconf.get('PAYPAL_PASSWORD'), nconf.get('PAYPAL_SIGNATURE'), nconf.get('BASE_URL'), nconf.get('BASE_URL'), !isProduction);

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

function createSubscription(user, data) {
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
function cancelSubscription(user, data){
  var du = user.purchased.plan.dateUpdated, now = moment();
  if(isProduction) utils.txnEmail(user, 'cancel-subscription');
  user.purchased.plan.dateTerminated =
    moment( now.format('MM') + '/' + moment(du).format('DD') + '/' + now.format('YYYY') )
    .add({months:1})
    .toDate();
  utils.ga.event('unsubscribe', 'Stripe').send();

}

function buyGems(user, data) {
  user.balance += 5;
  user.purchased.txnCount++;
  if(isProduction) utils.txnEmail(user, 'donation');
  utils.ga.event('checkout', data.paymentMethod).send();
  utils.ga.transaction(data.customerId, 5).item(5, 1, data.paymentMethod.toLowerCase() + "-checkout", "Gems > " + data.paymentMethod).send();
}

// Expose some functions for tests
if (nconf.get('NODE_ENV')==='testing') {
  api.cancelSubscription = cancelSubscription;
  api.createSubscription = createSubscription;
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
          plan: req.query.plan,
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

api.paypalSubscribe = function(req,res,next) {
  // Authenticate a future subscription of ~5 USD
  paypalRecurring.authenticate({
    RETURNURL:                      nconf.get('BASE_URL') + '/paypal/subscribe/success?uuid=' + res.locals.user._id,
    CANCELURL:                      nconf.get("BASE_URL"),
    PAYMENTREQUEST_0_AMT:           5,
    L_BILLINGAGREEMENTDESCRIPTION0: "HabitRPG Subscription"
  }, function(err, data, url) {
    // Redirect the user if everything went well with
    // a HTTP 302 according to PayPal's guidelines
    if (err) return next(err);
    res.redirect(302, url);
  });
};

api.paypalSubscribeSuccess = function(req,res,next) {
  // Create a subscription of 5 USD every month
  var uuid = req.query.uuid;
  if (!uuid) return next("UUID required");
  paypalRecurring.createSubscription(req.query.token, req.query.PayerID,{
    AMT:              5,
    DESC:             "HabitRPG Subscription",
    BILLINGPERIOD:    "Month",
    BILLINGFREQUENCY: 1,
  }, function(err, data) {
    if (err) return res.next(err);
    User.findById(uuid, function(err,user){
      if (err) return next(err);
      createSubscription(user, {customerId: data.PROFILEID, paymentMethod: 'Paypal'});
      user.save(function(err,saved){
        res.redirect('/');
      })
    })
  });
};

api.paypalSubscribeCancel = function(req, res, next) {
  var user = res.locals.user;
  if (!user.purchased.plan.customerId)
    return res.json(401, {err: "User does not have a plan subscription"});
  async.waterfall([
    function(cb) {
      paypalRecurring.modifySubscription(user.purchased.plan.customerId, 'cancel', cb);
    },
    function(response, cb) {
      cancelSubscription(user);
      user.save(cb);
    }
  ], function(err, saved){
    if (err) return next(err);
    res.redirect('/');
    user = null;
  });
};

api.paypalCheckout = function(req, res, next) {
  var opts = {RETURNURL:nconf.get('BASE_URL') + '/paypal/checkout/success?uuid=' + res.locals.user._id};
  var order = new Order({buyer:res.locals.user._id,paymentMethod:'PayPal'});
  order.save();
  paypalCheckout.pay(order._id, 5, 'HabitRPG Gems', 'USD', opts, function(err, url) {
    if (err) return next(err);
    res.redirect(url);
  });
};

api.paypalCheckoutSuccess = function(req,res,next) {
  paypalCheckout.detail(req.query.token, req.query.PayerID, function(err, data, invoiceNumber, price) {
    // see `data` vars at https://github.com/petersirka/node-paypal-express-checkout#paypal-account
    //if (err) return next('PayPal Error: ' + msg);
    if (err) return next(err);
    if (data.ACK !== 'Success') return next('PayPal transaction failed, please try again');

    var uuid = req.query.uuid; //, apiToken = query.apiToken;
    User.findById(uuid , function(err, user) {
      if (_.isEmpty(user)) err = "user not found with uuid " + uuid + " when completing paypal transaction";
      if (err) return next(err);


      // Get the invoice number
      Order.findById(invoiceNumber, function (err, order){
        if (_.isEmpty(order)) err = "order not found with the invoiceNumber " + invoiceNumber + " when completing paypal transaction";
        if (err) return next(err);

        // Make sure we did'nt credited the user already
        // TODO : Add concurrency check
        if (!order.processed) {
          order.processed = true;
          order.save(function(err){
            if (err) return next(err);
            buyGems(user, {customerId:req.query.PayerID, paymentMethod:'Paypal'});
            user.save(function(){
              if (err) return next(err);
              res.redirect('/');
              uuid = null;
            });
          });
        }
        else { // The user have been rewarded already
          res.redirect('/');
          uuid = null;
        }
      });

    });
  });
};

/**
 * General IPN handler. We could use this for all paypal transaction handling (instead of the above functions), but I've
 * found it extremely unreliable. Instead, here we'll cancel HabitRPG subscriptions for users who manually cancel their
 * recurring paypal payments.
 */
api.paypalIPN = function(req, res, next) {
  // Must respond to PayPal IPN request with an empty 200 first, if using Express uncomment the following:
  res.send(200);
  ipn.verify(req.body, function callback(err, msg) {
    if (err) return logger.error(msg);
    switch (req.body.txn_type) {
      // TODO what's the diff b/w the two data.txn_types below? The docs recommend subscr_cancel, but I'm getting the other one instead...
      case 'recurring_payment_profile_cancel':
      case 'subscr_cancel':
        User.findOne({'purchased.plan.customerId':req.body.recurring_payment_id},function(err, user){
          if (err) return logger.error(err);
          if (_.isEmpty(user)) return; // looks like the cancellation was already handled properly above (see api.paypalSubscribeCancel)
          cancelSubscription(user);
          user.save();
        });
        break;
    }
  });
};


//---------------------------------
// BitPay Module

api.bitpayCheckout = function(req, res, next) {
  async.waterfall([
    function (cb) {
      var privkey = bitauth.decrypt(nconf.get('BITPAY_ENCRYPT_PASSWORD'),nconf.get('BITPAY_KEY'));
      var client = bitpay.createClient(privkey, {
        config : {
          apiHost : nconf.get('BITPAY_API_HOST'),
          apiPort : nconf.get('BITPAY_API_PORT'),
          forceSSL :nconf.get('BITPAY_FORCE_SSL')
        }
      });

      client.on('error', function(err){
        console.log(err);
      });

      client.on('ready', function(){
        var data = {
          price: 5,
          currency: 'USD',
          posData : JSON.stringify({uuid: res.locals.user._id}),
          redirectURL : nconf.get('BASE_URL') + '/bitpay/checkout/success?uuid=' + res.locals.user._id
        };

        client.post('invoices',data,function(err, invoice){
            if (!err){
              res.send(200,invoice.url);
            }
        })
      });
    }
  ]);

};

api.bitpayCheckoutSuccess = function(req,res,next) {
  // TODO implement the case of sucess
};
