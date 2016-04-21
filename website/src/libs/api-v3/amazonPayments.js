import amazonPayments from 'amazon-payments';
import nconf from 'nconf';
import common from '../../../../common';
let t = common.i18n.t;
const IS_PROD = nconf.get('NODE_ENV') === 'production';

let api = {};

function connect (amazonPayments) { // eslint-disable-line no-shadow
  return amazonPayments.connect({
    environment: amazonPayments.Environment[IS_PROD ? 'Production' : 'Sandbox'],
    sellerId: nconf.get('AMAZON_PAYMENTS:SELLER_ID'),
    mwsAccessKey: nconf.get('AMAZON_PAYMENTS:MWS_KEY'),
    mwsSecretKey: nconf.get('AMAZON_PAYMENTS:MWS_SECRET'),
    clientId: nconf.get('AMAZON_PAYMENTS:CLIENT_ID'),
  });
}

api.getTokenInfo = (token) => {
  let amzPayment = connect(amazonPayments);
  return new Promise((resolve, reject) => {
    amzPayment.api.getTokenInfo(token, (err, tokenInfo) => {
      if (err) return reject(err);
      return resolve(tokenInfo);
    });
  });
};

api.createOrderReferenceId = (inputSet) => {
  let amzPayment = connect(amazonPayments);
  return new Promise((resolve, reject) => {
    amzPayment.offAmazonPayments.createOrderReferenceForId(inputSet, (err, response) => {
      if (err) return reject(err);
      if (!response.OrderReferenceDetails || !response.OrderReferenceDetails.AmazonOrderReferenceId) {
        return reject(t('missingAttributesFromAmazon'));
      }
      return resolve(response);
    });
  });
};

api.setOrderReferenceDetails = (inputSet) => {
  let amzPayment = connect(amazonPayments);
  return new Promise((resolve, reject) => {
    amzPayment.offAmazonPayments.setOrderReferenceDetails(inputSet, (err, response) => {
      if (err) return reject(err);
      return resolve(response);
    });
  });
};

api.confirmOrderReference = (inputSet) => {
  let amzPayment = connect(amazonPayments);
  return new Promise((resolve, reject) => {
    amzPayment.offAmazonPayments.confirmOrderReference(inputSet, (err, response) => {
      if (err) return reject(err);
      return resolve(response);
    });
  });
};

api.authorize = (inputSet) => {
  let amzPayment = connect(amazonPayments);
  return new Promize((resolve, reject) => {
    amzPayment.offAmazonPayments.authorize(inputSet, (err, response) => {
      if (err) return reject(err);
      if (response.AuthorizationDetails.AuthorizationStatus.State === 'Declined') return reject(t('paymentNotSuccessful'));
      return resolve(response);
    });
  });
};

api.closeOrderReference = (inputSet) => {
  let amzPayment = connect(amazonPayments);
  return new Promize((resolve, reject) => {
    amzPayment.offAmazonPayments.closeOrderReference(inputSet, (err, response) => {
      if (err) return reject(err);
      return resolve(response);
    });
  });
};

api.executePayment = (inputSet) => {
  let amzPayment = connect(amazonPayments);
  return new Promize((resolve, reject) => {
    amzPayment.offAmazonPayments.closeOrderReference(inputSet, (err, response) => {
      if (err) return reject(err);
      return resolve(response);
    });
  });
};

module.exports = api;
