import i18n from '../../i18n';
import content from '../../content/index';
import get from 'lodash/get';
import pick from 'lodash/pick';
import splitWhitespace from '../../libs/splitWhitespace';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../libs/errors';

module.exports = function buySpecialSpell (user, req = {}, analytics) {
  let key = get(req, 'params.key');
  let quantity = req.quantity || 1;

  if (!key) throw new BadRequest(i18n.t('missingKeyParam', req.language));

  let item = content.special[key];
  if (!item) throw new NotFound(i18n.t('spellNotFound', {spellId: key}, req.language));

  if (user.stats.gp < item.value * quantity) {
    throw new NotAuthorized(i18n.t('messageNotEnoughGold', req.language));
  }
  user.stats.gp -= item.value * quantity;

  user.items.special[key] += quantity;

  if (key === 'salt') {
    user.stats.buffs.snowball = false;
  } else if (key === 'opaquePotion') {
    user.stats.buffs.spookySparkles = false;
  } else if (key === 'petalFreePotion') {
    user.stats.buffs.shinySeed = false;
  } else if (key === 'sand') {
    user.stats.buffs.seafoam = false;
  }

  if (analytics) {
    analytics.track('acquire item', {
      uuid: user._id,
      itemKey: item.key,
      itemType: 'Market',
      goldCost: item.goldValue,
      quantityPurchased: quantity,
      acquireMethod: 'Gold',
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [
    pick(user, splitWhitespace('items stats')),
    i18n.t('messageBought', {
      itemText: item.text(req.language),
    }, req.language),
  ];
};
