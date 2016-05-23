import content from '../content/index';
import i18n from '../i18n';

module.exports = function(user, req, cb, analytics) {
  var analyticsData, animal, giveTriadBingo;
  if (user.balance < 1.5 && !user.achievements.triadBingo) {
    return typeof cb === "function" ? cb({
      code: 401,
      message: i18n.t('notEnoughGems', req.language)
    }) : void 0;
  } else {
    giveTriadBingo = true;
    if (!user.achievements.triadBingo) {
      analyticsData = {
        uuid: user._id,
        acquireMethod: 'Gems',
        gemCost: 6,
        category: 'behavior'
      };
      if (typeof analytics !== "undefined" && analytics !== null) {
        analytics.track('release pets & mounts', analyticsData);
      }
      user.balance -= 1.5;
    }
    user.items.currentMount = "";
    user.items.currentPet = "";
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
  }
  return typeof cb === "function" ? cb(null, user) : void 0;
};
