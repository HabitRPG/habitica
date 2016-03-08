import content from '../content/index';
import i18n from '../i18n';

module.exports = function(user, req, cb, analytics) {
  var analyticsData, mount;
  if (user.balance < 1) {
    return typeof cb === "function" ? cb({
      code: 401,
      message: i18n.t('notEnoughGems', req.language)
    }) : void 0;
  } else {
    user.balance -= 1;
    user.items.currentMount = "";
    for (mount in content.pets) {
      user.items.mounts[mount] = null;
    }
    if (!user.achievements.mountMasterCount) {
      user.achievements.mountMasterCount = 0;
    }
    user.achievements.mountMasterCount++;
  }
  analyticsData = {
    uuid: user._id,
    acquireMethod: 'Gems',
    gemCost: 4,
    category: 'behavior'
  };
  if (analytics != null) {
    analytics.track('release mounts', analyticsData);
  }
  return typeof cb === "function" ? cb(null, user) : void 0;
};
