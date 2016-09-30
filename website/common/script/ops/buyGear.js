import content from '../content/index';
import i18n from '../i18n';
import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../libs/errors';
import handleTwoHanded from '../fns/handleTwoHanded';
import ultimateGear from '../fns/ultimateGear';

module.exports = function buyGear (user, req = {}, analytics) {
  let key = _.get(req, 'params.key');
  if (!key) throw new BadRequest(i18n.t('missingKeyParam', req.language));

  let item = content.gear.flat[key];

  if (!item) throw new NotFound(i18n.t('itemNotFound', {key}, req.language));

  if (user.stats.gp < item.value) {
    throw new NotAuthorized(i18n.t('messageNotEnoughGold', req.language));
  }

  if (item.canOwn && !item.canOwn(user)) {
    throw new NotAuthorized(i18n.t('cannotBuyItem', req.language));
  }

  let message;

  if (user.items.gear.owned[item.key]) {
    throw new NotAuthorized(i18n.t('equipmentAlreadyOwned', req.language));
  }

  if (user.preferences.autoEquip) {
    user.items.gear.equipped[item.type] = item.key;
    message = handleTwoHanded(user, item, undefined, req);
  }

  user.items.gear.owned[item.key] = true;

  if (item.last) ultimateGear(user);

  user.stats.gp -= item.value;

  if (!message) {
    message = i18n.t('messageBought', {
      itemText: item.text(req.language),
    }, req.language);
  }

  if (analytics) {
    analytics.track('acquire item', {
      uuid: user._id,
      itemKey: key,
      acquireMethod: 'Gold',
      goldCost: item.value,
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [
    _.pick(user, splitWhitespace('items achievements stats flags')),
    message,
  ];
};
