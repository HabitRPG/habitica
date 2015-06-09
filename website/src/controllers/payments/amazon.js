var amazonPayments = require('amazon-payments');
var nconf = require('nconf');
var async = require('async');
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

  async.series({
    setOrderReferenceDetails: function(cb){
      payment.offAmazonPayments.setOrderReferenceDetails({

      }, cb);
    },

    confirmOrderReference: function(cb){
      payment.offAmazonPayments.confirmOrderReference({

      }, cb);
    },

    authorize: function(cb){
      payment.offAmazonPayments.authorize({

      }, cb);
    },

    closeOrderReference: function(cb){
      payment.offAmazonPayments.closeOrderReference({

      }, cb);
    }
  }, function(err, results){

  });

};