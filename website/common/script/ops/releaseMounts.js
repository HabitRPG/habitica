import content from '../content/index';
import i18n from '../i18n';
import {
  NotAuthorized,
} from '../libs/errors';

module.exports = function releaseMounts (user, req = {}, analytics) {
  if (user.balance < 1) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  user.balance -= 1;

  let giveMountMasterAchievement = true;

  let mountInfo = content.mountInfo[user.items.currentMount];

  if (mountInfo && mountInfo.type === 'drop') {
    user.items.currentMount = '';
  }

  for (let mount in content.pets) {
    if (user.items.mounts[mount] === null || user.items.mounts[mount] === undefined) {
      giveMountMasterAchievement = false;
    }
    user.items.mounts[mount] = null;
  }

  if (giveMountMasterAchievement) {
    if (!user.achievements.mountMasterCount) {
      user.achievements.mountMasterCount = 0;
    }
    user.achievements.mountMasterCount++;
  }

  if (analytics) {
    analytics.track('release mounts', {
      uuid: user._id,
      acquireMethod: 'Gems',
      gemCost: 4,
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [
    user.items.mounts,
    i18n.t('mountsReleased'),
  ];
};
