import content from '../content/index';
import { mountMasterProgress } from '../count';
import i18n from '../i18n';
import {
  NotAuthorized,
} from '../libs/errors';
import updateUserBalance from './updateUserBalance';

export default async function releaseMounts (user, req = {}, analytics) {
  if (user.balance < 1) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  if (mountMasterProgress(user.items.mounts) !== 90) {
    throw new NotAuthorized(i18n.t('notEnoughMounts', req.language));
  }

  await updateUserBalance(user, -1, 'release_mounts');

  let giveMountMasterAchievement = true;

  const mountInfo = content.mountInfo[user.items.currentMount];

  if (mountInfo && mountInfo.type === 'drop') {
    user.items.currentMount = '';
  }

  for (const mount of Object.keys(content.pets)) {
    if (user.items.mounts[mount] === null || user.items.mounts[mount] === undefined) {
      giveMountMasterAchievement = false;
    }
    user.items.mounts[mount] = null;
  }

  if (user.markModified) user.markModified('items.mounts');

  if (giveMountMasterAchievement) {
    if (!user.achievements.mountMasterCount) {
      user.achievements.mountMasterCount = 0;
    }
    user.achievements.mountMasterCount += 1;
  }

  if (analytics) {
    analytics.track('release mounts', {
      uuid: user._id,
      currency: 'Gems',
      gemCost: 4,
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [
    user.items.mounts,
    i18n.t('mountsReleased'),
  ];
}
