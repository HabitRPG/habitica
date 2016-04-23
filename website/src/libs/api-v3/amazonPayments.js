import amazonPayments from 'amazon-payments';
import nconf from 'nconf';
import common from '../../../../common';
let t = common.i18n.t;
const IS_PROD = nconf.get('NODE_ENV') === 'production';
import Q from 'q';

let api = {};

let amzPayment = amazonPayments.connect({
  environment: amazonPayments.Environment[IS_PROD ? 'Production' : 'Sandbox'],
  sellerId: nconf.get('AMAZON_PAYMENTS:SELLER_ID'),
  mwsAccessKey: nconf.get('AMAZON_PAYMENTS:MWS_KEY'),
  mwsSecretKey: nconf.get('AMAZON_PAYMENTS:MWS_SECRET'),
  clientId: nconf.get('AMAZON_PAYMENTS:CLIENT_ID'),
});

/**
 * From: https://payments.amazon.com/documentation/apireference/201751670#201751670
 */
api.getTokenInfo = (token) => {
  let thisBinding = Q.nbind(amzPayment.api.getTokenInfo, amzPayment.api);
  return thisBinding(inputSet);
};

api.createOrderReferenceId = (inputSet) => {
  let thisBinding = Q.nbind(amzPayment.offAmazonPayments.createOrderReferenceForId, amzPayment.offAmazonPayments);
  return thisBinding(inputSet);
};

api.setOrderReferenceDetails = (inputSet) => {
  let thisBinding = Q.nbind(amzPayment.offAmazonPayments.setOrderReferenceDetails, amzPayment.offAmazonPayments);
  return thisBinding(inputSet);
};

api.confirmOrderReference = (inputSet) => {
  let thisBinding = Q.nbind(amzPayment.offAmazonPayments.confirmOrderReference, amzPayment.offAmazonPayments);
  return thisBinding(inputSet);
};

api.authorize = (inputSet) => {
  return new Promize((resolve, reject) => {
    amzPayment.offAmazonPayments.authorize(inputSet, (err, response) => {
      if (err) return reject(err);
      if (response.AuthorizationDetails.AuthorizationStatus.State === 'Declined') return reject(t('paymentNotSuccessful'));
      return resolve(response);
    });
  });
};

api.closeOrderReference = (inputSet) => {
  let thisBinding = Q.nbind(amzPayment.offAmazonPayments.closeOrderReference, amzPayment.offAmazonPayments);
  return thisBinding(inputSet);
};

api.setBillingAgreementDetails = (inputSet) => {
  let thisBinding = Q.nbind(amzPayment.offAmazonPayments.setBillingAgreementDetails, amzPayment.offAmazonPayments);
  return thisBinding(inputSet); 
};

api.confirmBillingAgreement = (inputSet) => {
  let thisBinding = Q.nbind(amzPayment.offAmazonPayments.confirmBillingAgreement, amzPayment.offAmazonPayments);
  return thisBinding(inputSet); 
};

api.authorizeOnBillingAgreement = (inputSet) => {
  let thisBinding = Q.nbind(amzPayment.offAmazonPayments.authorizeOnBillingAgreement, amzPayment.offAmazonPayments)
  .then(res) {
    if (res.AuthorizationDetails.AuthorizationStatus.State === 'Declined') throw new Error(t('paymentNotSuccessful'));
  };
  return thisBinding(inputSet); 
};

api.closeBillingAgreement = (inputSet) => {
  let thisBinding = Q.nbind(amzPayment.offAmazonPayments.closeBillingAgreement, amzPayment.offAmazonPayments);
  return thisBinding(inputSet); 
};

module.exports = api;
