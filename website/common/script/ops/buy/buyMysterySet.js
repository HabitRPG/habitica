import i18n from '../../i18n';
import content from '../../content/index';
import get from 'lodash/get';
import each from 'lodash/each';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../libs/errors';
import errorMessage from '../../libs/errorMessage';

module.exports = function buyMysterySet (user, req = {}, analytics) {
  let key = get(req, 'params.key');
  if (!key) throw new BadRequest(errorMessage('missingKeyParam'));

  if (!(user.purchased.plan.consecutive.trinkets > 0)) {
    throw new NotAuthorized(i18n.t('notEnoughHourglasses', req.language));
  }

  let ref = content.timeTravelerStore(user);
  let mysterySet = ref ? ref[key] : undefined;

  if (!mysterySet) {
    throw new NotFound(i18n.t('mysterySetNotFound', req.language));
  }

  each(mysterySet.items, item => {
    user.items.gear.owned[item.key] = true;
    if (analytics) {
      analytics.track('acquire item', {
        uuid: user._id,
        itemKey: item.key,
        itemType: 'Subscriber Gear',
        acquireMethod: 'Hourglass',
        category: 'behavior',
        headers: req.headers,
      });
    }
  });

  if (user.markModified) user.markModified('items.gear.owned');

  user.purchased.plan.consecutive.trinkets--;

  return [
    { items: user.items, purchasedPlanConsecutive: user.purchased.plan.consecutive },
    i18n.t('hourglassPurchaseSet', req.language),
  ];
};
