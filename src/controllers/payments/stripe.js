var nconf = require('nconf');
var stripe = require("stripe")(nconf.get('STRIPE_API_KEY'));
var async = require('async');
var payments = require('./index');

/*
 Setup Stripe response when posting payment
 */
exports.checkout = function(req, res, next) {
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
        payments.createSubscription(user, {customerId: response.id, paymentMethod: 'Stripe'});
      } else {
        payments.buyGems(user, {customerId: response.id, paymentMethod: 'Stripe'});
      }
      user.save(cb);
    }
  ], function(err, saved){
    if (err) return res.send(500, err.toString()); // don't json this, let toString() handle errors
    res.send(200);
    user = token = null;
  });
};

exports.subscribeCancel = function(req, res, next) {
  var user = res.locals.user;
  if (!user.purchased.plan.customerId)
    return res.json(401, {err: "User does not have a plan subscription"});

  async.waterfall([
    function(cb) {
      stripe.customers.del(user.purchased.plan.customerId, cb);
    },
    function(response, cb) {
      payments.cancelSubscription(user);
      user.save(cb);
    }
  ], function(err, saved){
    if (err) return res.send(500, err.toString()); // don't json this, let toString() handle errors
    res.redirect('/');
    user = null;
  });
};

exports.subscribeEdit = function(req, res, next) {
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