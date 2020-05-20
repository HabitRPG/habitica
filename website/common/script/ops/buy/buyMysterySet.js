import get from 'lodash/get';
import each from 'lodash/each';
import i18n from '../../i18n';
import content from '../../content/index';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../libs/errors';
import errorMessage from '../../libs/errorMessage';

export default function buyMysterySet (user, req = {}, analytics) {
  const key = get(req, 'params.key');
  if (!key) throw new BadRequest(errorMessage('missingKeyParam'));

  if (!(user.purchased.plan.consecutive.trinkets > 0)) {
    throw new NotAuthorized(i18n.t('notEnoughHourglasses', req.language));
  }

  const ref = content.timeTravelerStore(user);
  const mysterySet = ref ? ref[key] : undefined;

  if (!mysterySet) {
    throw new NotFound(i18n.t('mysterySetNotFound', req.language));
  }

  each(mysterySet.items, item => {
    user.items.gear.owned[item.key] = true;
  });

  if (analytics) {
    analytics.track('acquire item', {
      uuid: user._id,
      itemKey: mysterySet.key,
      itemType: 'Subscriber Gear',
      acquireMethod: 'Hourglass',
      category: 'behavior',
      headers: req.headers,
    });
  }

  // Here we need to trigger vue reactivity through reassign object
  user.items.gear.owned = {
    ...user.items.gear.owned,
  };

  if (user.markModified) user.markModified('items.gear.owned');

  user.purchased.plan.consecutive.trinkets -= 1;

  return [
    { items: user.items, purchasedPlanConsecutive: user.purchased.plan.consecutive },
    i18n.t('hourglassPurchaseSet', req.language),
  ];
}
