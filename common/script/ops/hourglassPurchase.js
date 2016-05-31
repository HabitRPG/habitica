import content from '../content/index';
import i18n from '../i18n';
import _ from 'lodash';
import {
  BadRequest,
  NotAuthorized,
} from '../libs/errors';
import splitWhitespace from '../libs/splitWhitespace';

module.exports = function purchaseHourglass (user, req = {}, analytics) {
  let key = _.get(req, 'params.key');
  if (!key) throw new BadRequest(i18n.t('missingKeyParam', req.language));

  let type = _.get(req, 'params.type');
  if (!type) throw new BadRequest(i18n.t('missingTypeParam', req.language));

  if (!content.timeTravelStable[type]) {
    throw new NotAuthorized(i18n.t('typeNotAllowedHourglass', {allowedTypes: _.keys(content.timeTravelStable).toString()}, req.language));
  }

  if (!_.contains(_.keys(content.timeTravelStable[type]), key)) {
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
  }

  if (type === 'mounts') {
    user.items.mounts[key] = true;
  }

  if (analytics) {
    analytics.track('acquire item', {
      uuid: user._id,
      itemKey: key,
      itemType: type,
      acquireMethod: 'Hourglass',
      category: 'behavior',
    });
  }

  if (req.v2 === true) {
    return _.pick(user, splitWhitespace('items purchased.plan.consecutive'));
  } else {
    return [
      { items: user.items, purchasedPlanConsecutive: user.purchased.plan.consecutive },
      i18n.t('hourglassPurchase', req.language),
    ];
  }
};
