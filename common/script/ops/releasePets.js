import content from '../content/index';
import i18n from '../i18n';

module.exports = function(user, req, cb, analytics) {
  var analyticsData, pet;
  if (user.balance < 1) {
    return typeof cb === "function" ? cb({
      code: 401,
      message: i18n.t('notEnoughGems', req.language)
    }) : void 0;
  } else {
    user.balance -= 1;
    for (pet in content.pets) {
      user.items.pets[pet] = 0;
    }
    if (!user.achievements.beastMasterCount) {
      user.achievements.beastMasterCount = 0;
    }
    user.achievements.beastMasterCount++;
    user.items.currentPet = "";
  }
  analyticsData = {
    uuid: user._id,
    acquireMethod: 'Gems',
    gemCost: 4,
    category: 'behavior'
  };
  if (analytics != null) {
    analytics.track('release pets', analyticsData);
  }
  return typeof cb === "function" ? cb(null, user) : void 0;
};
