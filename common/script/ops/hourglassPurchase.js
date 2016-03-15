import content from '../content/index';
import i18n from '../i18n';
import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';

module.exports = function(user, req, cb, analytics) {
  var analyticsData, key, ref, type;
  ref = req.params, type = ref.type, key = ref.key;
  if (!content.timeTravelStable[type]) {
    return typeof cb === "function" ? cb({
      code: 403,
      message: i18n.t('typeNotAllowedHourglass', req.language) + JSON.stringify(_.keys(content.timeTravelStable))
    }) : void 0;
  }
  if (!_.contains(_.keys(content.timeTravelStable[type]), key)) {
    return typeof cb === "function" ? cb({
      code: 403,
      message: i18n.t(type + 'NotAllowedHourglass', req.language)
    }) : void 0;
  }
  if (user.items[type][key]) {
    return typeof cb === "function" ? cb({
      code: 403,
      message: i18n.t(type + 'AlreadyOwned', req.language)
    }) : void 0;
  }
  if (!(user.purchased.plan.consecutive.trinkets > 0)) {
    return typeof cb === "function" ? cb({
      code: 403,
      message: i18n.t('notEnoughHourglasses', req.language)
    }) : void 0;
  }
  user.purchased.plan.consecutive.trinkets--;
  if (type === 'pets') {
    user.items.pets[key] = 5;
  }
  if (type === 'mounts') {
    user.items.mounts[key] = true;
  }
  analyticsData = {
    uuid: user._id,
    itemKey: key,
    itemType: type,
    acquireMethod: 'Hourglass',
    category: 'behavior'
  };
  if (analytics != null) {
    analytics.track('acquire item', analyticsData);
  }
  return typeof cb === "function" ? cb({
    code: 200,
    message: i18n.t('hourglassPurchase', req.language)
  }, _.pick(user, splitWhitespace('items purchased.plan.consecutive'))) : void 0;
};
