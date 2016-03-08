import i18n from '../i18n';
import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';
import { capByLevel } from '../statHelpers';

module.exports = function(user, req, cb, analytics) {
  var analyticsData, klass, ref;
  klass = (ref = req.query) != null ? ref["class"] : void 0;
  if (klass === 'warrior' || klass === 'rogue' || klass === 'wizard' || klass === 'healer') {
    analyticsData = {
      uuid: user._id,
      "class": klass,
      acquireMethod: 'Gems',
      gemCost: 3,
      category: 'behavior'
    };
    if (analytics != null) {
      analytics.track('change class', analyticsData);
    }
    user.stats["class"] = klass;
    user.flags.classSelected = true;
    _.each(["weapon", "armor", "shield", "head"], function(type) {
      var foundKey;
      foundKey = false;
      _.findLast(user.items.gear.owned, function(v, k) {
        if (~k.indexOf(type + "_" + klass) && v === true) {
          return foundKey = k;
        }
      });
      user.items.gear.equipped[type] = foundKey ? foundKey : type === "weapon" ? "weapon_" + klass + "_0" : type === "shield" && klass === "rogue" ? "shield_rogue_0" : type + "_base_0";
      if (type === "weapon" || (type === "shield" && klass === "rogue")) {
        user.items.gear.owned[type + "_" + klass + "_0"] = true;
      }
      return true;
    });
  } else {
    if (user.preferences.disableClasses) {
      user.preferences.disableClasses = false;
      user.preferences.autoAllocate = false;
    } else {
      if (!(user.balance >= .75)) {
        return typeof cb === "function" ? cb({
          code: 401,
          message: i18n.t('notEnoughGems', req.language)
        }) : void 0;
      }
      user.balance -= .75;
    }
    _.merge(user.stats, {
      str: 0,
      con: 0,
      per: 0,
      int: 0,
      points: capByLevel(user.stats.lvl)
    });
    user.flags.classSelected = false;
  }
  return typeof cb === "function" ? cb(null, _.pick(user, splitWhitespace('stats flags items preferences'))) : void 0;
};
