import nconf from 'nconf';

import { getStripeApi } from './api';
import {
  NotAuthorized,
  NotFound,
} from '../../errors';
import { // eslint-disable-line import/no-cycle
  model as Group,
  basicFields as basicGroupFields,
} from '../../../models/group';
import shared from '../../../../common';
import { getOneTimePaymentInfo } from './oneTimePayments'; // eslint-disable-line import/no-cycle
import { checkSubData } from './subscriptions'; // eslint-disable-line import/no-cycle

const BASE_URL = nconf.get('BASE_URL');

export async function createCheckoutSession (options, stripeInc) {
  const {
    user,
    gift,
    gemsBlock: gemsBlockKey,
    sub,
    groupId,
    coupon,
  } = options;

  console.log(options);

  // @TODO: We need to mock this, but curently we don't have correct
  // Dependency Injection. And the Stripe Api doesn't seem to be a singleton?
  let stripeApi = getStripeApi();
  if (stripeInc) stripeApi = stripeInc;

  let type = 'gems';
  if (gift) {
    type = gift.type === 'gems' ? 'gift-gems' : 'gift-sub';
  } else if (sub) {
    type = 'subscription';
  }

  const metadata = {
    type,
    userId: user._id,
    gift: gift ? JSON.stringify(gift) : undefined,
    sub: sub ? JSON.stringify(sub) : undefined,
  };

  let lineItems;

  if (type === 'subscription') {
    let quantity = 1;

    if (groupId) {
      quantity = sub.quantity;
      const groupFields = basicGroupFields.concat(' purchased');
      const group = await Group.getGroup({
        user, groupId, populateLeader: false, groupFields,
      });
      if (!group) {
        throw new NotFound(shared.i18n.t('groupNotFound'));
      }
      const membersCount = await group.getMemberCount();
      quantity = membersCount + sub.quantity - 1;
      metadata.groupId = groupId;
    }

    await checkSubData(sub, Boolean(groupId), coupon);

    lineItems = [{
      price: sub.key,
      quantity,
      // @TODO proper copy
    }];
  } else {
    const {
      amount,
      gemsBlock,
    } = await getOneTimePaymentInfo(gemsBlockKey, gift, user, stripeApi);

    metadata.gemsBlock = gemsBlock ? gemsBlock.key : undefined;

    lineItems = [{
      price_data: {
        product_data: {
          name: JSON.stringify(metadata, null, 4),
          // @TODO proper copy
        },
        unit_amount: amount,
        currency: 'usd',
      },
      quantity: 1,
    }];
  }

  const session = await stripeApi.checkout.sessions.create({
    payment_method_types: ['card'],
    metadata,
    line_items: lineItems,
    mode: type === 'subscription' ? 'subscription' : 'payment',
    success_url: `${BASE_URL}/redirect/stripe-success-checkout`,
    cancel_url: `${BASE_URL}/redirect/stripe-error-checkout`,
  });

  return session;
}

export async function createEditCardCheckoutSession (options, stripeInc) {
  const {
    user,
    groupId,
  } = options;

  // @TODO: We need to mock this, but curently we don't have correct
  // Dependency Injection. And the Stripe Api doesn't seem to be a singleton?
  let stripeApi = getStripeApi();
  if (stripeInc) stripeApi = stripeInc;

  const type = groupId ? 'edit-card-group' : 'edit-card-user';

  const metadata = {
    type,
    userId: user._id,
  };

  let customerId;
  let subscriptionId;

  if (type === 'edit-card-group') {
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
    metadata.groupId = groupId;
    customerId = group.purchased.plan.customerId;
    subscriptionId = group.purchased.plan.subscriptionId;
  } else {
    customerId = user.purchased.plan.customerId;
    subscriptionId = user.purchased.plan.subscriptionId;
  }

  if (!customerId) throw new NotAuthorized(shared.i18n.t('missingSubscription'));

  if (!subscriptionId) {
    const subscriptions = await stripeApi.subscriptions.list({ customer: customerId });
    subscriptionId = subscriptions.data[0].id;
  }

  if (!subscriptionId) throw new NotAuthorized(shared.i18n.t('missingSubscription'));

  const session = await stripeApi.checkout.sessions.create({
    mode: 'setup',
    payment_method_types: ['card'],
    metadata,
    customer: customerId,
    setup_intent_data: {
      metadata: {
        customer_id: customerId,
        subscription_id: subscriptionId,
      },
    },
    success_url: `${BASE_URL}/redirect/stripe-success-checkout`,
    cancel_url: `${BASE_URL}/redirect/stripe-error-checkout`,
  });

  return session;
}
