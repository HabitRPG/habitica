import i18n from '../i18n';
import content from '../content/index';
import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';

module.exports = function(user, req, cb, analytics) {
  var mysterySet, ref;
  if (!(user.purchased.plan.consecutive.trinkets > 0)) {
    return typeof cb === "function" ? cb({
      code: 401,
      message: i18n.t('notEnoughHourglasses', req.language)
    }) : void 0;
  }
  mysterySet = (ref = content.timeTravelerStore(user.items.gear.owned)) != null ? ref[req.params.key] : void 0;
  if ((typeof window !== "undefined" && window !== null ? window.confirm : void 0) != null) {
    if (!window.confirm(i18n.t('hourglassBuyEquipSetConfirm'))) {
      return;
    }
  }
  if (!mysterySet) {
    return typeof cb === "function" ? cb({
      code: 404,
      message: "Mystery set not found, or set already owned"
    }) : void 0;
  }
  _.each(mysterySet.items, function(i) {
    var analyticsData;
    user.items.gear.owned[i.key] = true;
    analyticsData = {
      uuid: user._id,
      itemKey: i.key,
      itemType: 'Subscriber Gear',
      acquireMethod: 'Hourglass',
      category: 'behavior'
    };
    return analytics != null ? analytics.track('acquire item', analyticsData) : void 0;
  });
  user.purchased.plan.consecutive.trinkets--;
  return typeof cb === "function" ? cb({
    code: 200,
    message: i18n.t('hourglassPurchaseSet', req.language)
  }, _.pick(user, splitWhitespace('items purchased.plan.consecutive'))) : void 0;
};
