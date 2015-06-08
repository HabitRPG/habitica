var amazonPayments = require('amazon-payments');

var payment = amazonPayments.connect({
  environment: amazonPayments.Environment.Production,
  sellerId: 'Amazon Seller ID',
  mwsAccessKey: 'MWS Access Key',
  mwsSecretKey: 'MWS Secret Key',
  clientId: 'Client ID'
});

exports.verifyAccessToken = function(req, res, next){

};