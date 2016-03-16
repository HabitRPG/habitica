import i18n from '../i18n';
import _ from 'lodash';

module.exports = function(user, req, cb, analytics) {
  var analyticsData;
  if (user.balance < 1) {
    return typeof cb === "function" ? cb({
      code: 401,
      message: i18n.t('notEnoughGems', req.language)
    }) : void 0;
  }
  user.balance--;
  _.each(user.tasks, function(task) {
    if (task.type !== 'reward') {
      return task.value = 0;
    }
  });
  user.stats.hp = 50;
  analyticsData = {
    uuid: user._id,
    acquireMethod: 'Gems',
    gemCost: 4,
    category: 'behavior'
  };
  if (analytics != null) {
    analytics.track('Fortify Potion', analyticsData);
  }
  return typeof cb === "function" ? cb(null, user) : void 0;
};
