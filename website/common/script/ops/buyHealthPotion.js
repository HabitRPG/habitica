import content from '../content/index';
import i18n from '../i18n';
import {
  NotAuthorized,
} from '../libs/errors';

module.exports = function buyHealthPotion (user, req = {}, analytics) {
  let item = content.potion;

  if (user.stats.gp < item.value) {
    throw new NotAuthorized(i18n.t('messageNotEnoughGold', req.language));
  }

  if (item.canOwn && !item.canOwn(user)) {
    throw new NotAuthorized(i18n.t('cannotBuyItem', req.language));
  }

  if (user.stats.hp >= 50) {
    throw new NotAuthorized(i18n.t('messageHealthAlreadyMax', req.language));
  }

  if (user.stats.hp <= 0) {
    throw new NotAuthorized(i18n.t('messageHealthAlreadyMin', req.language));
  }

  user.stats.hp += 15;
  if (user.stats.hp > 50) {
    user.stats.hp = 50;
  }

  user.stats.gp -= item.value;

  let message = i18n.t('messageBought', {
    itemText: item.text(req.language),
  }, req.language);


  if (analytics) {
    analytics.track('acquire item', {
      uuid: user._id,
      itemKey: 'Potion',
      acquireMethod: 'Gold',
      goldCost: item.value,
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [
    user.stats,
    message,
  ];
};
