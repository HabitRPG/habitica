import cc from 'coupon-code';
import nconf from 'nconf';

import { getStripeApi } from './api';
import { model as User } from '../../../models/user'; // eslint-disable-line import/no-cycle
import { model as Coupon } from '../../../models/coupon';
import { // eslint-disable-line import/no-cycle
  model as Group,
  basicFields as basicGroupFields,
} from '../../../models/group';
import shared from '../../../../common';
import {
  BadRequest,
  NotAuthorized,
} from '../../errors';
import payments from '../payments'; // eslint-disable-line import/no-cycle
import { getGemsBlock } from '../gems'; // eslint-disable-line import/no-cycle
import stripeConstants from './constants';

function getGiftAmount (gift) {//TODO
  if (gift.type === 'subscription') {
    return `${shared.content.subscriptionBlocks[gift.subscription.key].price * 100}`;
  }

  if (gift.gems.amount <= 0) {
    throw new BadRequest(shared.i18n.t('badAmountOfGemsToPurchase'));
  }

  return `${(gift.gems.amount / 4) * 100}`;
}

async function buyGems (gemsBlock, gift, user, token, stripeApi) {//TODO
  let amount;

  if (gift) {
    amount = getGiftAmount(gift);
  } else {
    amount = gemsBlock.price;
  }

  if (!gift || gift.type === 'gems') {
    const receiver = gift ? gift.member : user;
    const receiverCanGetGems = await receiver.canGetGems();
    if (!receiverCanGetGems) throw new NotAuthorized(shared.i18n.t('groupPolicyCannotGetGems', receiver.preferences.language));
  }

  const response = await stripeApi.charges.create({
    amount,
    currency: 'usd',
    card: token,
  });

  return response;
}

async function buySubscription (sub, coupon, email, user, token, groupId, stripeApi) {//TODO
  if (sub.discount) {
    if (!coupon) throw new BadRequest(shared.i18n.t('couponCodeRequired'));
    coupon = await Coupon // eslint-disable-line no-param-reassign
      .findOne({ _id: cc.validate(coupon), event: sub.key }).exec();
    if (!coupon) throw new BadRequest(shared.i18n.t('invalidCoupon'));
  }

  const customerObject = {
    email,
    metadata: { uuid: user._id },
    card: token,
    plan: sub.key,
  };

  if (groupId) {
    customerObject.quantity = sub.quantity;
    const groupFields = basicGroupFields.concat(' purchased');
    const group = await Group.getGroup({
      user, groupId, populateLeader: false, groupFields,
    });
    const membersCount = await group.getMemberCount();
    customerObject.quantity = membersCount + sub.quantity - 1;
  }

  const response = await stripeApi.customers.create(customerObject);

  let subscriptionId;
  if (groupId) subscriptionId = response.subscriptions.data[0].id;

  return { subResponse: response, subId: subscriptionId };
}

async function applyGemPayment (user, response, gemsBlock, gift) {//TODO
  let method = 'buyGems';
  const data = {
    user,
    customerId: response.id,
    paymentMethod: stripeConstants.PAYMENT_METHOD,
    gemsBlock,
    gift,
  };

  if (gift) {
    if (gift.type === 'subscription') method = 'createSubscription';
    data.paymentMethod = 'Gift';
  }

  await payments[method](data);
}

const BASE_URL = nconf.get('BASE_URL');

export async function createCheckoutSession (options, stripeInc) {
  const {
    user,
    gift,
    gemsBlock,
    sub,
    groupId,
    headers,
    coupon,
  } = options;

  // @TODO: We need to mock this, but curently we don't have correct
  // Dependency Injection. And the Stripe Api doesn't seem to be a singleton?
  let stripeApi = getStripeApi();
  if (stripeInc) stripeApi = stripeInc;

  if (gift) { //TODO
    const member = await User.findById(gift.uuid).exec();
    gift.member = member;
    throw new Error('not implemented');
  }

  if (sub) throw new Error('not implemented'); //TODO

  let block;
  if (!sub && !gift) {
    block = getGemsBlock(gemsBlock);
  }

  //TODO
  /* if (sub) {
    const { subId, subResponse } = await buySubscription(
      sub, coupon, email, user, token, groupId, stripeApi,
    );
    subscriptionId = subId;
    response = subResponse;
  } else {
    response = await buyGems(block, gift, user, token, stripeApi);
  } */

  /* if (sub) {
    await payments.createSubscription({
      user,
      customerId: response.id,
      paymentMethod: this.constants.PAYMENT_METHOD,
      sub,
      headers,
      groupId,
      subscriptionId,
    });
  } else {
    await applyGemPayment(user, response, block, gift);
  } */

  const session = await stripeApi.checkout.sessions.create({
    payment_method_types: ['card'],
    metadata: {
      type: 'gems',
      block: block.key,
    },
    line_items: [{
      price_data: {
        product_data: {
          name: block.key,
          metadata: {
            type: 'gems',
            block: block.key,
          },
          //TODO images, description, ...? see api docs
        },
        unit_amount: block.price,
        currency: 'usd',
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${BASE_URL}/redirect/stripe-success-checkout`,
    cancel_url: `${BASE_URL}/redirect/stripe-error-checkout`,
  });

  return session;
}

export async function checkout (options, stripeInc) { //TODO
  const {
    token,
    user,
    gift,
    gemsBlock,
    sub,
    groupId,
    email,
    headers,
    coupon,
  } = options;
  let response;
  let subscriptionId;

  // @TODO: We need to mock this, but curently we don't have correct
  // Dependency Injection. And the Stripe Api doesn't seem to be a singleton?
  let stripeApi = getStripeApi();
  if (stripeInc) stripeApi = stripeInc;

  if (!token) throw new BadRequest('Missing req.body.id');

  if (gift) {
    const member = await User.findById(gift.uuid).exec();
    gift.member = member;
  }

  let block;
  if (!sub && !gift) {
    block = getGemsBlock(gemsBlock);
  }

  if (sub) {
    const { subId, subResponse } = await buySubscription(
      sub, coupon, email, user, token, groupId, stripeApi,
    );
    subscriptionId = subId;
    response = subResponse;
  } else {
    response = await buyGems(block, gift, user, token, stripeApi);
  }

  if (sub) {
    await payments.createSubscription({
      user,
      customerId: response.id,
      paymentMethod: this.constants.PAYMENT_METHOD,
      sub,
      headers,
      groupId,
      subscriptionId,
    });
  } else {
    await applyGemPayment(user, response, block, gift);
  }
}
