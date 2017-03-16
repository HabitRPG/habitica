import i18n from '../i18n';
import get from 'lodash/get';
import each from 'lodash/each';
import findLast from 'lodash/findLast';
import pick from 'lodash/pick';
import splitWhitespace from '../libs/splitWhitespace';
import { capByLevel } from '../statHelpers';
import {
  NotAuthorized,
  BadRequest,
} from '../libs/errors';

function resetClass (user, req = {}) {
  if (user.preferences.disableClasses) {
    user.preferences.disableClasses = false;
    user.preferences.autoAllocate = false;
  } else {
    if (user.balance < 0.75) throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
    user.balance -= 0.75;
  }

  user.stats.str = 0;
  user.stats.con = 0;
  user.stats.per = 0;
  user.stats.int = 0;
  user.stats.points = capByLevel(user.stats.lvl);
  user.flags.classSelected = false;
}

module.exports = function changeClass (user, req = {}, analytics) {
  let klass = get(req, 'query.class');
  // user.flags.classSelected is set to false after the user paid the 3 gems
  if (user.stats.lvl < 10) {
    throw new NotAuthorized(i18n.t('lvl10ChangeClass', req.language));
  } else if (!klass) {
    // if no class is specified, reset points and set user.flags.classSelected to false. User will have paid 3 gems and will be prompted to select class.
    resetClass(user, req);
  } else if (klass === 'warrior' || klass === 'rogue' || klass === 'wizard' || klass === 'healer') {
    if (user.flags.classSelected) {
      resetClass(user, req);
    }

    user.stats.class = klass;
    user.flags.classSelected = true;

    each(['weapon', 'armor', 'shield', 'head'], (type) => {
      let foundKey = false;
      findLast(user.items.gear.owned, (val, key) => {
        if (key.indexOf(`${type}_${klass}`) !== -1 && val === true) {
          foundKey = key;
          return true;
        }
      });

      if (!foundKey) {
        if (type === 'weapon') {
          foundKey = `weapon_${klass}_0`;
        } else if (type === 'shield' && klass === 'rogue') {
          foundKey = 'shield_rogue_0';
        } else {
          foundKey = `${type}_base_0`;
        }
      }

      user.items.gear.equipped[type] = foundKey;

      if (type === 'weapon' || (type === 'shield' && klass === 'rogue')) { // eslint-disable-line no-extra-parens
        user.items.gear.owned[`${type}_${klass}_0`] = true;
      }
    });

    if (analytics) {
      analytics.track('change class', {
        uuid: user._id,
        class: klass,
        acquireMethod: 'Gems',
        gemCost: 3,
        category: 'behavior',
        headers: req.headers,
      });
    }
  } else {
    // if invalid class is specified, throw an error.
    throw new BadRequest(i18n.t('invalidClass', req.language));
  }
  return [
    pick(user, splitWhitespace('stats flags items preferences')),
  ];
};
