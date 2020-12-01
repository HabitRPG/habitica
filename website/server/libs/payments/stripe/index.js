import moment from 'moment';

import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../errors';
import payments from '../payments'; // eslint-disable-line import/no-cycle
import { // eslint-disable-line import/no-cycle
  model as Group,
  basicFields as basicGroupFields,
} from '../../../models/group';
import shared from '../../../../common';
import stripeConstants from './constants';
import { handleWebhooks } from './webhooks'; // eslint-disable-line import/no-cycle
import { // eslint-disable-line import/no-cycle
  checkout,
  createCheckoutSession,
  createEditCardCheckoutSession,
} from './checkout';
import { getStripeApi, setStripeApi } from './api';

const { i18n } = shared;

const api = {};

api.constants = { ...stripeConstants };

api.setStripeApi = setStripeApi;

api.createCheckoutSession = createCheckoutSession; //TODO apidocs
api.createEditCardCheckoutSession = createEditCardCheckoutSession; //TODO apidocs

/**
 * Allows for purchasing a user subscription, group subscription or gems with Stripe
 *
 * @param  options
 * @param  options.token  The stripe token generated on the front end
 * @param  options.user  The user object who is purchasing
 * @param  options.gift  The gift details if any
 * @param  options.sub  The subscription data to purchase
 * @param  options.groupId  The id of the group purchasing a subscription
 * @param  options.email  The email enter by the user on the Stripe form
 * @param  options.headers  The request headers to store on analytics
 * @return undefined
 */
api.checkout = checkout;

/**
 * Edits a subscription created by Stripe
 *
 * @param  options
 * @param  options.token  The stripe token generated on the front end
 * @param  options.user  The user object who is purchasing
 * @param  options.groupId  The id of the group purchasing a subscription
 *
 * @return undefined
 */
api.editSubscription = async function editSubscription (options, stripeInc) {//TODO
  const { token, groupId, user } = options;
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
      throw new NotFound(i18n.t('groupNotFound'));
    }

    const allowedManagers = [group.leader, group.purchased.plan.owner];

    if (allowedManagers.indexOf(user._id) === -1) {
      throw new NotAuthorized(i18n.t('onlyGroupLeaderCanManageSubscription'));
    }
    customerId = group.purchased.plan.customerId;
  } else {
    customerId = user.purchased.plan.customerId;
  }

  if (!customerId) throw new NotAuthorized(i18n.t('missingSubscription'));
  if (!token) throw new BadRequest('Missing req.body.id');

  // @TODO: Handle Stripe Error response
  const subscriptions = await stripeApi.subscriptions.list({ customer: customerId });
  const subscriptionId = subscriptions.data[0].id;
  await stripeApi.subscriptions.update(subscriptionId, { card: token });
};

/**
 * Cancels a subscription created by Stripe
 *
 * @param  options
 * @param  options.user  The user object who is purchasing
 * @param  options.groupId  The id of the group purchasing a subscription
 * @param  options.cancellationReason  A text string to control sending an email
 *
 * @return undefined
 */
api.cancelSubscription = async function cancelSubscription (options, stripeInc) {//TODO
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
      throw new NotFound(i18n.t('groupNotFound'));
    }

    const allowedManagers = [group.leader, group.purchased.plan.owner];

    if (allowedManagers.indexOf(user._id) === -1) {
      throw new NotAuthorized(i18n.t('onlyGroupLeaderCanManageSubscription'));
    }
    customerId = group.purchased.plan.customerId;
  } else {
    customerId = user.purchased.plan.customerId;
  }

  if (!customerId) throw new NotAuthorized(i18n.t('missingSubscription'));

  // @TODO: Handle error response
  const customer = await stripeApi
    .customers.retrieve(customerId, { expand: ['subscriptions'] })
    .catch(err => err);
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
};

api.chargeForAdditionalGroupMember = async function chargeForAdditionalGroupMember (group) {//TODO
  const stripeApi = getStripeApi();
  const plan = shared.content.subscriptionBlocks.group_monthly;

  await stripeApi.subscriptions.update(
    group.purchased.plan.subscriptionId,
    {
      plan: plan.key,
      quantity: group.memberCount + plan.quantity - 1,
    },
  );

  group.purchased.plan.quantity = group.memberCount + plan.quantity - 1;
};

/**
 * Handle webhooks from stripes
 *
 * @param  options
 * @param  options.user  The user object who is purchasing
 * @param  options.groupId  The id of the group purchasing a subscription
 *
 * @return undefined
 */
api.handleWebhooks = handleWebhooks;

export default api;
