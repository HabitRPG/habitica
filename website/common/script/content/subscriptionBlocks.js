/* eslint-disable camelcase */
import _ from 'lodash';

let subscriptionBlocks = {
  basic_earned: {
    months: 1,
    price: 5,
  },
  basic_3mo: {
    months: 3,
    price: 15,
  },
  basic_6mo: {
    months: 6,
    price: 30,
  },
  google_6mo: {
    months: 6,
    price: 24,
    discount: true,
    original: 30,
  },
  basic_12mo: {
    months: 12,
    price: 48,
  },
  group_monthly: {
    months: 1,
    price: 9,
    quantity: 3, // Default quantity for Stripe - The same has having 3 user subscriptions
  },
};

_.each(subscriptionBlocks, function createKeys (b, k) {
  return b.key = k;
});

module.exports = subscriptionBlocks;
