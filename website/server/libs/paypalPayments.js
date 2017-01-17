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
  authWithUrl,
  authWithSession,
} from '../middlewares/auth';
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

// TODO better handling of errors
// @TODO: Create constants

let api = {};

api.paypalPaymentCreate = Bluebird.promisify(paypal.payment.create, {context: paypal.payment});
api.paypalPaymentExecute = Bluebird.promisify(paypal.payment.execute, {context: paypal.payment});
api.paypalBillingAgreementCreate = Bluebird.promisify(paypal.billingAgreement.create, {context: paypal.billingAgreement});
api.paypalBillingAgreementExecute = Bluebird.promisify(paypal.billingAgreement.execute, {context: paypal.billingAgreement});
api.paypalBillingAgreementGet = Bluebird.promisify(paypal.billingAgreement.get, {context: paypal.billingAgreement});
api.paypalBillingAgreementCancel = Bluebird.promisify(paypal.billingAgreement.cancel, {context: paypal.billingAgreement});

api.ipnVerifyAsync = Bluebird.promisify(ipn.verify, {context: ipn});

api.checkout = async function checkout (options = {}) {
  let {gift} = options;

  let amount = 5.00;
  let description = 'Habitica Gems';
  if (gift) {
    if (gift.type === 'gems') {
      amount = Number(gift.gems.amount / 4).toFixed(2);
      description = `${description} (Gift)`;
    } else {
      amount = Number(shared.content.subscriptionBlocks[gift.subscription.key].price).toFixed(2);
      description = 'mo. Habitica Subscription (Gift)';
    }
  }

  let createPayment = {
    intent: 'sale',
    payer: { payment_method: 'Paypal' },
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

  let result = await this.paypalPaymentCreate(createPayment);
  let link = _.find(result.links, { rel: 'approval_url' }).href;
  return link;
}

api.checkoutSuccess = async function checkoutSuccess (options = {}) {
  let {user, gift, paymentId, customerId} = options;

  let method = 'buyGems';
  let data = {
    user,
    customerId,
    paymentMethod: 'Paypal',
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
      payment_method: 'Paypal',
    },
  };
  let billingAgreement = await this.paypalBillingAgreementCreate(billingAgreementAttributes);

  let link = _.find(billingAgreement.links, { rel: 'approval_url' }).href;
  return link;
};

api.subscribeSuccess = async function () {
  let result = await paypalBillingAgreementExecute(req.query.token, {});
  await payments.createSubscription({
    user,
    groupId,
    customerId: result.id,
    paymentMethod: 'Paypal',
    sub: block,
    headers: req.headers,
  });
};

api.subscribeCancel = async function () {
  let customerId;
  if (groupId) {
    let groupFields = basicGroupFields.concat(' purchased');
    let group = await Group.getGroup({user, groupId, populateLeader: false, groupFields});

    if (!group) {
      throw new NotFound(i18n.t('groupNotFound'));
    }

    if (!group.leader === user._id) {
      throw new NotAuthorized(i18n.t('onlyGroupLeaderCanManageSubscription'));
    }
    customerId = group.purchased.plan.customerId;
  } else {
    customerId = user.purchased.plan.customerId;
  }

  if (!customerId) throw new NotAuthorized(i18n.t('missingSubscription'));

  let customer = await paypalBillingAgreementGet(customerId);

  let nextBillingDate = customer.agreement_details.next_billing_date;
  if (customer.agreement_details.cycles_completed === '0') { // hasn't billed yet
    throw new BadRequest(i18n.t('planNotActive', { nextBillingDate }));
  }

  await paypalBillingAgreementCancel(customerId, { note: i18n.t('cancelingSubscription') });
  await payments.cancelSubscription({
    user,
    groupId,
    paymentMethod: 'Paypal',
    nextBill: nextBillingDate,
  });
};

api.ipn = async function ipn () {
  await ipnVerifyAsync(req.body);

  if (req.body.txn_type !== 'recurring_payment_profile_cancel' && req.body.txn_type !== 'subscr_cancel') return;

  let user = await User.findOne({ 'purchased.plan.customerId': req.body.recurring_payment_id }).exec();
  if (user) {
    await payments.cancelSubscription({ user, paymentMethod: 'Paypal' });
    return;
  }

  let groupFields = basicGroupFields.concat(' purchased');
  let group = await Group
    .findOne({ 'purchased.plan.customerId': req.body.recurring_payment_id })
    .select(groupFields)
    .exec();

  if (group) {
    await payments.cancelSubscription({ groupId: group._id, paymentMethod: 'Paypal' });
  }
};

module.exports = api;
