import i18n from '../i18n';
import get from 'lodash/get';
import pick from 'lodash/pick';
import splitWhitespace from '../libs/splitWhitespace';
import { capByLevel } from '../statHelpers';
import {
  NotAuthorized,
  BadRequest,
} from '../libs/errors';
import { removePinnedGearByClass, removePinnedItemsByOwnedGear, addPinnedGearByClass } from './pinnedGearUtils';

function resetClass (user, req = {}) {
  removePinnedGearByClass(user);

  let balanceRemoved = 0;

  if (user.preferences.disableClasses) {
    user.preferences.disableClasses = false;
    user.preferences.autoAllocate = false;
  } else {
    if (user.balance < 0.75) throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
    user.balance -= 0.75;
    balanceRemoved = 0.75;
  }

  user.stats.str = 0;
  user.stats.con = 0;
  user.stats.per = 0;
  user.stats.int = 0;
  user.stats.points = capByLevel(user.stats.lvl);
  user.flags.classSelected = false;

  return balanceRemoved;
}

module.exports = function changeClass (user, req = {}, analytics) {
  let klass = get(req, 'query.class');
  let balanceRemoved = 0;
  // user.flags.classSelected is set to false after the user paid the 3 gems
  if (user.stats.lvl < 10) {
    throw new NotAuthorized(i18n.t('lvl10ChangeClass', req.language));
  } else if (!klass) {
    // if no class is specified, reset points and set user.flags.classSelected to false. User will have paid 3 gems and will be prompted to select class.
    balanceRemoved = resetClass(user, req);
  } else if (klass === 'warrior' || klass === 'rogue' || klass === 'wizard' || klass === 'healer') {
    if (user.flags.classSelected) {
      balanceRemoved = resetClass(user, req);
    }

    user.stats.class = klass;
    user.flags.classSelected = true;

    addPinnedGearByClass(user);

    user.items.gear.owned[`weapon_${klass}_0`] = true;
    if (klass === 'rogue') user.items.gear.owned[`shield_${klass}_0`] = true;
    if (user.markModified) user.markModified('items.gear.owned');

    removePinnedItemsByOwnedGear(user);

    if (analytics) {
      analytics.track('change class', {
        uuid: user._id,
        class: klass,
        acquireMethod: balanceRemoved === 0 ? 'Free' : 'Gems',
        gemCost: balanceRemoved / 0.25,
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
