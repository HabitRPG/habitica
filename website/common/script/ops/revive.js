import content from '../content/index';
import i18n from '../i18n';
import merge from 'lodash/merge';
import reduce from 'lodash/reduce';
import each from 'lodash/each';
import {
  NotAuthorized,
} from '../libs/errors';
import randomVal from '../libs/randomVal';
import predictableRandom from '../fns/predictableRandom';

import { removePinnedGearByClass, addPinnedGearByClass, addPinnedGear } from './pinnedGearUtils';
import getItemInfo from '../libs/getItemInfo';

module.exports = function revive (user, req = {}, analytics) {
  if (user.stats.hp > 0) {
    throw new NotAuthorized(i18n.t('cannotRevive', req.language));
  }

  merge(user.stats, {
    hp: 50,
    exp: 0,
    gp: 0,
  });

  if (user.stats.lvl > 1) {
    user.stats.lvl--;
  }

  let lostStat = randomVal(reduce(['str', 'con', 'per', 'int'], function findRandomStat (m, k) {
    if (user.stats[k]) {
      m[k] = k;
    }
    return m;
  }, {}), {
    predictableRandom: predictableRandom(user),
  });

  if (lostStat) {
    user.stats[lostStat]--;
  }

  let base = user.items.gear.owned;
  let gearOwned;

  if (typeof base.toObject === 'function') {
    gearOwned = base.toObject();
  } else {
    gearOwned = user.items.gear.owned;
  }

  let losableItems = {};
  let userClass = user.stats.class;

  each(gearOwned, function findLosableItems (value, key) {
    let itm;
    if (value) {
      itm = content.gear.flat[key];

      if (itm) {
        let itemHasValueOrWarrior0 = itm.value > 0 || key === 'weapon_warrior_0';

        let itemClassEqualsUserClass = itm.klass === userClass;

        let itemClassSpecial = itm.klass === 'special';
        let itemNotSpecialOrUserClassIsSpecial = !itm.specialClass || itm.specialClass === userClass;
        let itemIsSpecial = itemNotSpecialOrUserClassIsSpecial  &&  itemClassSpecial;

        let itemIsArmoire = itm.klass === 'armoire';

        if (itemHasValueOrWarrior0 && (itemClassEqualsUserClass || itemIsSpecial || itemIsArmoire)) {
          losableItems[key] = key;
          return losableItems[key];
        }
      }
    }
  });

  let lostItem = randomVal(losableItems, {
    predictableRandom: predictableRandom(user),
  });

  let message = '';
  let item = content.gear.flat[lostItem];

  if (item) {
    removePinnedGearByClass(user);

    user.items.gear.owned[lostItem] = false;

    addPinnedGearByClass(user);

    let itemInfo = getItemInfo(user, 'marketGear', item);
    addPinnedGear(user, itemInfo.pinType, itemInfo.path);

    if (user.items.gear.equipped[item.type] === lostItem) {
      user.items.gear.equipped[item.type] =  `${item.type}_base_0`;
    }

    if (user.items.gear.costume[item.type] === lostItem) {
      user.items.gear.costume[item.type] = `${item.type}_base_0`;
    }

    message = i18n.t('messageLostItem', { itemText: item.text(req.language)}, req.language);
  }

  if (analytics) {
    analytics.track('Death', {
      uuid: user._id,
      lostItem,
      gaLabel: lostItem,
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [
    user.items,
    message,
  ];
};
