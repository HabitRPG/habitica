import amazonPayments from 'amazon-payments';
import nconf from 'nconf';
import moment from 'moment';
import cc from 'coupon-code';
import util from 'util';

import common from '../../../common';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../errors';
import payments from './payments'; // eslint-disable-line import/no-cycle
import { model as User } from '../../models/user'; // eslint-disable-line import/no-cycle
import { // eslint-disable-line import/no-cycle
  model as Group,
  basicFields as basicGroupFields,
} from '../../models/group';
import { model as Coupon } from '../../models/coupon';
import { getGemsBlock, validateGiftMessage } from './gems'; // eslint-disable-line import/no-cycle

// TODO better handling of errors

const { i18n } = common;
const IS_SANDBOX = nconf.get('AMAZON_PAYMENTS_MODE') === 'sandbox';

const amzPayment = amazonPayments.connect({
  environment: amazonPayments.Environment[IS_SANDBOX ? 'Sandbox' : 'Production'],
  sellerId: nconf.get('AMAZON_PAYMENTS_SELLER_ID'),
  mwsAccessKey: nconf.get('AMAZON_PAYMENTS_MWS_KEY'),
  mwsSecretKey: nconf.get('AMAZON_PAYMENTS_MWS_SECRET'),
  clientId: nconf.get('AMAZON_PAYMENTS_CLIENT_ID'),
});

const api = {};

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
  METHOD_BUY_SKU_ITEM: 'buySkuItem',
  METHOD_CREATE_SUBSCRIPTION: 'createSubscription',
  PAYMENT_METHOD: 'Amazon Payments',
  PAYMENT_METHOD_GIFT: 'Amazon Payments (Gift)',
};

api.getTokenInfo = util.promisify(amzPayment.api.getTokenInfo).bind(amzPayment.api);
api.createOrderReferenceId = util
  .promisify(amzPayment.offAmazonPayments.createOrderReferenceForId)
  .bind(amzPayment.offAmazonPayments);
api.setOrderReferenceDetails = util
  .promisify(amzPayment.offAmazonPayments.setOrderReferenceDetails)
  .bind(amzPayment.offAmazonPayments);
api.confirmOrderReference = util
  .promisify(amzPayment.offAmazonPayments.confirmOrderReference)
  .bind(amzPayment.offAmazonPayments);
api.closeOrderReference = util
  .promisify(amzPayment.offAmazonPayments.closeOrderReference)
  .bind(amzPayment.offAmazonPayments);
api.setBillingAgreementDetails = util
  .promisify(amzPayment.offAmazonPayments.setBillingAgreementDetails)
  .bind(amzPayment.offAmazonPayments);
api.getBillingAgreementDetails = util
  .promisify(amzPayment.offAmazonPayments.getBillingAgreementDetails)
  .bind(amzPayment.offAmazonPayments);
api.confirmBillingAgreement = util
  .promisify(amzPayment.offAmazonPayments.confirmBillingAgreement)
  .bind(amzPayment.offAmazonPayments);
api.closeBillingAgreement = util
  .promisify(amzPayment.offAmazonPayments.closeBillingAgreement)
  .bind(amzPayment.offAmazonPayments);

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
  const {
    gift, user, orderReferenceId, headers, gemsBlock: gemsBlockKey, sku,
  } = options;
  let amount;
  let gemsBlock;

  if (gift) {
    gift.member = await User.findById(gift.uuid).exec();
    validateGiftMessage(gift, user);

    if (gift.type === this.constants.GIFT_TYPE_GEMS) {
      if (gift.gems.amount <= 0) {
        throw new BadRequest(i18n.t('badAmountOfGemsToPurchase'));
      }
      amount = gift.gems.amount / 4;
    } else if (gift.type === this.constants.GIFT_TYPE_SUBSCRIPTION) {
      amount = common.content.subscriptionBlocks[gift.subscription.key].price;
    }
  } else if (sku) {
    if (sku === 'Pet-Gryphatrice-Jubilant') {
      amount = 9.99;
    } else {
      throw new NotFound('SKU not found.');
    }
  } else {
    gemsBlock = getGemsBlock(gemsBlockKey);
    amount = gemsBlock.price / 100;
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
  if (sku) {
    method = this.constants.METHOD_BUY_SKU_ITEM;
  }

  const data = {
    user,
    paymentMethod: this.constants.PAYMENT_METHOD,
    headers,
    gemsBlock,
    sku,
  };

  if (gift) {
    if (gift.type === this.constants.GIFT_TYPE_SUBSCRIPTION) {
      method = this.constants.METHOD_CREATE_SUBSCRIPTION;
    }
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
  const {
    user, groupId, headers, cancellationReason,
  } = options;

  let billingAgreementId;
  let planId;
  let lastBillingDate;

  if (groupId) {
    const groupFields = basicGroupFields.concat(' purchased');
    const group = await Group.getGroup({
      user, groupId, populateLeader: false, groupFields,
    });

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

  const details = await this.getBillingAgreementDetails({
    AmazonBillingAgreementId: billingAgreementId,
  }).catch(err => err);

  const badBAStates = ['Canceled', 'Closed', 'Suspended'];
  if (
    details
    && details.BillingAgreementDetails
    && details.BillingAgreementDetails.BillingAgreementStatus
    && badBAStates.indexOf(details.BillingAgreementDetails.BillingAgreementStatus.State) === -1
  ) {
    await this.closeBillingAgreement({
      AmazonBillingAgreementId: billingAgreementId,
    });
  }

  const subscriptionBlock = common.content.subscriptionBlocks[planId];
  const subscriptionLength = subscriptionBlock.months * 30;

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
  const {
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
    const result = await Coupon.findOne({ _id: cc.validate(coupon), event: sub.key }).exec();
    if (!result) throw new NotAuthorized(i18n.t('invalidCoupon'));
  }

  let amount = sub.price;
  const leaderCount = 1;
  const priceOfSingleMember = 3;

  if (groupId) {
    const groupFields = basicGroupFields.concat(' purchased');
    const group = await Group.getGroup({
      user, groupId, populateLeader: false, groupFields,
    });
    const membersCount = await group.getMemberCount();
    amount = sub.price + (membersCount - leaderCount) * priceOfSingleMember;
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
  const priceForNewMember = 3;

  // @TODO: Prorate?

  return this.authorizeOnBillingAgreement({
    AmazonBillingAgreementId: group.purchased.plan.customerId,
    AuthorizationReferenceId: common.uuid().substring(0, 32),
    AuthorizationAmount: {
      CurrencyCode: this.constants.CURRENCY_CODE,
      Amount: priceForNewMember,
    },
    SellerAuthorizationNote: this.constants.SELLER_NOTE_GROUP_NEW_MEMBER,
    TransactionTimeout: 0,
    CaptureNow: true,
    SellerNote: this.constants.SELLER_NOTE_GROUP_NEW_MEMBER,
    SellerOrderAttributes: {
      SellerOrderId: common.uuid(),
      StoreName: this.constants.STORE_NAME,
    },
  });
};

export default api;
