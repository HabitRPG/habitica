var amazonPayments = require('amazon-payments');
var mongoose = require('mongoose');
var moment = require('moment');
var nconf = require('nconf');
var async = require('async');
var User = require('mongoose').model('User');
var shared = require('../../../../common');
var payments = require('./index');
var cc = require('coupon-code');
var isProd = nconf.get('NODE_ENV') === 'production';

var amzPayment = amazonPayments.connect({
  environment: amazonPayments.Environment[isProd ? 'Production' : 'Sandbox'],
  sellerId: nconf.get('AMAZON_PAYMENTS:SELLER_ID'),
  mwsAccessKey: nconf.get('AMAZON_PAYMENTS:MWS_KEY'),
  mwsSecretKey: nconf.get('AMAZON_PAYMENTS:MWS_SECRET'),
  clientId: nconf.get('AMAZON_PAYMENTS:CLIENT_ID')
});

exports.verifyAccessToken = function(req, res, next){
  if(!req.body || !req.body['access_token']){
    return res.status(400).json({err: 'Access token not supplied.'});
  }

  amzPayment.api.getTokenInfo(req.body['access_token'], function(err, tokenInfo){
    if(err) return res.status(400).json({err:err});

    res.sendStatus(200);
  });
};

exports.createOrderReferenceId = function(req, res, next){
  if(!req.body || !req.body.billingAgreementId){
    return res.status(400).json({err: 'Billing Agreement Id not supplied.'});
  }

  amzPayment.offAmazonPayments.createOrderReferenceForId({
    Id: req.body.billingAgreementId,
    IdType: 'BillingAgreement',
    ConfirmNow: false
  }, function(err, response){
    if(err) return next(err);
    if(!response.OrderReferenceDetails || !response.OrderReferenceDetails.AmazonOrderReferenceId){
      return next(new Error('Missing attributes in Amazon response.'));
    }

    res.json({
      orderReferenceId: response.OrderReferenceDetails.AmazonOrderReferenceId
    });
  });
};

exports.checkout = function(req, res, next){
  if(!req.body || !req.body.orderReferenceId){
    return res.status(400).json({err: 'Billing Agreement Id not supplied.'});
  }

  var gift = req.body.gift;
  var user = res.locals.user;
  var orderReferenceId = req.body.orderReferenceId;
  var amount = 5;

  if(gift){
    if(gift.type === 'gems'){
      amount = gift.gems.amount/4;
    }else if(gift.type === 'subscription'){
      amount = shared.content.subscriptionBlocks[gift.subscription.key].price;
    }
  }

  async.series({
    setOrderReferenceDetails: function(cb){
      amzPayment.offAmazonPayments.setOrderReferenceDetails({
        AmazonOrderReferenceId: orderReferenceId,
        OrderReferenceAttributes: {
          OrderTotal: {
            CurrencyCode: 'USD',
            Amount: amount
          },
          SellerNote: 'HabitRPG Payment',
          SellerOrderAttributes: {
            SellerOrderId: shared.uuid(),
            StoreName: 'HabitRPG'
          }
        }
      }, cb);
    },

    confirmOrderReference: function(cb){
      amzPayment.offAmazonPayments.confirmOrderReference({
        AmazonOrderReferenceId: orderReferenceId
      }, cb);
    },

    authorize: function(cb){
      amzPayment.offAmazonPayments.authorize({
        AmazonOrderReferenceId: orderReferenceId,
        AuthorizationReferenceId: shared.uuid().substring(0, 32),
        AuthorizationAmount: {
          CurrencyCode: 'USD',
          Amount: amount
        },
        SellerAuthorizationNote: 'HabitRPG Payment',
        TransactionTimeout: 0,
        CaptureNow: true
      }, function(err, res){
        if(err) return cb(err);

        if(res.AuthorizationDetails.AuthorizationStatus.State === 'Declined'){
          return cb(new Error('The payment was not successfull.'));
        }

        return cb();
      });
    },

    closeOrderReference: function(cb){
      amzPayment.offAmazonPayments.closeOrderReference({
        AmazonOrderReferenceId: orderReferenceId
      }, cb);
    },

    executePayment: function(cb){
      async.waterfall([
        function(cb2){ User.findById(gift ? gift.uuid : undefined, cb2); },
        function(member, cb2){
          var data = {user:user, paymentMethod:'Amazon Payments'};
          var method = 'buyGems';

          if (gift){
            if (gift.type == 'subscription') method = 'createSubscription';
            gift.member = member;
            data.gift = gift;
            data.paymentMethod = 'Gift';
          }

          payments[method](data, cb2);
        }
      ], cb);
    }
  }, function(err, results){
    if(err) return next(err);

    res.sendStatus(200);
  });

};

exports.subscribe = function(req, res, next){
  if(!req.body || !req.body['billingAgreementId']){
    return res.status(400).json({err: 'Billing Agreement Id not supplied.'});
  }

  var billingAgreementId = req.body.billingAgreementId;
  var sub = req.body.subscription ? shared.content.subscriptionBlocks[req.body.subscription] : false;
  var coupon = req.body.coupon;
  var user = res.locals.user;

  if(!sub){
    return res.status(400).json({err: 'Subscription plan not found.'});
  }

  async.series({
    applyDiscount: function(cb){
      if (!sub.discount) return cb();
      if (!coupon) return cb(new Error('Please provide a coupon code for this plan.'));
      mongoose.model('Coupon').findOne({_id:cc.validate(coupon), event:sub.key}, function(err, coupon){
        if(err) return cb(err);
        if(!coupon) return cb(new Error('Coupon code not found.'));
        cb();
      });
    },

    setBillingAgreementDetails: function(cb){
      amzPayment.offAmazonPayments.setBillingAgreementDetails({
        AmazonBillingAgreementId: billingAgreementId,
        BillingAgreementAttributes: {
          SellerNote: 'HabitRPG Subscription',
          SellerBillingAgreementAttributes: {
            SellerBillingAgreementId: shared.uuid(),
            StoreName: 'HabitRPG',
            CustomInformation: 'HabitRPG Subscription'
          }
        }
      }, cb);
    },

    confirmBillingAgreement: function(cb){
      amzPayment.offAmazonPayments.confirmBillingAgreement({
        AmazonBillingAgreementId: billingAgreementId
      }, cb);
    },

    authorizeOnBillingAgreeement: function(cb){
      amzPayment.offAmazonPayments.authorizeOnBillingAgreement({
        AmazonBillingAgreementId: billingAgreementId,
        AuthorizationReferenceId: shared.uuid().substring(0, 32),
        AuthorizationAmount: {
          CurrencyCode: 'USD',
          Amount: sub.price
        },
        SellerAuthorizationNote: 'HabitRPG Subscription Payment',
        TransactionTimeout: 0,
        CaptureNow: true,
        SellerNote: 'HabitRPG Subscription Payment',
        SellerOrderAttributes: {
          SellerOrderId: shared.uuid(),
          StoreName: 'HabitRPG'
        }
      }, function(err, res){
        if(err) return cb(err);

        if(res.AuthorizationDetails.AuthorizationStatus.State === 'Declined'){
          return cb(new Error('The payment was not successfull.'));
        }

        return cb();
      });
    },

    createSubscription: function(cb){
      payments.createSubscription({
        user: user,
        customerId: billingAgreementId,
        paymentMethod: 'Amazon Payments',
        sub: sub
      }, cb);
    }
  }, function(err, results){
    if(err) return next(err);

    res.sendStatus(200);
  });
};

exports.subscribeCancel = function(req, res, next){
  var user = res.locals.user;
  if (!user.purchased.plan.customerId)
    return res.status(401).json({err: 'User does not have a plan subscription'});

  var billingAgreementId = user.purchased.plan.customerId;

  async.series({
    closeBillingAgreement: function(cb){
      amzPayment.offAmazonPayments.closeBillingAgreement({
        AmazonBillingAgreementId: billingAgreementId
      }, cb);
    },

    cancelSubscription: function(cb){
      var data = {
        user: user,
        // Date of next bill
        nextBill: moment(user.purchased.plan.lastBillingDate).add({days: 30}),
        paymentMethod: 'Amazon Payments'
      };

      payments.cancelSubscription(data, cb);
    }
  }, function(err, results){
    if (err) return next(err); // don't json this, let toString() handle errors

    if(req.query.noRedirect){
      res.sendStatus(200);
    }else{
      res.redirect('/');
    }

    user = null;
  });
};
