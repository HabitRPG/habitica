import each from 'lodash/each';
import filter from 'lodash/filter';
import keys from 'lodash/keys';
import union from 'lodash/union';
import reduce from 'lodash/reduce';
import moment from 'moment';

import mysterySets from './mystery-sets';
import gear from './gear';
import { getScheduleMatchingGroup } from './constants/schedule';

const mystery = mysterySets;

each(mystery, (v, k) => {
  v.items = filter(gear.flat, {
    mystery: k,
  });
  if (v.items.length === 0) delete mystery[k];
});

const timeTravelerStore = (user, date) => {
  const availabilityMatchers = getScheduleMatchingGroup('timeTravelers', date);
  let ownedKeys;
  const { owned } = user.items.gear;
  const { mysteryItems } = user.purchased.plan;
  const unopenedGifts = typeof mysteryItems.toObject === 'function' ? mysteryItems.toObject() : mysteryItems;
  ownedKeys = keys(typeof owned.toObject === 'function' ? owned.toObject() : owned);
  ownedKeys = union(ownedKeys, unopenedGifts);
  return reduce(mystery, (m, v, k) => {
    if (
      k !== 'wondercon'
      && ownedKeys.indexOf(v.items[0].key) === -1
      && (moment(k).isAfter('3000-01-01')
      || availabilityMatchers.match(k))
    ) {
      m[k] = v;
    }
    return m;
  }, {});
};

export default {
  timeTravelerStore,
  mystery,
};
