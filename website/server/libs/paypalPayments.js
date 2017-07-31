/* eslint-disable camelcase */
import nconf from 'nconf';
import moment from 'moment';
import _ from 'lodash';
import payments from './payments';
import ipn from 'paypal-ipn';
import paypal from 'paypal-rest-sdk';
import shared from '../../common';
import cc from 'coupon-code';
import Bluebird from 'bluebird';
import { model as Coupon } from '../models/coupon';
import { model as User } from '../models/user';
import {
  model as Group,
  basicFields as basicGroupFields,
} from '../models/group';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from './errors';


const BASE_URL = nconf.get('BASE_URL');
const i18n = shared.i18n;

// This is the plan.id for paypal subscriptions. You have to set up billing plans via their REST sdk (they don't have
// a web interface for billing-plan creation), see ./paypalBillingSetup.js for how. After the billing plan is created
// there, get it's plan.id and store it in config.json
_.each(shared.content.subscriptionBlocks, (block) => {
  block.paypalKey = nconf.get(`PAYPAL:billing_plans:${block.key}`);
});

paypal.configure({
  mode: nconf.get('PAYPAL:mode'), // sandbox or live
  client_id: nconf.get('PAYPAL:client_id'),
  client_secret: nconf.get('PAYPAL:client_secret'),
});

let experienceProfileId = nconf.get('PAYPAL:experience_profile_id');

// TODO better handling of errors
// @TODO: Create constants

let api = {};

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

api.paypalPaymentCreate = Bluebird.promisify(paypal.payment.create, {context: paypal.payment});
api.paypalPaymentExecute = Bluebird.promisify(paypal.payment.execute, {context: paypal.payment});
api.paypalBillingAgreementCreate = Bluebird.promisify(paypal.billingAgreement.create, {context: paypal.billingAgreement});
api.paypalBillingAgreementExecute = Bluebird.promisify(paypal.billingAgreement.execute, {context: paypal.billingAgreement});
api.paypalBillingAgreementGet = Bluebird.promisify(paypal.billingAgreement.get, {context: paypal.billingAgreement});
api.paypalBillingAgreementCancel = Bluebird.promisify(paypal.billingAgreement.cancel, {context: paypal.billingAgreement});

api.ipnVerifyAsync = Bluebird.promisify(ipn.verify, {context: ipn});

api.checkout = async function checkout (options = {}) {
  let {gift, user} = options;

  let amount = 5.00;
  let description = 'Habitica Gems';

  if (gift) {
    const member = await User.findById(gift.uuid).exec();
    gift.member = member;

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
  }


  if (!gift || gift.type === 'gems') {
    const receiver = gift ? gift.member : user;
    const receiverCanGetGems = await receiver.canGetGems();
    if (!receiverCanGetGems) throw new NotAuthorized(shared.i18n.t('groupPolicyCannotGetGems', receiver.preferences.language));
  }


  let createPayment = {
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

  let result = await this.paypalPaymentCreate(createPayment);
  let link = _.find(result.links, { rel: 'approval_url' }).href;
  return link;
};

api.checkoutSuccess = async function checkoutSuccess (options = {}) {
  let {user, gift, paymentId, customerId} = options;

  let method = 'buyGems';
  let data = {
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
  }

  await this.paypalPaymentExecute(paymentId, { payer_id: customerId });
  await payments[method](data);
};

api.subscribe = async function subscribe (options = {}) {
  let {sub, coupon} = options;

  if (sub.discount) {
    if (!coupon) throw new BadRequest(i18n.t('couponCodeRequired'));
    let couponResult = await Coupon.findOne({_id: cc.validate(coupon), event: sub.key}).exec();
    if (!couponResult) throw new NotAuthorized(i18n.t('invalidCoupon'));
  }

  let billingPlanTitle = `Habitica Subscription ($${sub.price} every ${sub.months} months, recurring)`;
  let billingAgreementAttributes = {
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
  let billingAgreement = await this.paypalBillingAgreementCreate(billingAgreementAttributes);

  let link = _.find(billingAgreement.links, { rel: 'approval_url' }).href;
  return link;
};

api.subscribeSuccess = async function subscribeSuccess (options = {}) {
  let {user, groupId, block, headers, token} = options;
  let result = await this.paypalBillingAgreementExecute(token, {});
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
  let {groupId, user, cancellationReason} = options;

  let customerId;
  if (groupId) {
    let groupFields = basicGroupFields.concat(' purchased');
    let group = await Group.getGroup({user, groupId, populateLeader: false, groupFields});

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

  let customer = await this.paypalBillingAgreementGet(customerId);

  // @TODO: Handle error response
  let nextBillingDate = customer.agreement_details.next_billing_date;
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
  await this.ipnVerifyAsync(options);

  let {txn_type, recurring_payment_id} = options;

  let ipnAcceptableTypes = [
    'recurring_payment_profile_cancel',
    'recurring_payment_failed',
    'recurring_payment_expired',
    'subscr_cancel',
    'subscr_failed'];

  if (ipnAcceptableTypes.indexOf(txn_type) === -1) return;
  // @TODO: Should this request billing date?
  let user = await User.findOne({ 'purchased.plan.customerId': recurring_payment_id }).exec();
  if (user) {
    await payments.cancelSubscription({ user, paymentMethod: this.constants.PAYMENT_METHOD });
    return;
  }

  let groupFields = basicGroupFields.concat(' purchased');
  let group = await Group
    .findOne({ 'purchased.plan.customerId': recurring_payment_id })
    .select(groupFields)
    .exec();

  if (group) {
    await payments.cancelSubscription({ groupId: group._id, paymentMethod: this.constants.PAYMENT_METHOD });
  }
};

module.exports = api;
