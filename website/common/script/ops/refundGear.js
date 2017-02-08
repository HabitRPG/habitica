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

module.exports = function refundGear (user, req = {}, analytics) {
  let key = _.get(req, 'params.key');
  if (!key) throw new BadRequest(i18n.t('missingKeyParam', req.language));

  let item = content.gear.flat[key];

  if (!item) throw new NotFound(i18n.t('itemNotFound', {key}, req.language));

  let message;

  if (!user.items.gear.owned[item.key]) {
    // throw new NotAuthorized(i18n.t('equipmentAlreadyOwned', req.language));
  }

  if (user.items.gear.equipped[item.type] === item.key) user.items.gear.equipped[item.type] = 'armor_base_0';

  user.items.gear.owned[item.key] = false;
  user.stats.gp += item.value;

  if (!message) {
    message = i18n.t('gearRefunded', {
      itemText: item.text(req.language),
    }, req.language);
  }

  if (analytics) {
    analytics.track('refunded gear', {
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
