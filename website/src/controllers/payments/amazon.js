var amazonPayments = require('amazon-payments');
var nconf = require('nconf');
var async = require('async');
var shared = require('../../../../common');
var isProd = nconf.get("NODE_ENV") === 'production';

var payment = amazonPayments.connect({
  environment: amazonPayments.Environment.Sandbox,
  sellerId: nconf.get('AMAZON_PAYMENTS:SELLER_ID'),
  mwsAccessKey: nconf.get('AMAZON_PAYMENTS:MWS_KEY'),
  mwsSecretKey: nconf.get('AMAZON_PAYMENTS:MWS_SECRET'),
  clientId: nconf.get('AMAZON_PAYMENTS:CLIENT_ID')
});

exports.verifyAccessToken = function(req, res, next){
  if(!req.body || !req.body['access_token']){
    return res.json(400, {err: 'Access token not supplied.'});
  }

  payment.api.getTokenInfo(req.body['access_token'], function(err, tokenInfo){
    if(err) return next(err);
 
    res.send(200);
  });
};

exports.checkout = function(req, res, next){
  if(!req.body || !req.body['orderReferenceId']){
    return res.json(400, {err: 'Order Reference Id not supplied.'});
  }

  var orderReferenceId = req.body.orderReferenceId;

  async.series({
    setOrderReferenceDetails: function(cb){
      console.log('setOrderReferenceDetails')
      payment.offAmazonPayments.setOrderReferenceDetails({
        AmazonOrderReferenceId: orderReferenceId,
        OrderReferenceAttributes: {
          OrderTotal: {
            CurrencyCode: 'USD',
            Amount: 5
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
      console.log('confirmOrderReference')
      payment.offAmazonPayments.confirmOrderReference({
        AmazonOrderReferenceId: orderReferenceId
      }, cb);
    },

    authorize: function(cb){
      console.log('authorize')
      payment.offAmazonPayments.authorize({
        AmazonOrderReferenceId: orderReferenceId,
        AuthorizationReferenceId: shared.uuid().substring(0, 32),
        AuthorizationAmount: {
          CurrencyCode: 'USD',
          Amount: 5
        },
        SellerAuthorizationNote: 'HabitRPG Donation',
        TransactionTimeout: 0,
        CaptureNow: true
      }, cb);
    },

    closeOrderReference: function(cb){
      console.log('closeOrderReference')
      payment.offAmazonPayments.closeOrderReference({
        AmazonOrderReferenceId: orderReferenceId
      }, cb);
    }
  }, function(err, results){
    if(err) return next(err);

    res.send(200);
  });

};