import amazonPayments from 'amazon-payments';
import nconf from 'nconf';
import common from '../../../../common';
import Q from 'q';
import {
  BadRequest,
} from './errors';

// TODO better handling of errors

const i18n = common.i18n;
const IS_PROD = nconf.get('NODE_ENV') === 'production';

let amzPayment = amazonPayments.connect({
  environment: amazonPayments.Environment[IS_PROD ? 'Production' : 'Sandbox'],
  sellerId: nconf.get('AMAZON_PAYMENTS:SELLER_ID'),
  mwsAccessKey: nconf.get('AMAZON_PAYMENTS:MWS_KEY'),
  mwsSecretKey: nconf.get('AMAZON_PAYMENTS:MWS_SECRET'),
  clientId: nconf.get('AMAZON_PAYMENTS:CLIENT_ID'),
});

let getTokenInfo = Q.nbind(amzPayment.api.getTokenInfo, amzPayment.api);
let createOrderReferenceId = Q.nbind(amzPayment.offAmazonPayments.createOrderReferenceForId, amzPayment.offAmazonPayments);
let setOrderReferenceDetails = Q.nbind(amzPayment.offAmazonPayments.setOrderReferenceDetails, amzPayment.offAmazonPayments);
let confirmOrderReference = Q.nbind(amzPayment.offAmazonPayments.confirmOrderReference, amzPayment.offAmazonPayments);
let closeOrderReference = Q.nbind(amzPayment.offAmazonPayments.closeOrderReference, amzPayment.offAmazonPayments);
let setBillingAgreementDetails = Q.nbind(amzPayment.offAmazonPayments.setBillingAgreementDetails, amzPayment.offAmazonPayments);
let confirmBillingAgreement = Q.nbind(amzPayment.offAmazonPayments.confirmBillingAgreement, amzPayment.offAmazonPayments);
let closeBillingAgreement = Q.nbind(amzPayment.offAmazonPayments.closeBillingAgreement, amzPayment.offAmazonPayments);

let authorizeOnBillingAgreement = (inputSet) => {
  return new Promise((resolve, reject) => {
    amzPayment.offAmazonPayments.authorizeOnBillingAgreement(inputSet, (err, response) => {
      if (err) return reject(err);
      if (response.AuthorizationDetails.AuthorizationStatus.State === 'Declined') return reject(new BadRequest(i18n.t('paymentNotSuccessful')));
      return resolve(response);
    });
  });
};

let authorize = (inputSet) => {
  return new Promise((resolve, reject) => {
    amzPayment.offAmazonPayments.authorize(inputSet, (err, response) => {
      if (err) return reject(err);
      if (response.AuthorizationDetails.AuthorizationStatus.State === 'Declined') return reject(new BadRequest(i18n.t('paymentNotSuccessful')));
      return resolve(response);
    });
  });
};

module.exports = {
  getTokenInfo,
  createOrderReferenceId,
  setOrderReferenceDetails,
  confirmOrderReference,
  closeOrderReference,
  confirmBillingAgreement,
  setBillingAgreementDetails,
  closeBillingAgreement,
  authorizeOnBillingAgreement,
  authorize,
};
