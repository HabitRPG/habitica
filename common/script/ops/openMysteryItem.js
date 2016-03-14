import content from '../content/index';

module.exports = function(user, req, cb, analytics) {
  var analyticsData, item, ref, ref1;
  item = (ref = user.purchased.plan) != null ? (ref1 = ref.mysteryItems) != null ? ref1.shift() : void 0 : void 0;
  if (!item) {
    return typeof cb === "function" ? cb({
      code: 400,
      message: "Empty"
    }) : void 0;
  }
  item = content.gear.flat[item];
  user.items.gear.owned[item.key] = true;
  if (typeof user.markModified === "function") {
    user.markModified('purchased.plan.mysteryItems');
  }
  item.notificationType = 'Mystery';
  analyticsData = {
    uuid: user._id,
    itemKey: item,
    itemType: 'Subscriber Gear',
    acquireMethod: 'Subscriber',
    category: 'behavior'
  };
  if (analytics != null) {
    analytics.track('open mystery item', analyticsData);
  }
  if (typeof window !== 'undefined') {
    (user._tmp != null ? user._tmp : user._tmp = {}).drop = item;
  }
  return typeof cb === "function" ? cb(null, user.items.gear.owned) : void 0;
};
