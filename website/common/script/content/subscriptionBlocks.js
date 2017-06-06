/* eslint-disable camelcase */
import each from 'lodash/each';

let subscriptionBlocks = {
  basic_earned: {
    target: 'user',
    canSubscribe: true,
    months: 1,
    price: 5,
  },
  basic_3mo: {
    target: 'user',
    canSubscribe: true,
    months: 3,
    price: 15,
  },
  basic_6mo: {
    target: 'user',
    canSubscribe: true,
    months: 6,
    price: 30,
  },
  google_6mo: {
    target: 'user',
    canSubscribe: true,
    months: 6,
    price: 24,
    discount: true,
    original: 30,
  },
  basic_12mo: {
    target: 'user',
    canSubscribe: true,
    months: 12,
    price: 48,
  },
  group_monthly: {
    target: 'group',
    canSubscribe: true,
    months: 1,
    price: 9,
    quantity: 3, // Default quantity for Stripe - The same as having 3 user subscriptions
  },
  group_plan_auto: {
    target: 'user',
    canSubscribe: false,
    months: 0,
    price: 0,
    quantity: 1,
  },
};

each(subscriptionBlocks, function createKeys (b, k) {
  return b.key = k;
});

module.exports = subscriptionBlocks;
