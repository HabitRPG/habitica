import content from '../content/index';
import i18n from '../i18n';
import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';
import planGemLimits from '../libs/planGemLimits';

module.exports = function(user, req, cb, analytics) {
  var analyticsData, convCap, convRate, item, key, price, ref, ref1, ref2, ref3, type;
  ref = req.params, type = ref.type, key = ref.key;
  if (type === 'gems' && key === 'gem') {
    ref1 = planGemLimits, convRate = ref1.convRate, convCap = ref1.convCap;
    convCap += user.purchased.plan.consecutive.gemCapExtra;
    if (!((ref2 = user.purchased) != null ? (ref3 = ref2.plan) != null ? ref3.customerId : void 0 : void 0)) {
      return typeof cb === "function" ? cb({
        code: 401,
        message: "Must subscribe to purchase gems with GP"
      }, req) : void 0;
    }
    if (!(user.stats.gp >= convRate)) {
      return typeof cb === "function" ? cb({
        code: 401,
        message: "Not enough Gold"
      }) : void 0;
    }
    if (user.purchased.plan.gemsBought >= convCap) {
      return typeof cb === "function" ? cb({
        code: 401,
        message: "You've reached the Gold=>Gem conversion cap (" + convCap + ") for this month. We have this to prevent abuse / farming. The cap will reset within the first three days of next month."
      }) : void 0;
    }
    user.balance += .25;
    user.purchased.plan.gemsBought++;
    user.stats.gp -= convRate;
    analyticsData = {
      uuid: user._id,
      itemKey: key,
      acquireMethod: 'Gold',
      goldCost: convRate,
      category: 'behavior'
    };
    if (analytics != null) {
      analytics.track('purchase gems', analyticsData);
    }
    return typeof cb === "function" ? cb({
      code: 200,
      message: "+1 Gem"
    }, _.pick(user, splitWhitespace('stats balance'))) : void 0;
  }
  if (type !== 'eggs' && type !== 'hatchingPotions' && type !== 'food' && type !== 'quests' && type !== 'gear') {
    return typeof cb === "function" ? cb({
      code: 404,
      message: ":type must be in [eggs,hatchingPotions,food,quests,gear]"
    }, req) : void 0;
  }
  if (type === 'gear') {
    item = content.gear.flat[key];
    if (user.items.gear.owned[key]) {
      return typeof cb === "function" ? cb({
        code: 401,
        message: i18n.t('alreadyHave', req.language)
      }) : void 0;
    }
    price = (item.twoHanded || item.gearSet === 'animal' ? 2 : 1) / 4;
  } else {
    item = content[type][key];
    price = item.value / 4;
  }
  if (!item) {
    return typeof cb === "function" ? cb({
      code: 404,
      message: ":key not found for Content." + type
    }, req) : void 0;
  }
  if (!item.canBuy(user)) {
    return typeof cb === "function" ? cb({
      code: 403,
      message: i18n.t('messageNotAvailable', req.language)
    }) : void 0;
  }
  if ((user.balance < price) || !user.balance) {
    return typeof cb === "function" ? cb({
      code: 403,
      message: i18n.t('notEnoughGems', req.language)
    }) : void 0;
  }
  user.balance -= price;
  if (type === 'gear') {
    user.items.gear.owned[key] = true;
  } else {
    if (!(user.items[type][key] > 0)) {
      user.items[type][key] = 0;
    }
    user.items[type][key]++;
  }
  analyticsData = {
    uuid: user._id,
    itemKey: key,
    itemType: 'Market',
    acquireMethod: 'Gems',
    gemCost: item.value,
    category: 'behavior'
  };
  if (analytics != null) {
    analytics.track('acquire item', analyticsData);
  }
  return typeof cb === "function" ? cb(null, _.pick(user, splitWhitespace('items balance'))) : void 0;
};
