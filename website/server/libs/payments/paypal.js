/* eslint-disable camelcase */
import nconf from 'nconf';
import moment from 'moment';
import util from 'util';
import _ from 'lodash';
import paypalIpn from 'pp-ipn';
import paypal from 'paypal-rest-sdk';
import cc from 'coupon-code';
import shared from '../../../common';
import payments from './payments'; // eslint-disable-line import/no-cycle
import { getGemsBlock, validateGiftMessage } from './gems'; // eslint-disable-line import/no-cycle
import { model as Coupon } from '../../models/coupon';
import { model as User } from '../../models/user'; // eslint-disable-line import/no-cycle
import { // eslint-disable-line import/no-cycle
  model as Group,
  basicFields as basicGroupFields,
} from '../../models/group';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../errors';

const BASE_URL = nconf.get('BASE_URL');
const PAYPAL_MODE = nconf.get('PAYPAL_MODE');
const { i18n } = shared;

// This is the plan.id for paypal subscriptions.
// You have to set up billing plans via their REST sdk (they don't have
// a web interface for billing-plan creation), see ./paypalBillingSetup.js for how.
// After the billing plan is created
// there, get it's plan.id and store it in config.json
_.each(shared.content.subscriptionBlocks, block => {
  block.paypalKey = nconf.get(`PAYPAL_BILLING_PLANS_${block.key}`);
});

paypal.configure({
  mode: PAYPAL_MODE, // sandbox or live
  client_id: nconf.get('PAYPAL_CLIENT_ID'),
  client_secret: nconf.get('PAYPAL_CLIENT_SECRET'),
});

const experienceProfileId = nconf.get('PAYPAL_EXPERIENCE_PROFILE_ID');

// TODO better handling of errors
// @TODO: Create constants

const api = {};

api.constants = {
  // CURRENCY_CODE: 'USD',
  // SELLER_NOTE: 'Habitica Payment',
  // SELLER_NOTE_SUBSCRIPTION: 'Habitica Subscription',
  // SELLER_NOTE_ATHORIZATION_SUBSCRIPTION: 'Habitica Subscription Payment',
  // STORE_NAME: 'Habitica',
  //
  // GIFT_TYPE_GEMS: 'gems',
  // GIFT_TYPE_SUBSCRIPTION: 'subscription',
  //
  // METHOD_BUY_GEMS: 'buyGems',
  // METHOD_CREATE_SUBSCRIPTION: 'createSubscription',
  PAYMENT_METHOD: 'Paypal',
  // PAYMENT_METHOD_GIFT: 'Amazon Payments (Gift)',
};

api.paypalPaymentCreate = util.promisify(paypal.payment.create.bind(paypal.payment));
api.paypalPaymentExecute = util.promisify(paypal.payment.execute.bind(paypal.payment));
api.paypalBillingAgreementCreate = util
  .promisify(paypal.billingAgreement.create.bind(paypal.billingAgreement));
api.paypalBillingAgreementExecute = util
  .promisify(paypal.billingAgreement.execute.bind(paypal.billingAgreement));
api.paypalBillingAgreementGet = util
  .promisify(paypal.billingAgreement.get.bind(paypal.billingAgreement));
api.paypalBillingAgreementCancel = util
  .promisify(paypal.billingAgreement.cancel.bind(paypal.billingAgreement));

api.ipnVerifyAsync = util.promisify(paypalIpn.verify.bind(paypalIpn));

api.checkout = async function checkout (options = {}) {
  const {
    gift, gemsBlock: gemsBlockKey, sku, user,
  } = options;

  let amount;
  let gemsBlock;
  let description = 'Habitica Gems';

  if (gift) {
    const member = await User.findById(gift.uuid).exec();
    gift.member = member;

    validateGiftMessage(gift, user);

    if (gift.type === 'gems') {
      if (gift.gems.amount <= 0) {
        throw new BadRequest(i18n.t('badAmountOfGemsToPurchase'));
      }
      amount = Number(gift.gems.amount / 4).toFixed(2);
      description = `${description} (Gift)`;
    } else {
      amount = Number(shared.content.subscriptionBlocks[gift.subscription.key].price).toFixed(2);
      description = 'mo. Habitica Subscription (Gift)';
    }
  } else if (sku) {
    if (sku === 'Pet-Gryphatrice-Jubilant') {
      description = 'Jubilant Gryphatrice';
      amount = 9.99;
    }
  } else {
    gemsBlock = getGemsBlock(gemsBlockKey);
    amount = gemsBlock.price / 100;
  }

  if (gemsBlock || (gift && gift.type === 'gems')) {
    const receiver = gift ? gift.member : user;
    const receiverCanGetGems = await receiver.canGetGems();
    if (!receiverCanGetGems) throw new NotAuthorized(shared.i18n.t('groupPolicyCannotGetGems', receiver.preferences.language));
  }

  const createPayment = {
    intent: 'sale',
    payer: { payment_method: this.constants.PAYMENT_METHOD },
    redirect_urls: {
      return_url: `${BASE_URL}/paypal/checkout/success`,
      cancel_url: `${BASE_URL}`,
    },
    transactions: [{
      item_list: {
        items: [{
          name: description,
          // sku: 1,
          price: amount,
          currency: 'USD',
          quantity: 1,
        }],
      },
      amount: {
        currency: 'USD',
        total: amount,
      },
      description,
    }],
  };

  if (experienceProfileId) {
    createPayment.experience_profile_id = experienceProfileId;
  }

  const result = await this.paypalPaymentCreate(createPayment);
  const link = _.find(result.links, { rel: 'approval_url' }).href;
  return link;
};

api.checkoutSuccess = async function checkoutSuccess (options = {}) {
  const {
    user, gift, gemsBlock: gemsBlockKey, paymentId, customerId, sku,
  } = options;

  let method = sku ? 'buySkuItem' : 'buyGems';
  const data = {
    user,
    customerId,
    paymentMethod: this.constants.PAYMENT_METHOD,
  };

  if (gift) {
    gift.member = await User.findById(gift.uuid).exec();
    if (gift.type === 'subscription') {
      method = 'createSubscription';
    }

    data.paymentMethod = 'PayPal (Gift)';
    data.gift = gift;
  } else if (sku) {
    data.sku = sku;
  } else {
    data.gemsBlock = getGemsBlock(gemsBlockKey);
  }

  await this.paypalPaymentExecute(paymentId, { payer_id: customerId });
  await payments[method](data);
};

api.subscribe = async function subscribe (options = {}) {
  const { sub, coupon } = options;

  if (sub.discount) {
    if (!coupon) throw new BadRequest(i18n.t('couponCodeRequired'));
    const couponResult = await Coupon.findOne({ _id: cc.validate(coupon), event: sub.key }).exec();
    if (!couponResult) throw new NotAuthorized(i18n.t('invalidCoupon'));
  }

  const billingPlanTitle = `Habitica Subscription ($${sub.price} every ${sub.months} months, recurring)`;
  const billingAgreementAttributes = {
    name: billingPlanTitle,
    description: billingPlanTitle,
    start_date: moment().add({ minutes: 5 }).format(),
    plan: {
      id: sub.paypalKey,
    },
    payer: {
      payment_method: this.constants.PAYMENT_METHOD,
    },
  };
  const billingAgreement = await this.paypalBillingAgreementCreate(billingAgreementAttributes);

  const link = _.find(billingAgreement.links, { rel: 'approval_url' }).href;
  return link;
};

api.subscribeSuccess = async function subscribeSuccess (options = {}) {
  const {
    user, groupId, block, headers, token,
  } = options;
  const result = await this.paypalBillingAgreementExecute(token, {});
  await payments.createSubscription({
    user,
    groupId,
    customerId: result.id,
    paymentMethod: this.constants.PAYMENT_METHOD,
    sub: block,
    headers,
  });
};

/**
 * Cancel a PayPal Subscription
 *
 * @param  options
 * @param  options.user  The user object who is canceling
 * @param  options.groupId  The id of the group that is canceling
 * @param  options.cancellationReason  A text string to control sending an email
 *
 * @return undefined
 */
api.subscribeCancel = async function subscribeCancel (options = {}) {
  const { groupId, user, cancellationReason } = options;

  let customerId;
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
    customerId = group.purchased.plan.customerId;
  } else {
    customerId = user.purchased.plan.customerId;
  }

  if (!customerId) throw new NotAuthorized(i18n.t('missingSubscription'));

  const customer = await this.paypalBillingAgreementGet(customerId);

  // @TODO: Handle error response
  const nextBillingDate = customer.agreement_details.next_billing_date;
  if (customer.agreement_details.cycles_completed === '0') { // hasn't billed yet
    throw new BadRequest(i18n.t('planNotActive', { nextBillingDate }));
  }

  await this.paypalBillingAgreementCancel(customerId, { note: i18n.t('cancelingSubscription') });
  await payments.cancelSubscription({
    user,
    groupId,
    paymentMethod: this.constants.PAYMENT_METHOD,
    nextBill: nextBillingDate,
    cancellationReason,
  });
};

api.ipn = async function ipnApi (options = {}) {
  await this.ipnVerifyAsync(options, {
    allow_sandbox: PAYPAL_MODE === 'sandbox',
  });

  const { txn_type, recurring_payment_id } = options;

  const ipnAcceptableTypes = [
    'recurring_payment_profile_cancel',
    'recurring_payment_failed',
    'recurring_payment_expired',
    'subscr_cancel',
    'subscr_failed',
  ];

  if (ipnAcceptableTypes.indexOf(txn_type) === -1) return;

  // @TODO: Should this request billing date?
  const user = await User.findOne({ 'purchased.plan.customerId': recurring_payment_id }).exec();
  if (user) {
    // If the user has already cancelled the subscription, return
    // Otherwise the subscription would be cancelled twice
    // resulting in the loss of subscription credits
    if (user.hasCancelled()) return;

    await payments.cancelSubscription({ user, paymentMethod: this.constants.PAYMENT_METHOD });
    return;
  }

  const groupFields = basicGroupFields.concat(' purchased');
  const group = await Group
    .findOne({ 'purchased.plan.customerId': recurring_payment_id })
    .select(groupFields)
    .exec();

  if (group) {
    // If the group subscription has already been cancelled the subscription, return
    // Otherwise the subscription would be cancelled
    // twice resulting in the loss of subscription credits
    if (group.hasCancelled()) return;

    await payments.cancelSubscription({
      groupId: group._id,
      paymentMethod: this.constants.PAYMENT_METHOD,
    });
  }
};

export default api;
