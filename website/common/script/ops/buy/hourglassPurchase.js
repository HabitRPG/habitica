import content from '../../content/index';
import i18n from '../../i18n';
import get from 'lodash/get';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import {
  BadRequest,
  NotAuthorized,
} from '../../libs/errors';
import errorMessage from '../../libs/errorMessage';

module.exports = function purchaseHourglass (user, req = {}, analytics, quantity = 1) {
  let key = get(req, 'params.key');
  if (!key) throw new BadRequest(errorMessage('missingKeyParam'));

  let type = get(req, 'params.type');
  if (!type) throw new BadRequest(errorMessage('missingTypeParam'));

  if (type === 'quests') {
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
      throw new NotAuthorized(i18n.t('typeNotAllowedHourglass', {allowedTypes: keys(content.timeTravelStable).toString()}, req.language));
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

    user.purchased.plan.consecutive.trinkets--;

    if (type === 'pets') {
      user.items.pets[key] = 5;
      if (user.markModified) user.markModified('items.pets');
    }

    if (type === 'mounts') {
      user.items.mounts[key] = true;
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
};
