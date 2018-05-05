import content from '../content/index';
import i18n from '../i18n';
import {
  BadRequest,
} from '../libs/errors';
import cloneDeep from 'lodash/cloneDeep';

module.exports = function openMysteryItem (user, req = {}, analytics) {
  let item = user.purchased.plan.mysteryItems.shift();

  if (!item) {
    throw new BadRequest(i18n.t('mysteryItemIsEmpty', req.language));
  }

  item = cloneDeep(content.gear.flat[item]);
  user.items.gear.owned[item.key] = true;

  if (user.markModified) user.markModified('purchased.plan.mysteryItems');

  if (analytics) {
    analytics.track('open mystery item', {
      uuid: user._id,
      itemKey: item,
      itemType: 'Subscriber Gear',
      acquireMethod: 'Subscriber',
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [
    item,
    i18n.t('mysteryItemOpened', req.language),
  ];
};
