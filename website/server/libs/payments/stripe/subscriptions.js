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
    //headers,
    groupId,
    subscriptionId,
  });
}
