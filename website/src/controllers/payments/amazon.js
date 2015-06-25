var amazonPayments = require('amazon-payments');
var nconf = require('nconf');
var async = require('async');
var User = require('mongoose').model('User');
var shared = require('../../../../common');
var payments = require('./index');
var isProd = nconf.get("NODE_ENV") === 'production';

var amzPayment = amazonPayments.connect({
  environment: amazonPayments.Environment[isProd ? 'Production' : 'Sandbox'],
  sellerId: nconf.get('AMAZON_PAYMENTS:SELLER_ID'),
  mwsAccessKey: nconf.get('AMAZON_PAYMENTS:MWS_KEY'),
  mwsSecretKey: nconf.get('AMAZON_PAYMENTS:MWS_SECRET'),
  clientId: nconf.get('AMAZON_PAYMENTS:CLIENT_ID')
});

exports.verifyAccessToken = function(req, res, next){
  if(!req.body || !req.body['access_token']){
    return res.json(400, {err: 'Access token not supplied.'});
  }

  amzPayment.api.getTokenInfo(req.body['access_token'], function(err, tokenInfo){
    if(err) return res.json(400, {err:err});
 
    res.send(200);
  });
};

exports.checkout = function(req, res, next){
  if(!req.body || !req.body['orderReferenceId']){
    return res.json(400, {err: 'Order Reference Id not supplied.'});
  }

  var gift = req.body.gift;
  var user = res.locals.user;
  var orderReferenceId = req.body.orderReferenceId;

  async.series({
    setOrderReferenceDetails: function(cb){
      amzPayment.offAmazonPayments.setOrderReferenceDetails({
        AmazonOrderReferenceId: orderReferenceId,
        OrderReferenceAttributes: {
          OrderTotal: {
            CurrencyCode: 'USD',
            Amount: gift ? (gift.gems.amount/4) : 5
          },
          SellerNote: 'HabitRPG Gems',
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
          Amount: gift ? (gift.gems.amount/4) : 5
        },
        SellerAuthorizationNote: 'HabitRPG Donation',
        TransactionTimeout: 0,
        CaptureNow: true
      }, cb);
    },

    closeOrderReference: function(cb){
      amzPayment.offAmazonPayments.closeOrderReference({
        AmazonOrderReferenceId: orderReferenceId
      }, cb);
    },

    executePayment: function(cb){
      async.waterfall([
        function(cb2){ User.findById(gift ? gift.uuid : undefined, cb2) },
        function(member, cb2){
          var data = {user:user, paymentMethod:'Amazon Payments'};
          var method = 'buyGems';

          if (gift){
            gift.member = member;
            data.gift = gift;
            data.paymentMethod = 'Gift';
          }

          payments.buyGems(data, cb2);
        }
      ], cb);
    }
  }, function(err, results){
    if(err) return next(err);

    res.send(200);
  });

};

exports.setupSubscription = function(req, res, next){
  if(!req.body || !req.body['orderReferenceId']){
    return res.json(400, {err: 'Billing Agreement Id not supplied.'});
  }
};