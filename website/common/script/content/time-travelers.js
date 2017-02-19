import each from 'lodash/each';
import where from 'lodash/where';
import keys from 'lodash/keys';
import union from 'lodash/union';
import reduce from 'lodash/reduce';

import mysterySets from './mystery-sets';
import gear from './gear';

let mystery = mysterySets;

_.each(mystery, (v, k) => {
  return v.items = _.where(gear.flat, {
    mystery: k,
  });
});

let timeTravelerStore = (user) => {
  let ownedKeys;
  let owned = user.items.gear.owned;
  let unopenedGifts = user.purchased.plan.mysteryItems;
  ownedKeys = _.keys((typeof owned.toObject === 'function' ? owned.toObject() : undefined) || owned);
  ownedKeys = _.union(ownedKeys, unopenedGifts);
  return _.reduce(mystery, (m, v, k) => {
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