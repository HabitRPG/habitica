import amazonPayments from 'amazon-payments';
import nconf from 'nconf';

const IS_PROD = nconf.get('NODE_ENV') === 'production';

let api = {};

let amzPayment = amazonPayments.connect({
  environment: amazonPayments.Environment[IS_PROD ? 'Production' : 'Sandbox'],
  sellerId: nconf.get('AMAZON_PAYMENTS:SELLER_ID'),
  mwsAccessKey: nconf.get('AMAZON_PAYMENTS:MWS_KEY'),
  mwsSecretKey: nconf.get('AMAZON_PAYMENTS:MWS_SECRET'),
  clientId: nconf.get('AMAZON_PAYMENTS:CLIENT_ID'),
});

api.getTokenInfo = (token) => {
  return new Promise((resolve, reject) => {
    amzPayment.api.getTokenInfo(token, (err, tokenInfo) => {
      if (err) return reject(err);
      return resolve(tokenInfo);
    });
  });
};

api.createOrderReferenceId = (inputSet) => {
  return new Promise((resolve, reject) => {
    amzPayment.offAmazonPayments.createOrderReferenceForId(inputSet, (err, response) => {
      if (err) return reject(err);
      if (!response.OrderReferenceDetails || !response.OrderReferenceDetails.AmazonOrderReferenceId) {
        return reject('missingAttributesFromAmazon');
      }
      return resolve(response);
    });
  });
};

module.exports = api;
