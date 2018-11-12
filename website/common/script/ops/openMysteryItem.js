import content from '../content/index';
import i18n from '../i18n';
import {
  BadRequest,
} from '../libs/errors';
import cloneDeep from 'lodash/cloneDeep';

function markNotificationAsRead (user) {
  const index = user.notifications.findIndex(notification => {
    return notification && notification.type === 'NEW_MYSTERY_ITEMS';
  });

  if (index !== -1) user.notifications.splice(index, 1);
}

module.exports = function openMysteryItem (user, req = {}, analytics) {
  const mysteryItems = user.purchased.plan.mysteryItems;
  let item = mysteryItems.shift();

  if (!item) {
    throw new BadRequest(i18n.t('mysteryItemIsEmpty', req.language));
  }

  if (mysteryItems.length === 0) markNotificationAsRead(user);

  item = cloneDeep(content.gear.flat[item]);
  user.items.gear.owned[item.key] = true;

  if (user.markModified) {
    user.markModified('purchased.plan.mysteryItems');
    user.markModified('items.gear.owned');
  }

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
