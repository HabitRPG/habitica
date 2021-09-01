import cloneDeep from 'lodash/cloneDeep';
import content from '../content/index';
import i18n from '../i18n';
import {
  BadRequest,
} from '../libs/errors';

function markNotificationAsRead (user) {
  const index = user.notifications.findIndex(notification => notification && notification.type === 'NEW_MYSTERY_ITEMS');

  if (index !== -1) user.notifications.splice(index, 1);
}

export default function openMysteryItem (user, req = {}) {
  const { mysteryItems } = user.purchased.plan;
  let item = mysteryItems.shift();

  if (!item) {
    throw new BadRequest(i18n.t('mysteryItemIsEmpty', req.language));
  }

  if (mysteryItems.length === 0) markNotificationAsRead(user);

  item = cloneDeep(content.gear.flat[item]);
  item.text = content.gear.flat[item.key].text(user.preferences.language);
  user.items.gear.owned = {
    ...user.items.gear.owned,
    [item.key]: true,
  };

  if (user.markModified) {
    user.markModified('purchased.plan.mysteryItems');
    user.markModified('items.gear.owned');
  }

  return [
    item,
    i18n.t('mysteryItemOpened', req.language),
  ];
}
