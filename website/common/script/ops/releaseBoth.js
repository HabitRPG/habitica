import content from '../content/index';
import i18n from '../i18n';
import {
  NotAuthorized,
} from '../libs/errors';
import splitWhitespace from '../libs/splitWhitespace';
import _ from 'lodash';

module.exports = function releaseBoth (user, req = {}, analytics) {
  let animal;

  if (user.balance < 1.5 && !user.achievements.triadBingo) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  let giveTriadBingo = true;

  if (!user.achievements.triadBingo) {
    if (analytics) {
      analytics.track('release pets & mounts', {
        uuid: user._id,
        acquireMethod: 'Gems',
        gemCost: 6,
        category: 'behavior',
        headers: req.headers,
      });
    }

    user.balance -= 1.5;
  }

  user.items.currentMount = '';
  user.items.currentPet = '';

  for (animal in content.pets) {
    if (user.items.pets[animal] === -1) {
      giveTriadBingo = false;
    }

    user.items.pets[animal] = 0;
    user.items.mounts[animal] = null;
  }

  if (!user.achievements.beastMasterCount) {
    user.achievements.beastMasterCount = 0;
  }
  user.achievements.beastMasterCount++;

  if (!user.achievements.mountMasterCount) {
    user.achievements.mountMasterCount = 0;
  }
  user.achievements.mountMasterCount++;

  if (giveTriadBingo) {
    if (!user.achievements.triadBingoCount) {
      user.achievements.triadBingoCount = 0;
    }
    user.achievements.triadBingoCount++;
  }

  return [
    _.pick(user, splitWhitespace('achievements items balance')),
    i18n.t('mountsAndPetsReleased'),
  ];
};
