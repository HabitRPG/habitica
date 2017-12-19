import amazonPayments from 'amazon-payments';
import nconf from 'nconf';
import Bluebird from 'bluebird';
import moment from 'moment';
import cc from 'coupon-code';
import uuid from 'uuid';

import common from '../../common';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from './errors';
import payments from './payments';
import { model as User } from '../models/user';
import {
  model as Group,
  basicFields as basicGroupFields,
} from '../models/group';
import { model as Coupon } from '../models/coupon';

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
  SELLER_NOTE_SUBSCRIPTION: 'Habitica Subscription',
  SELLER_NOTE_ATHORIZATION_SUBSCRIPTION: 'Habitica Subscription Payment',
  SELLER_NOTE_GROUP_NEW_MEMBER: 'Habitica Group Plan New Member',
  STORE_NAME: 'Habitica',

  GIFT_TYPE_GEMS: 'gems',
  GIFT_TYPE_SUBSCRIPTION: 'subscription',

  METHOD_BUY_GEMS: 'buyGems',
  METHOD_CREATE_SUBSCRIPTION: 'createSubscription',
  PAYMENT_METHOD: 'Amazon Payments',
  PAYMENT_METHOD_GIFT: 'Amazon Payments (Gift)',
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

api.authorizeOnBillingAgreement = function authorizeOnBillingAgreement (inputSet) {
  return new Promise((resolve, reject) => {
    amzPayment.offAmazonPayments.authorizeOnBillingAgreement(inputSet, (err, response) => {
      if (err) return reject(err);
      if (response.AuthorizationDetails.AuthorizationStatus.State === 'Declined') return reject(new BadRequest(i18n.t('paymentNotSuccessful')));
      return resolve(response);
    });
  });
};

api.authorize = function authorize (inputSet) {
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
    gift.member = await User.findById(gift.uuid).exec();

    if (gift.type === this.constants.GIFT_TYPE_GEMS) {
      if (gift.gems.amount <= 0) {
        throw new BadRequest(i18n.t('badAmountOfGemsToPurchase'));
      }
      amount = gift.gems.amount / 4;
    } else if (gift.type === this.constants.GIFT_TYPE_SUBSCRIPTION) {
      amount = common.content.subscriptionBlocks[gift.subscription.key].price;
    }
  }

  if (!gift || gift.type === this.constants.GIFT_TYPE_GEMS) {
    const receiver = gift ? gift.member : user;
    const receiverCanGetGems = await receiver.canGetGems();
    if (!receiverCanGetGems) throw new NotAuthorized(i18n.t('groupPolicyCannotGetGems', receiver.preferences.language));
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
    paymentMethod: this.constants.PAYMENT_METHOD,
    headers,
  };

  if (gift) {
    if (gift.type === this.constants.GIFT_TYPE_SUBSCRIPTION) method = this.constants.METHOD_CREATE_SUBSCRIPTION;
    gift.member = await User.findById(gift.uuid).exec();
    data.gift = gift;
    data.paymentMethod = this.constants.PAYMENT_METHOD_GIFT;
  }

  await payments[method](data);
};

/**
 * Cancel an Amazon Subscription
 *
 * @param  options
 * @param  options.user  The user object who is canceling
 * @param  options.groupId  The id of the group that is canceling
 * @param  options.headers  The request headers
 * @param  options.cancellationReason  A text string to control sending an email
 *
 * @return undefined
 */
api.cancelSubscription = async function cancelSubscription (options = {}) {
  let {user, groupId, headers, cancellationReason} = options;

  let billingAgreementId;
  let planId;
  let lastBillingDate;

  if (groupId) {
    let groupFields = basicGroupFields.concat(' purchased');
    let group = await Group.getGroup({user, groupId, populateLeader: false, groupFields});

    if (!group) {
      throw new NotFound(i18n.t('groupNotFound'));
    }

    if (group.leader !== user._id) {
      throw new NotAuthorized(i18n.t('onlyGroupLeaderCanManageSubscription'));
    }

    billingAgreementId = group.purchased.plan.customerId;
    planId = group.purchased.plan.planId;
    lastBillingDate = group.purchased.plan.lastBillingDate;
  } else {
    billingAgreementId = user.purchased.plan.customerId;
    planId = user.purchased.plan.planId;
    lastBillingDate = user.purchased.plan.lastBillingDate;
  }

  if (!billingAgreementId) throw new NotAuthorized(i18n.t('missingSubscription'));

  let details = await this.getBillingAgreementDetails({
    AmazonBillingAgreementId: billingAgreementId,
  }).catch(function errorCatch (err) {
    return err;
  });

  let badBAStates = ['Canceled', 'Closed', 'Suspended'];
  if (details && details.BillingAgreementDetails && details.BillingAgreementDetails.BillingAgreementStatus &&
      badBAStates.indexOf(details.BillingAgreementDetails.BillingAgreementStatus.State) === -1) {
    await this.closeBillingAgreement({
      AmazonBillingAgreementId: billingAgreementId,
    });
  }


  let subscriptionBlock = common.content.subscriptionBlocks[planId];
  let subscriptionLength = subscriptionBlock.months * 30;

  await payments.cancelSubscription({
    user,
    groupId,
    nextBill: moment(lastBillingDate).add({ days: subscriptionLength }),
    paymentMethod: this.constants.PAYMENT_METHOD,
    headers,
    cancellationReason,
  });
};

/**
 * Allows for purchasing a user subscription or group subscription with Amazon
 *
 * @param  options
 * @param  options.billingAgreementId  The Amazon billingAgreementId generated on the front end
 * @param  options.user  The user object who is purchasing
 * @param  options.sub  The subscription data to purchase
 * @param  options.coupon  The coupon to discount the sub
 * @param  options.groupId  The id of the group purchasing a subscription
 * @param  options.headers  The request headers to store on analytics
 * @return undefined
 */
api.subscribe = async function subscribe (options) {
  let {
    billingAgreementId,
    sub,
    coupon,
    user,
    groupId,
    headers,
  } = options;

  if (!sub) throw new BadRequest(i18n.t('missingSubscriptionCode'));
  if (!billingAgreementId) throw new BadRequest('Missing req.body.billingAgreementId');

  if (sub.discount) { // apply discount
    if (!coupon) throw new BadRequest(i18n.t('couponCodeRequired'));
    let result = await Coupon.findOne({_id: cc.validate(coupon), event: sub.key}).exec();
    if (!result) throw new NotAuthorized(i18n.t('invalidCoupon'));
  }

  let amount = sub.price;
  let leaderCount = 1;
  let priceOfSingleMember = 3;

  if (groupId) {
    let groupFields = basicGroupFields.concat(' purchased');
    let group = await Group.getGroup({user, groupId, populateLeader: false, groupFields});

    amount = sub.price + (group.memberCount - leaderCount) * priceOfSingleMember;
  }

  await this.setBillingAgreementDetails({
    AmazonBillingAgreementId: billingAgreementId,
    BillingAgreementAttributes: {
      SellerNote: this.constants.SELLER_NOTE_SUBSCRIPTION,
      SellerBillingAgreementAttributes: {
        SellerBillingAgreementId: common.uuid(),
        StoreName: this.constants.STORE_NAME,
        CustomInformation: this.constants.SELLER_NOTE_SUBSCRIPTION,
      },
    },
  });

  await this.confirmBillingAgreement({
    AmazonBillingAgreementId: billingAgreementId,
  });

  await this.authorizeOnBillingAgreement({
    AmazonBillingAgreementId: billingAgreementId,
    AuthorizationReferenceId: common.uuid().substring(0, 32),
    AuthorizationAmount: {
      CurrencyCode: this.constants.CURRENCY_CODE,
      Amount: amount,
    },
    SellerAuthorizationNote: this.constants.SELLER_NOTE_ATHORIZATION_SUBSCRIPTION,
    TransactionTimeout: 0,
    CaptureNow: true,
    SellerNote: this.constants.SELLER_NOTE_ATHORIZATION_SUBSCRIPTION,
    SellerOrderAttributes: {
      SellerOrderId: common.uuid(),
      StoreName: this.constants.STORE_NAME,
    },
  });

  await payments.createSubscription({
    user,
    customerId: billingAgreementId,
    paymentMethod: this.constants.PAYMENT_METHOD,
    sub,
    headers,
    groupId,
  });
};


api.chargeForAdditionalGroupMember = async function chargeForAdditionalGroupMember (group) {
  // @TODO: Can we get this from the content plan?
  let priceForNewMember = 3;

  // @TODO: Prorate?

  return this.authorizeOnBillingAgreement({
    AmazonBillingAgreementId: group.purchased.plan.customerId,
    AuthorizationReferenceId: uuid.v4().substring(0, 32),
    AuthorizationAmount: {
      CurrencyCode: this.constants.CURRENCY_CODE,
      Amount: priceForNewMember,
    },
    SellerAuthorizationNote: this.constants.SELLER_NOTE_GROUP_NEW_MEMBER,
    TransactionTimeout: 0,
    CaptureNow: true,
    SellerNote: this.constants.SELLER_NOTE_GROUP_NEW_MEMBER,
    SellerOrderAttributes: {
      SellerOrderId: uuid.v4(),
      StoreName: this.constants.STORE_NAME,
    },
  });
};

module.exports = api;
