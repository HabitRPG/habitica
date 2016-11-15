import _ from 'lodash';

let subscriptionBlocks = {
  basic_earned: { // eslint-disable-line camelcase
    months: 1,
    price: 5,
  },
  basic_3mo: { // eslint-disable-line camelcase
    months: 3,
    price: 15,
  },
  basic_6mo: { // eslint-disable-line camelcase
    months: 6,
    price: 30,
  },
  google_6mo: { // eslint-disable-line camelcase
    months: 6,
    price: 24,
    discount: true,
    original: 30,
  },
  basic_12mo: { // eslint-disable-line camelcase
    months: 12,
    price: 48,
  },
  group_monthly: { // eslint-disable-line camelcase
    months: 1,
    price: 8,
  },
};

_.each(subscriptionBlocks, function createKeys (b, k) {
  return b.key = k;
});

module.exports = subscriptionBlocks;
