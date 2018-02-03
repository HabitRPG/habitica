import i18n from '../i18n';
import content from '../content/index';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../libs/errors';
import get from 'lodash/get';

// buy a quest with gold
module.exports = function buyQuest (user, req = {}, analytics) {
  let key = get(req, 'params.key');
  if (!key) throw new BadRequest(i18n.t('missingKeyParam', req.language));

  let item = content.quests[key];
  if (!item) throw new NotFound(i18n.t('questNotFound', {key}, req.language));

  if (key === 'lostMasterclasser1' && !(user.achievements.quests.dilatoryDistress3 && user.achievements.quests.mayhemMistiflying3 && user.achievements.quests.stoikalmCalamity3 && user.achievements.quests.taskwoodsTerror3)) {
    throw new NotAuthorized(i18n.t('questUnlockLostMasterclasser', req.language));
  }

  if (!(item.category === 'gold' && item.goldValue)) {
    throw new NotAuthorized(i18n.t('questNotGoldPurchasable', {key}, req.language));
  }
  if (user.stats.gp < item.goldValue) {
    throw new NotAuthorized(i18n.t('messageNotEnoughGold', req.language));
  }

  user.items.quests[item.key] = user.items.quests[item.key] || 0;
  user.items.quests[item.key]++;
  user.stats.gp -= item.goldValue;

  if (analytics) {
    analytics.track('acquire item', {
      uuid: user._id,
      itemKey: item.key,
      itemType: 'Market',
      goldCost: item.goldValue,
      acquireMethod: 'Gold',
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [
    user.items.quests,
    i18n.t('messageBought', {
      itemText: item.text(req.language),
    }, req.language),
  ];
};
