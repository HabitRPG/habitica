var nconf = require('nconf');
var stripe = require('stripe')(nconf.get('STRIPE_API_KEY'));
var async = require('async');
var payments = require('./index');
var User = require('mongoose').model('User');
var shared = require('../../../../common');
var mongoose = require('mongoose');
var cc = require('coupon-code');

/*
 Setup Stripe response when posting payment
 */
exports.checkout = function(req, res, next) {
  var token = req.body.id;
  var user = res.locals.user;
  var gift = req.query.gift ? JSON.parse(req.query.gift) : undefined;
  var sub = req.query.sub ? shared.content.subscriptionBlocks[req.query.sub] : false;

  async.waterfall([
    function(cb){
      if (sub) {
        async.waterfall([
          function(cb2){
            if (!sub.discount) return cb2(null, null);
            if (!req.query.coupon) return cb2('Please provide a coupon code for this plan.');
            mongoose.model('Coupon').findOne({_id:cc.validate(req.query.coupon), event:sub.key}, cb2);
          },
          function(coupon, cb2){
            if (sub.discount && !coupon) return cb2('Invalid coupon code.');
            var customer = {
              email: req.body.email,
              metadata: {uuid: user._id},
              card: token,
              plan: sub.key
            };
            stripe.customers.create(customer, cb2);
          }
        ], cb);
      } else {
        stripe.charges.create({
          amount: !gift ? '500' //"500" = $5
            : gift.type=='subscription' ? ''+shared.content.subscriptionBlocks[gift.subscription.key].price*100
            : ''+gift.gems.amount/4*100,
          currency: 'usd',
          card: token
        }, cb);
      }
    },
    function(response, cb) {
      if (sub) return payments.createSubscription({user:user, customerId:response.id, paymentMethod:'Stripe', sub:sub}, cb);
      async.waterfall([
        function(cb2){ User.findById(gift ? gift.uuid : undefined, cb2); },
        function(member, cb2){
          var data = {user:user, customerId:response.id, paymentMethod:'Stripe', gift:gift};
          var method = 'buyGems';
          if (gift) {
            gift.member = member;
            if (gift.type=='subscription') method = 'createSubscription';
            data.paymentMethod = 'Gift';
          }
          payments[method](data, cb2);
        }
      ], cb);
    }
  ], function(err){
    if (err) return res.send(500, err.toString()); // don't json this, let toString() handle errors
    res.send(200);
    user = token = null;
  });
};

exports.subscribeCancel = function(req, res, next) {
  var user = res.locals.user;
  if (!user.purchased.plan.customerId)
    return res.json(401, {err: 'User does not have a plan subscription'});

  async.auto({
    get_cus: function(cb){
      stripe.customers.retrieve(user.purchased.plan.customerId, cb);
    },
    del_cus: ['get_cus', function(cb, results){
      stripe.customers.del(user.purchased.plan.customerId, cb);
    }],
    cancel_sub: ['get_cus', function(cb, results) {
      var data = {
        user: user,
        nextBill: results.get_cus.subscription.current_period_end*1000, // timestamp is in seconds
        paymentMethod: 'Stripe'
      };
      payments.cancelSubscription(data, cb);
    }]
  }, function(err, results){
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