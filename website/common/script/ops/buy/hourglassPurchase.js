import get from 'lodash/get';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import i18n from '../../i18n';
import content from '../../content/index';
import {
  BadRequest,
  NotAuthorized,
} from '../../libs/errors';
import errorMessage from '../../libs/errorMessage';
import getItemInfo from '../../libs/getItemInfo';
import { removeItemByPath } from '../pinnedGearUtils';

export default function purchaseHourglass (user, req = {}, analytics, quantity = 1) {
  const key = get(req, 'params.key');
  if (!key) throw new BadRequest(errorMessage('missingKeyParam'));

  const type = get(req, 'params.type');
  if (!type) throw new BadRequest(errorMessage('missingTypeParam'));

  if (type === 'backgrounds') {
    if (!content.backgroundsFlat[key] || content.backgroundsFlat[key].currency !== 'hourglasses') {
      throw new NotAuthorized(i18n.t('notAllowedHourglass', req.language));
    }
    if (user.purchased.background[key]) {
      throw new NotAuthorized(i18n.t('backgroundAlreadyOwned', req.language));
    }
    if (user.purchased.plan.consecutive.trinkets <= 0) {
      throw new NotAuthorized(i18n.t('notEnoughHourglasses', req.language));
    }

    user.purchased.background[key] = true;
    user.purchased.plan.consecutive.trinkets -= 1;
    const itemInfo = getItemInfo(user, 'background', content.backgroundsFlat[key]);
    removeItemByPath(user, itemInfo.path);

    if (user.markModified) user.markModified('purchased.background');
  } else if (type === 'quests') {
    if (!content.quests[key] || content.quests[key].category !== 'timeTravelers') throw new NotAuthorized(i18n.t('notAllowedHourglass', req.language));
    if (user.purchased.plan.consecutive.trinkets < quantity) {
      throw new NotAuthorized(i18n.t('notEnoughHourglasses', req.language));
    }

    if (!user.items.quests[key] || user.items.quests[key] < 0) user.items.quests[key] = 0;
    user.items.quests[key] += quantity;
    user.purchased.plan.consecutive.trinkets -= quantity;

    if (user.markModified) user.markModified('items.quests');
  } else {
    if (!content.timeTravelStable[type]) {
      throw new NotAuthorized(i18n.t('typeNotAllowedHourglass', { allowedTypes: keys(content.timeTravelStable).toString() }, req.language));
    }

    if (!includes(keys(content.timeTravelStable[type]), key)) {
      throw new NotAuthorized(i18n.t('notAllowedHourglass', req.language));
    }

    if (user.items[type][key]) {
      throw new NotAuthorized(i18n.t(`${type}AlreadyOwned`, req.language));
    }

    if (user.purchased.plan.consecutive.trinkets <= 0) {
      throw new NotAuthorized(i18n.t('notEnoughHourglasses', req.language));
    }

    user.purchased.plan.consecutive.trinkets -= 1;

    if (type === 'pets') {
      user.items.pets = {
        ...user.items.pets,
        [key]: 5,
      };
      if (user.markModified) user.markModified('items.pets');
    }

    if (type === 'mounts') {
      user.items.mounts = {
        ...user.items.mounts,
        [key]: true,
      };
      if (user.markModified) user.markModified('items.mounts');
    }
  }

  if (analytics) {
    analytics.track('acquire item', {
      uuid: user._id,
      itemKey: key,
      itemType: type,
      acquireMethod: 'Hourglass',
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [
    { items: user.items, purchasedPlanConsecutive: user.purchased.plan.consecutive },
    i18n.t('hourglassPurchase', req.language),
  ];
}
