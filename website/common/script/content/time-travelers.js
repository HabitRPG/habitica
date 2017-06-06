import each from 'lodash/each';
import filter from 'lodash/filter';
import keys from 'lodash/keys';
import union from 'lodash/union';
import reduce from 'lodash/reduce';

import mysterySets from './mystery-sets';
import gear from './gear';

let mystery = mysterySets;

each(mystery, (v, k) => {
  return v.items = filter(gear.flat, {
    mystery: k,
  });
});

let timeTravelerStore = (user) => {
  let ownedKeys;
  let owned = user.items.gear.owned;
  let mysteryItems = user.purchased.plan.mysteryItems;
  let unopenedGifts = typeof mysteryItems.toObject === 'function' ? mysteryItems.toObject() : mysteryItems;
  ownedKeys = keys(typeof owned.toObject === 'function' ? owned.toObject() : owned);
  ownedKeys = union(ownedKeys, unopenedGifts);
  return reduce(mystery, (m, v, k) => {
    if (k === 'wondercon' || ownedKeys.indexOf(v.items[0].key) !== -1) {
      return m;
    }
    m[k] = v;
    return m;
  }, {});
};

module.exports = {
  timeTravelerStore,
  mystery,
};