import i18n from '../i18n';
import content from '../content/index';
import _ from 'lodash';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../libs/errors';

module.exports = function buyMysterySet (user, req = {}, analytics) {
  let key = _.get(req, 'params.key');
  if (!key) throw new BadRequest(i18n.t('missingKeyParam', req.language));

  if (!(user.purchased.plan.consecutive.trinkets > 0)) {
    throw new NotAuthorized(i18n.t('notEnoughHourglasses', req.language));
  }

  let ref = content.timeTravelerStore(user.items.gear.owned);
  let mysterySet = ref ? ref[key] : undefined;

  if (!mysterySet) {
    throw new NotFound(i18n.t('mysterySetNotFound', req.language));
  }

  if (typeof window !== 'undefined' && window.confirm) { // TODO move to client
    if (!window.confirm(i18n.t('hourglassBuyEquipSetConfirm'))) return;
  }

  _.each(mysterySet.items, item => {
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

  user.purchased.plan.consecutive.trinkets--;


  return [
    { items: user.items, purchasedPlanConsecutive: user.purchased.plan.consecutive },
    i18n.t('hourglassPurchaseSet', req.language),
  ];
};
