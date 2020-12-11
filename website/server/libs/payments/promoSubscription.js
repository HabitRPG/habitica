import { getCurrentEvent } from '../worldState'; // eslint-disable-line import/no-cycle
import createSubscription from './payments'; // eslint-disable-line import/no-cycle

const currentEvent = getCurrentEvent();

export default async function promoSubscription (data) {
  if (currentEvent && currentEvent.promo && currentEvent.promo === 'g1g1') {
    const promoData = {
      user: data.user,
      gift: {
        member: data.user,
        subscription: {
          key: data.gift.subscription.key,
        },
      },
      paymentMethod: data.paymentMethod,
      promo: 'Winter',
      promoUsername: data.gift.member.auth.local.username,
    };
    await createSubscription(promoData);
  }
}
