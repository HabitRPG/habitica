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
import updateUserHourglasses from '../updateUserHourglasses';
import { removeItemByPath } from '../pinnedGearUtils';
import getItemInfo from '../../libs/getItemInfo';

export default async function buyMysterySet (user, req = {}, analytics) {
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

  const itemInfo = getItemInfo(user, 'mystery_set', mysterySet);
  removeItemByPath(user, itemInfo.path);

  if (analytics) {
    analytics.track('buy', {
      uuid: user._id,
      itemKey: mysterySet.key,
      itemType: 'Subscriber Gear',
      currency: 'Hourglass',
      category: 'behavior',
      headers: req.headers,
    });
  }

  // Here we need to trigger vue reactivity through reassign object
  user.items.gear.owned = {
    ...user.items.gear.owned,
  };

  if (user.markModified) user.markModified('items.gear.owned');

  await updateUserHourglasses(user, -1, 'spend', mysterySet.text());

  return [
    { items: user.items, purchasedPlanConsecutive: user.purchased.plan.consecutive },
    i18n.t('hourglassPurchaseSet', req.language),
  ];
}
