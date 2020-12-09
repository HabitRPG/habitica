import cc from 'coupon-code';
import moment from 'moment';

import logger from '../../logger';
import { model as Coupon } from '../../../models/coupon';
import shared from '../../../../common';
import payments from '../payments'; // eslint-disable-line import/no-cycle
import stripeConstants from './constants';
import { model as User } from '../../../models/user'; // eslint-disable-line import/no-cycle
import { getStripeApi } from './api';
import { // eslint-disable-line import/no-cycle
  model as Group,
  basicFields as basicGroupFields,
} from '../../../models/group';
import {
  NotAuthorized,
  BadRequest,
  NotFound,
} from '../../errors';

export async function checkSubData (sub, isGroup = false, coupon) {
  if (!sub || !sub.canSubscribe) throw new BadRequest(shared.i18n.t('missingSubscriptionCode'));
  if (
    (sub.target === 'group' && !isGroup)
    || (sub.target === 'user' && isGroup)
  ) throw new BadRequest(shared.i18n.t('missingSubscriptionCode'));

  if (sub.discount) {
    if (!coupon) throw new BadRequest(shared.i18n.t('couponCodeRequired'));
    coupon = await Coupon // eslint-disable-line no-param-reassign
      .findOne({ _id: cc.validate(coupon), event: sub.key }).exec();
    if (!coupon) throw new BadRequest(shared.i18n.t('invalidCoupon'));
  }
}

export async function applySubscription (session) {
  const { metadata, customer: customerId, subscription: subscriptionId } = session;
  const { sub: subStringified, userId, groupId } = metadata;

  const sub = subStringified ? JSON.parse(subStringified) : undefined;

  const user = await User.findById(metadata.userId).exec();
  if (!user) throw new NotFound(shared.i18n.t('userWithIDNotFound', { userId }));

  await payments.createSubscription({
    user,
    customerId,
    paymentMethod: stripeConstants.PAYMENT_METHOD,
    sub,
    groupId,
    subscriptionId,
  });
}

export async function handlePaymentMethodChange (session, stripeInc) {
  // @TODO: We need to mock this, but curently we don't have correct
  // Dependency Injection. And the Stripe Api doesn't seem to be a singleton?
  let stripeApi = getStripeApi();
  if (stripeInc) stripeApi = stripeInc;

  const { setup_intent: setupIntent } = session;

  const intent = await stripeApi.setupIntents.retrieve(setupIntent);
  const { payment_method: paymentMethodId } = intent;
  const subscriptionId = intent.metadata.subscription_id;

  // Update the payment method on the subscription
  await stripeApi.subscriptions.update(subscriptionId, {
    default_payment_method: paymentMethodId,
  });
}

export async function chargeForAdditionalGroupMember (group, stripeInc) {
  // @TODO: We need to mock this, but curently we don't have correct
  // Dependency Injection. And the Stripe Api doesn't seem to be a singleton?
  let stripeApi = getStripeApi();
  if (stripeInc) stripeApi = stripeInc;

  const plan = shared.content.subscriptionBlocks.group_monthly;

  await stripeApi.subscriptions.update(
    group.purchased.plan.subscriptionId,
    {
      plan: plan.key,
      quantity: group.memberCount + plan.quantity - 1,
    },
  );

  group.purchased.plan.quantity = group.memberCount + plan.quantity - 1;
}

export async function cancelSubscription (options, stripeInc) {
  const { groupId, user, cancellationReason } = options;
  let customerId;

  // @TODO: We need to mock this, but curently we don't have correct
  // Dependency Injection. And the Stripe Api doesn't seem to be a singleton?
  let stripeApi = getStripeApi();
  if (stripeInc) stripeApi = stripeInc;

  if (groupId) {
    const groupFields = basicGroupFields.concat(' purchased');
    const group = await Group.getGroup({
      user, groupId, populateLeader: false, groupFields,
    });

    if (!group) {
      throw new NotFound(shared.i18n.t('groupNotFound'));
    }

    const allowedManagers = [group.leader, group.purchased.plan.owner];

    if (allowedManagers.indexOf(user._id) === -1) {
      throw new NotAuthorized(shared.i18n.t('onlyGroupLeaderCanManageSubscription'));
    }
    customerId = group.purchased.plan.customerId;
  } else {
    customerId = user.purchased.plan.customerId;
  }

  if (!customerId) throw new NotAuthorized(shared.i18n.t('missingSubscription'));

  const customer = await stripeApi
    .customers.retrieve(customerId, { expand: ['subscriptions'] })
    .catch(err => logger.error(err, 'Error retrieving customer from Stripe (was likely deleted).'));
  let nextBill = moment().add(30, 'days').unix() * 1000;

  if (customer && (customer.subscription || customer.subscriptions)) {
    let { subscription } = customer;
    if (!subscription && customer.subscriptions) {
      [subscription] = customer.subscriptions.data;
    }
    await stripeApi.customers.del(customerId);

    if (subscription && subscription.current_period_end) {
      nextBill = subscription.current_period_end * 1000; // timestamp in seconds
    }
  }

  await payments.cancelSubscription({
    user,
    groupId,
    nextBill,
    paymentMethod: this.constants.PAYMENT_METHOD,
    cancellationReason,
  });
}
