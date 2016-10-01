import i18n from '../i18n';
import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';
import { capByLevel } from '../statHelpers';
import {
  NotAuthorized,
} from '../libs/errors';

module.exports = function changeClass (user, req = {}, analytics) {
  let klass = _.get(req, 'query.class');

  // user.flags.classSelected is set to false after the user paid the 3 gems
  if (user.stats.lvl < 10) {
    throw new NotAuthorized(i18n.t('lvl10ChangeClass', req.language));
  } else if (!user.flags.classSelected && (klass === 'warrior' || klass === 'rogue' || klass === 'wizard' || klass === 'healer')) {
    user.stats.class = klass;
    user.flags.classSelected = true;

    _.each(['weapon', 'armor', 'shield', 'head'], (type) => {
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

  return [
    _.pick(user, splitWhitespace('stats flags items preferences')),
  ];
};
