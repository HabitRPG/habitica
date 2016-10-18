import amazonPayments from 'amazon-payments';
import nconf from 'nconf';
import common from '../../common';
import Bluebird from 'bluebird';
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

let getTokenInfo = Bluebird.promisify(amzPayment.api.getTokenInfo, {context: amzPayment.api});
let createOrderReferenceId = Bluebird.promisify(amzPayment.offAmazonPayments.createOrderReferenceForId, {context: amzPayment.offAmazonPayments});
let setOrderReferenceDetails = Bluebird.promisify(amzPayment.offAmazonPayments.setOrderReferenceDetails, {context: amzPayment.offAmazonPayments});
let confirmOrderReference = Bluebird.promisify(amzPayment.offAmazonPayments.confirmOrderReference, {context: amzPayment.offAmazonPayments});
let closeOrderReference = Bluebird.promisify(amzPayment.offAmazonPayments.closeOrderReference, {context: amzPayment.offAmazonPayments});
let setBillingAgreementDetails = Bluebird.promisify(amzPayment.offAmazonPayments.setBillingAgreementDetails, {context: amzPayment.offAmazonPayments});
let confirmBillingAgreement = Bluebird.promisify(amzPayment.offAmazonPayments.confirmBillingAgreement, {context: amzPayment.offAmazonPayments});
let closeBillingAgreement = Bluebird.promisify(amzPayment.offAmazonPayments.closeBillingAgreement, {context: amzPayment.offAmazonPayments});

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
