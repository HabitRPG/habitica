import merge from 'lodash/merge';
import reduce from 'lodash/reduce';
import each from 'lodash/each';
import i18n from '../i18n';
import content from '../content/index';
import {
  NotAuthorized,
} from '../libs/errors';
import randomVal from '../libs/randomVal';
import predictableRandom from '../fns/predictableRandom';

import { removePinnedGearByClass, addPinnedGearByClass, addPinnedGear } from './pinnedGearUtils';
import getItemInfo from '../libs/getItemInfo';

export default function revive (user, req = {}, analytics) {
  if (user.stats.hp > 0) {
    throw new NotAuthorized(i18n.t('cannotRevive', req.language));
  }

  merge(user.stats, {
    hp: 50,
    exp: 0,
    gp: 0,
  });

  if (user.stats.lvl > 1) {
    user.stats.lvl -= 1;
  }

  const lostStat = randomVal(reduce(['str', 'con', 'per', 'int'], (m, k) => {
    if (user.stats[k]) {
      m[k] = k;
    }
    return m;
  }, {}), {
    predictableRandom: predictableRandom(user),
  });

  if (lostStat) {
    user.stats[lostStat] -= 1;
  }

  const base = user.items.gear.owned;
  let gearOwned;

  if (typeof base.toObject === 'function') {
    gearOwned = base.toObject();
  } else {
    gearOwned = user.items.gear.owned;
  }

  const losableItems = {};
  const userClass = user.stats.class;

  each(gearOwned, (value, key) => {
    let itm;
    if (value) {
      itm = content.gear.flat[key];

      if (itm) {
        const itemHasValueOrWarrior0 = itm.value > 0 || key === 'weapon_warrior_0';

        const itemClassEqualsUserClass = itm.klass === userClass;

        const itemClassSpecial = itm.klass === 'special';
        const itemNotSpecialOrUserClassIsSpecial = !itm.specialClass
          || itm.specialClass === userClass;
        const itemIsSpecial = itemNotSpecialOrUserClassIsSpecial && itemClassSpecial;

        const itemIsArmoire = itm.klass === 'armoire';

        if (
          itemHasValueOrWarrior0
          && (itemClassEqualsUserClass || itemIsSpecial || itemIsArmoire)
        ) {
          losableItems[key] = key;
        }
      }
    }
  });

  const lostItem = randomVal(losableItems, {
    predictableRandom: predictableRandom(user),
  });

  let message = '';
  const item = content.gear.flat[lostItem];

  if (item) {
    removePinnedGearByClass(user);

    user.items.gear.owned[lostItem] = false;

    if (user.markModified) user.markModified('items.gear.owned');

    addPinnedGearByClass(user);

    const itemInfo = getItemInfo(user, 'marketGear', item);
    addPinnedGear(user, itemInfo.pinType, itemInfo.path);

    if (user.items.gear.equipped[item.type] === lostItem) {
      user.items.gear.equipped[item.type] = `${item.type}_base_0`;
    }

    if (user.items.gear.costume[item.type] === lostItem) {
      user.items.gear.costume[item.type] = `${item.type}_base_0`;
    }

    message = i18n.t('messageLostItem', { itemText: item.text(req.language) }, req.language);
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
}
