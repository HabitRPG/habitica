import content from '../content/index';
import i18n from '../i18n';
import _ from 'lodash';
import {
  NotAuthorized,
} from '../libs/errors';
import randomVal from '../fns/randomVal';

module.exports = function revive (user, req = {}, analytics) {
  if (user.stats.hp > 0) {
    throw new NotAuthorized(i18n.t('cannotRevive', req.language));
  }

  _.merge(user.stats, {
    hp: 50,
    exp: 0,
    gp: 0,
  });

  if (user.stats.lvl > 1) {
    user.stats.lvl--;
  }

  let lostStat = randomVal(user, _.reduce(['str', 'con', 'per', 'int'], function findRandomStat (m, k) {
    if (user.stats[k]) {
      m[k] = k;
    }
    return m;
  }, {}));

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

  _.each(gearOwned, function findLosableItems (value, key) {
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

  let lostItem = randomVal(user, losableItems);

  let message = '';
  let item = content.gear.flat[lostItem];

  if (item) {
    user.items.gear.owned[lostItem] = false;

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
    });
  }

  if (req.v2 === true) {
    return user;
  } else {
    return [
      user.items,
      message,
    ];
  }
};
