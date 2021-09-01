import pick from 'lodash/pick';
import content from '../content/index';
import { beastMasterProgress, mountMasterProgress } from '../count';
import i18n from '../i18n';
import {
  NotAuthorized,
} from '../libs/errors';
import splitWhitespace from '../libs/splitWhitespace';

export default function releaseBoth (user, req = {}) {
  if (!user.achievements.triadBingo) {
    throw new NotAuthorized(i18n.t('notEnoughPetsMounts', req.language));
  }

  if (
    beastMasterProgress(user.items.pets) !== 90
    || mountMasterProgress(user.items.mounts) !== 90
  ) {
    throw new NotAuthorized(i18n.t('notEnoughPetsMounts', req.language));
  }

  let giveTriadBingo = true;
  let giveBeastMasterAchievement = true;
  let giveMountMasterAchievement = true;

  const mountInfo = content.mountInfo[user.items.currentMount];

  if (mountInfo && mountInfo.type === 'drop') {
    user.items.currentMount = '';
  }

  const petInfo = content.petInfo[user.items.currentPet];

  if (petInfo && petInfo.type === 'drop') {
    user.items.currentPet = '';
  }

  for (const animal of Object.keys(content.pets)) {
    if (user.items.pets[animal] === -1) {
      giveTriadBingo = false;
    } else if (!user.items.pets[animal]) {
      giveBeastMasterAchievement = false;
    }
    if (user.items.mounts[animal] === null || user.items.mounts[animal] === undefined) {
      giveMountMasterAchievement = false;
    }

    user.items.pets[animal] = 0;
    user.items.mounts[animal] = null;
  }

  if (user.markModified) {
    user.markModified('items.pets');
    user.markModified('items.mounts');
  }

  if (giveBeastMasterAchievement) {
    if (!user.achievements.beastMasterCount) {
      user.achievements.beastMasterCount = 0;
    }
    user.achievements.beastMasterCount += 1;
  }

  if (giveMountMasterAchievement) {
    if (!user.achievements.mountMasterCount) {
      user.achievements.mountMasterCount = 0;
    }
    user.achievements.mountMasterCount += 1;
  }

  if (giveTriadBingo) {
    if (!user.achievements.triadBingoCount) {
      user.achievements.triadBingoCount = 0;
    }
    user.achievements.triadBingoCount += 1;
  }

  return [
    pick(user, splitWhitespace('achievements items balance')),
    i18n.t('mountsAndPetsReleased'),
  ];
}
