import content from '../content/index';
import i18n from '../i18n';
import _ from 'lodash';

module.exports = function(user, req, cb, analytics) {
  var analyticsData, base, cl, gearOwned, item, losableItems, lostItem, lostStat;
  if (!(user.stats.hp <= 0)) {
    return typeof cb === "function" ? cb({
      code: 400,
      message: "Cannot revive if not dead"
    }) : void 0;
  }
  _.merge(user.stats, {
    hp: 50,
    exp: 0,
    gp: 0
  });
  if (user.stats.lvl > 1) {
    user.stats.lvl--;
  }
  lostStat = user.fns.randomVal(_.reduce(['str', 'con', 'per', 'int'], (function(m, k) {
    if (user.stats[k]) {
      m[k] = k;
    }
    return m;
  }), {}));
  if (lostStat) {
    user.stats[lostStat]--;
  }
  cl = user.stats["class"];
  gearOwned = (typeof (base = user.items.gear.owned).toObject === "function" ? base.toObject() : void 0) || user.items.gear.owned;
  losableItems = {};
  _.each(gearOwned, function(v, k) {
    var itm;
    if (v) {
      itm = content.gear.flat['' + k];
      if (itm) {
        if ((itm.value > 0 || k === 'weapon_warrior_0') && (itm.klass === cl || (itm.klass === 'special' && (!itm.specialClass || itm.specialClass === cl)) || itm.klass === 'armoire')) {
          return losableItems['' + k] = '' + k;
        }
      }
    }
  });
  lostItem = user.fns.randomVal(losableItems);
  if (item = content.gear.flat[lostItem]) {
    user.items.gear.owned[lostItem] = false;
    if (user.items.gear.equipped[item.type] === lostItem) {
      user.items.gear.equipped[item.type] = item.type + "_base_0";
    }
    if (user.items.gear.costume[item.type] === lostItem) {
      user.items.gear.costume[item.type] = item.type + "_base_0";
    }
  }
  if (typeof user.markModified === "function") {
    user.markModified('items.gear');
  }
  analyticsData = {
    uuid: user._id,
    lostItem: lostItem,
    gaLabel: lostItem,
    category: 'behavior'
  };
  if (analytics != null) {
    analytics.track('Death', analyticsData);
  }
  return typeof cb === "function" ? cb((item ? {
    code: 200,
    message: i18n.t('messageLostItem', {
      itemText: item.text(req.language)
    }, req.language)
  } : null), user) : void 0;
};
