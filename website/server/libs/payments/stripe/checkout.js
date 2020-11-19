import cc from 'coupon-code';
import nconf from 'nconf';

import { getStripeApi } from './api';
import { model as Coupon } from '../../../models/coupon';
import { // eslint-disable-line import/no-cycle
  model as Group,
  basicFields as basicGroupFields,
} from '../../../models/group';
import shared from '../../../../common';
import {
  BadRequest,
} from '../../errors';
import { getOneTimePaymentInfo } from './oneTimePayments'; // eslint-disable-line import/no-cycle

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

const BASE_URL = nconf.get('BASE_URL');

export async function createCheckoutSession (options, stripeInc) {
  const {
    user,
    gift,
    gemsBlock: gemsBlockKey,
    sub,
    groupId,
    headers,
    coupon,
  } = options;

  // @TODO: We need to mock this, but curently we don't have correct
  // Dependency Injection. And the Stripe Api doesn't seem to be a singleton?
  let stripeApi = getStripeApi();
  if (stripeInc) stripeApi = stripeInc;

  if (sub) throw new Error('not implemented'); //TODO

  //TODO
  /* if (sub) {
    const { subId, subResponse } = await buySubscription(
      sub, coupon, email, user, token, groupId, stripeApi,
    );
    subscriptionId = subId;
    response = subResponse;
  } else { */
  const {
    amount,
    gemsBlock,
  } = await getOneTimePaymentInfo(gemsBlockKey, gift, user, stripeApi);
  /* } */

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

  let type = 'gems';
  if (gift) {
    type = gift.type === 'gems' ? 'gift-gems' : 'gift-sub';
  }

  const metadata = {
    type,
    userId: user._id,
    gift: gift ? JSON.stringify(gift) : undefined,
    gemsBlock: gemsBlock ? gemsBlock.key : undefined,
  };

  const session = await stripeApi.checkout.sessions.create({
    payment_method_types: ['card'],
    metadata,
    line_items: [{
      price_data: {
        product_data: {
          name: JSON.stringify(metadata, null, 4), //TODO copy for name (gift, gems, subs)
          //TODO images, description, ...? see api docs
        },
        unit_amount: amount,
        currency: 'usd',
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `http://localhost:8080/redirect/stripe-success-checkout`, //TODO use BASE_URL
    cancel_url: `http://localhost:8080/redirect/stripe-error-checkout`, //TODO use BASE_URL
  });

  return session;
}
