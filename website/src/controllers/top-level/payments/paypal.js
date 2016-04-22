var nconf = require('nconf');
var moment = require('moment');
var async = require('async');
var _ = require('lodash');
var url = require('url');
var User = require('mongoose').model('User');
var payments = require('../../../libs/api-v3/payments');
var logger = require('../../../libs/api-v2/logging');
var ipn = require('paypal-ipn');
var paypal = require('paypal-rest-sdk');
var shared = require('../../../../../common');
var mongoose = require('mongoose');
var cc = require('coupon-code');

// This is the plan.id for paypal subscriptions. You have to set up billing plans via their REST sdk (they don't have
// a web interface for billing-plan creation), see ./paypalBillingSetup.js for how. After the billing plan is created
// there, get it's plan.id and store it in config.json
_.each(shared.content.subscriptionBlocks, function(block){
  block.paypalKey = nconf.get("PAYPAL:billing_plans:"+block.key);
});

paypal.configure({
  'mode': nconf.get("PAYPAL:mode"), //sandbox or live
  'client_id': nconf.get("PAYPAL:client_id"),
  'client_secret': nconf.get("PAYPAL:client_secret")
});

var parseErr = function (res, err) {
  //var error = err.response ? err.response.message || err.response.details[0].issue : err;
  var error = JSON.stringify(err);
  return res.status(400).json({err:error});
}

/*
exports.createBillingAgreement = function(req,res,next){
  var sub = shared.content.subscriptionBlocks[req.query.sub];
  async.waterfall([
    function(cb){
      if (!sub.discount) return cb(null, null);
      if (!req.query.coupon) return cb('Please provide a coupon code for this plan.');
      mongoose.model('Coupon').findOne({_id:cc.validate(req.query.coupon), event:sub.key}, cb);
    },
    function(coupon, cb){
      if (sub.discount && !coupon) return cb('Invalid coupon code.');
      var billingPlanTitle = "HabitRPG Subscription" + ' ($'+sub.price+' every '+sub.months+' months, recurring)';
      var billingAgreementAttributes = {
        "name": billingPlanTitle,
        "description": billingPlanTitle,
        "start_date": moment().add({minutes:5}).format(),
        "plan": {
          "id": sub.paypalKey
        },
        "payer": {
          "payment_method": "paypal"
        }
      };
      paypal.billingAgreement.create(billingAgreementAttributes, cb);
    }
  ], function(err, billingAgreement){
    if (err) return parseErr(res, err);
    // For approving subscription via Paypal, first redirect user to: approval_url
    req.session.paypalBlock = req.query.sub;
    var approval_url = _.find(billingAgreement.links, {rel:'approval_url'}).href;
    res.redirect(approval_url);
  });
}

exports.executeBillingAgreement = function(req,res,next){
  var block = shared.content.subscriptionBlocks[req.session.paypalBlock];
  delete req.session.paypalBlock;
  async.auto({
    exec: function (cb) {
      paypal.billingAgreement.execute(req.query.token, {}, cb);
    },
    get_user: function (cb) {
      User.findById(req.session.userId, cb);
    },
    create_sub: ['exec', 'get_user', function (cb, results) {
      payments.createSubscription({
        user: results.get_user,
        customerId: results.exec.id,
        paymentMethod: 'Paypal',
        sub: block
      }, cb);
    }]
  },function(err){
    if (err) return parseErr(res, err);
    res.redirect('/');
  })
}

exports.createPayment = function(req, res) {
  // if we're gifting to a user, put it in session for the `execute()`
  req.session.gift = req.query.gift || undefined;
  var gift = req.query.gift ? JSON.parse(req.query.gift) : undefined;
  var price = !gift ? 5.00
    : gift.type=='gems' ? Number(gift.gems.amount/4).toFixed(2)
    : Number(shared.content.subscriptionBlocks[gift.subscription.key].price).toFixed(2);
  var description = !gift ? "HabitRPG Gems"
    : gift.type=='gems' ? "HabitRPG Gems (Gift)"
    : shared.content.subscriptionBlocks[gift.subscription.key].months + "mo. HabitRPG Subscription (Gift)";
  var create_payment = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": nconf.get('BASE_URL') + '/paypal/checkout/success',
      "cancel_url": nconf.get('BASE_URL')
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": description,
          //"sku": "1",
          "price": price,
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": price
      },
      "description": description
    }]
  };
  paypal.payment.create(create_payment, function (err, payment) {
    if (err) return parseErr(res, err);
    var link = _.find(payment.links, {rel: 'approval_url'}).href;
    res.redirect(link);
  });
}

exports.executePayment = function(req, res) {
  var paymentId = req.query.paymentId,
    PayerID = req.query.PayerID,
    gift = req.session.gift ? JSON.parse(req.session.gift) : undefined;
  delete req.session.gift;
  async.waterfall([
    function(cb){
      paypal.payment.execute(paymentId, {payer_id: PayerID}, cb);
    },
    function(payment, cb){
      async.parallel([
        function(cb2){ User.findById(req.session.userId, cb2); },
        function(cb2){ User.findById(gift ? gift.uuid : undefined, cb2); }
      ], cb);
    },
    function(results, cb){
      if (_.isEmpty(results[0])) return cb("User not found when completing paypal transaction");
      var data = {user:results[0], customerId:PayerID, paymentMethod:'Paypal', gift:gift}
      var method = 'buyGems';
      if (gift) {
        gift.member = results[1];
        if (gift.type=='subscription') method = 'createSubscription';
        data.paymentMethod = 'Gift';
      }
      payments[method](data, cb);
    }
  ],function(err){
    if (err) return parseErr(res, err);
    res.redirect('/');
  })
}

exports.cancelSubscription = function(req, res, next){
  var user = res.locals.user;
  if (!user.purchased.plan.customerId)
    return res.status(401).json({err: "User does not have a plan subscription"});
  async.auto({
    get_cus: function(cb){
      paypal.billingAgreement.get(user.purchased.plan.customerId, cb);
    },
    verify_cus: ['get_cus', function(cb, results){
      var hasntBilledYet = results.get_cus.agreement_details.cycles_completed == "0";
      if (hasntBilledYet)
        return cb("The plan hasn't activated yet (due to a PayPal bug). It will begin "+results.get_cus.agreement_details.next_billing_date+", after which you can cancel to retain your full benefits");
      cb();
    }],
    del_cus: ['verify_cus', function(cb, results){
      paypal.billingAgreement.cancel(user.purchased.plan.customerId, {note: "Canceling the subscription"}, cb);
    }],
    cancel_sub: ['get_cus', 'verify_cus', function(cb, results){
      var data = {user: user, paymentMethod: 'Paypal', nextBill: results.get_cus.agreement_details.next_billing_date};
      payments.cancelSubscription(data, cb)
    }]
  }, function(err){
    if (err) return parseErr(res, err);
    res.redirect('/');
    user = null;
  });
} // */

/**
 * General IPN handler. We catch cancelled HabitRPG subscriptions for users who manually cancel their
 * recurring paypal payments in their paypal dashboard. Remove this when we can move to webhooks or some other solution
 */
/*
exports.ipn = function(req, res, next) {
  console.log('IPN Called');
  res.sendStatus(200); // Must respond to PayPal IPN request with an empty 200 first
  ipn.verify(req.body, function(err, msg) {
    if (err) return logger.error(msg);
    switch (req.body.txn_type) {
      // TODO what's the diff b/w the two data.txn_types below? The docs recommend subscr_cancel, but I'm getting the other one instead...
      case 'recurring_payment_profile_cancel':
      case 'subscr_cancel':
        User.findOne({'purchased.plan.customerId':req.body.recurring_payment_id},function(err, user){
          if (err) return logger.error(err);
          if (_.isEmpty(user)) return; // looks like the cancellation was already handled properly above (see api.paypalSubscribeCancel)
          payments.cancelSubscription({user:user, paymentMethod: 'Paypal'});
        });
        break;
    }
  });
};
*/
