import i18n from '../i18n';
import content from '../content/index';

module.exports = function(user, req, cb, analytics) {
  var analyticsData, base, item, key, message, name;
  key = req.params.key;
  item = content.quests[key];
  if (!item) {
    return typeof cb === "function" ? cb({
      code: 404,
      message: "Quest '" + key + " not found (see https://github.com/HabitRPG/habitrpg/blob/develop/common/script/content/index.js)"
    }) : void 0;
  }
  if (!(item.category === 'gold' && item.goldValue)) {
    return typeof cb === "function" ? cb({
      code: 404,
      message: "Quest '" + key + " is not a Gold-purchasable quest (see https://github.com/HabitRPG/habitrpg/blob/develop/common/script/content/index.js)"
    }) : void 0;
  }
  if (user.stats.gp < item.goldValue) {
    return typeof cb === "function" ? cb({
      code: 401,
      message: i18n.t('messageNotEnoughGold', req.language)
    }) : void 0;
  }
  message = i18n.t('messageBought', {
    itemText: item.text(req.language)
  }, req.language);
  if ((base = user.items.quests)[name = item.key] == null) {
    base[name] = 0;
  }
  user.items.quests[item.key] += 1;
  user.stats.gp -= item.goldValue;
  analyticsData = {
    uuid: user._id,
    itemKey: item.key,
    itemType: 'Market',
    goldCost: item.goldValue,
    acquireMethod: 'Gold',
    category: 'behavior'
  };
  if (analytics != null) {
    analytics.track('acquire item', analyticsData);
  }
  return typeof cb === "function" ? cb({
    code: 200,
    message: message
  }, user.items.quests) : void 0;
};
