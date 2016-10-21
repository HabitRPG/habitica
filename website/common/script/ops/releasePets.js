import content from '../content/index';
import i18n from '../i18n';
import {
  NotAuthorized,
} from '../libs/errors';

module.exports = function releasePets (user, req = {}, analytics) {
  if (user.balance < 1) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  user.balance -= 1;

  let petInfo = content.petInfo[user.items.currentPet];

  if (petInfo && petInfo.type === 'drop') {
    user.items.currentPet = '';
  }

  for (let pet in content.pets) {
    user.items.pets[pet] = 0;
  }

  if (!user.achievements.beastMasterCount) {
    user.achievements.beastMasterCount = 0;
  }
  user.achievements.beastMasterCount++;

  if (analytics) {
    analytics.track('release pets', {
      uuid: user._id,
      acquireMethod: 'Gems',
      gemCost: 4,
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [
    user.items.pets,
    i18n.t('petsReleased'),
  ];
};
