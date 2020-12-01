import cc from 'coupon-code';
import { model as Coupon } from '../../../models/coupon';
import shared from '../../../../common';
import {
  BadRequest,
  NotFound,
} from '../../errors';
import payments from '../payments'; // eslint-disable-line import/no-cycle
import stripeConstants from './constants';
import { model as User } from '../../../models/user'; // eslint-disable-line import/no-cycle
import { getStripeApi } from './api';

export async function checkSubData (sub, coupon) {
  if (!sub.canSubscribe) throw new BadRequest(shared.i18n.t('missingSubscriptionCode'));

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

  const { metadata, setup_intent: setupIntent } = session;
  //TODO check if sub is still active?
  const { userId, groupId } = metadata;

  const intent = await stripeApi.setupIntents.retrieve(setupIntent);
  const { customer: customerId, payment_method: paymentMethodId } = intent;
  const subscriptionId = intent.metadata.subscription_id;

  // Update the payment method on the subscription
  await stripeApi.subscriptions.update(subscriptionId, {
    default_payment_method: paymentMethodId,
  });
}
