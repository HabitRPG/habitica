import amazonPayments from 'amazon-payments';
import nconf from 'nconf';
import common from '../../common';
import Bluebird from 'bluebird';
import {
  BadRequest,
} from './errors';
import payments from './payments';
import { model as User } from '../models/user';

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

let api = {};

api.constants = {
  CURRENCY_CODE: 'USD',
  SELLER_NOTE: 'Habitica Payment',
  STORE_NAME: 'Habitica',

  GIFT_TYPE_GEMS: 'gems',
  GIFT_TYPE_SUBSCRIPTION: 'subscription',

  METHOD_BUY_GEMS: 'buyGems',
  METHOD_CREATE_SUBSCRIPTION: 'createSubscription',
  PAYMENT_METHOD_AMAZON: 'Amazon Payments',
  PAYMENT_METHOD_AMAZON_GIFT: 'Amazon Payments (Gift)',
};

api.getTokenInfo = Bluebird.promisify(amzPayment.api.getTokenInfo, {context: amzPayment.api});
api.createOrderReferenceId = Bluebird.promisify(amzPayment.offAmazonPayments.createOrderReferenceForId, {context: amzPayment.offAmazonPayments});
api.setOrderReferenceDetails = Bluebird.promisify(amzPayment.offAmazonPayments.setOrderReferenceDetails, {context: amzPayment.offAmazonPayments});
api.confirmOrderReference = Bluebird.promisify(amzPayment.offAmazonPayments.confirmOrderReference, {context: amzPayment.offAmazonPayments});
api.closeOrderReference = Bluebird.promisify(amzPayment.offAmazonPayments.closeOrderReference, {context: amzPayment.offAmazonPayments});
api.setBillingAgreementDetails = Bluebird.promisify(amzPayment.offAmazonPayments.setBillingAgreementDetails, {context: amzPayment.offAmazonPayments});
api.getBillingAgreementDetails = Bluebird.promisify(amzPayment.offAmazonPayments.getBillingAgreementDetails, {context: amzPayment.offAmazonPayments});
api.confirmBillingAgreement = Bluebird.promisify(amzPayment.offAmazonPayments.confirmBillingAgreement, {context: amzPayment.offAmazonPayments});
api.closeBillingAgreement = Bluebird.promisify(amzPayment.offAmazonPayments.closeBillingAgreement, {context: amzPayment.offAmazonPayments});

api.authorizeOnBillingAgreement = (inputSet) => {
  return new Promise((resolve, reject) => {
    amzPayment.offAmazonPayments.authorizeOnBillingAgreement(inputSet, (err, response) => {
      if (err) return reject(err);
      if (response.AuthorizationDetails.AuthorizationStatus.State === 'Declined') return reject(new BadRequest(i18n.t('paymentNotSuccessful')));
      return resolve(response);
    });
  });
};

api.authorize = (inputSet) => {
  return new Promise((resolve, reject) => {
    amzPayment.offAmazonPayments.authorize(inputSet, (err, response) => {
      if (err) return reject(err);
      if (response.AuthorizationDetails.AuthorizationStatus.State === 'Declined') return reject(new BadRequest(i18n.t('paymentNotSuccessful')));
      return resolve(response);
    });
  });
};

/**
 * Makes a purchase using Amazon Payment Lib
 *
 * @param  options
 * @param  options.user  The user object who is purchasing
 * @param  options.gift  The gift details if any
 * @param  options.orderReferenceId  The amazon orderReferenceId generated on the front end
 * @param  options.headers  The request headers
 *
 * @return undefined
 */
api.checkout = async function checkout (options = {}) {
  let {gift, user, orderReferenceId, headers} = options;
  let amount = 5;

  if (gift) {
    if (gift.type === this.constants.GIFT_TYPE_GEMS) {
      amount = gift.gems.amount / 4;
    } else if (gift.type === this.constants.GIFT_TYPE_SUBSCRIPTION) {
      amount = common.content.subscriptionBlocks[gift.subscription.key].price;
    }
  }

  await this.setOrderReferenceDetails({
    AmazonOrderReferenceId: orderReferenceId,
    OrderReferenceAttributes: {
      OrderTotal: {
        CurrencyCode: this.constants.CURRENCY_CODE,
        Amount: amount,
      },
      SellerNote: this.constants.SELLER_NOTE,
      SellerOrderAttributes: {
        SellerOrderId: common.uuid(),
        StoreName: this.constants.STORE_NAME,
      },
    },
  });

  await this.confirmOrderReference({ AmazonOrderReferenceId: orderReferenceId });

  await this.authorize({
    AmazonOrderReferenceId: orderReferenceId,
    AuthorizationReferenceId: common.uuid().substring(0, 32),
    AuthorizationAmount: {
      CurrencyCode: this.constants.CURRENCY_CODE,
      Amount: amount,
    },
    SellerAuthorizationNote: this.constants.SELLER_NOTE,
    TransactionTimeout: 0,
    CaptureNow: true,
  });

  await this.closeOrderReference({ AmazonOrderReferenceId: orderReferenceId });

  // execute payment
  let method = this.constants.METHOD_BUY_GEMS;

  let data = {
    user,
    paymentMethod: this.constants.PAYMENT_METHOD_AMAZON,
    headers,
  };

  if (gift) {
    if (gift.type === this.constants.GIFT_TYPE_SUBSCRIPTION) method = this.constants.METHOD_CREATE_SUBSCRIPTION;
    gift.member = await User.findById(gift ? gift.uuid : undefined).exec();
    data.gift = gift;
    data.paymentMethod = this.constants.PAYMENT_METHOD_AMAZON_GIFT;
  }

  await payments[method](data);
};

module.exports = api;
