import content from '../content/index';
import i18n from '../i18n';
import {
  Forbidden,
} from '../libs/errors';

module.exports = function releaseMounts (user, req = {}, analytics) {
  let mount;

  if (user.balance < 1) {
    throw new Forbidden(i18n.t('notEnoughGems', req.language));
  }

  user.balance -= 1;
  user.items.currentMount = '';

  for (mount in content.pets) {
    user.items.mounts[mount] = null;
  }

  if (!user.achievements.mountMasterCount) {
    user.achievements.mountMasterCount = 0;
  }
  user.achievements.mountMasterCount++;

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
