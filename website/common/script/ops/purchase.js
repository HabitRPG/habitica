import content from '../content/index';
import i18n from '../i18n';
import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';
import planGemLimits from '../libs/planGemLimits';
import {
  NotFound,
  NotAuthorized,
  BadRequest,
} from '../libs/errors';

module.exports = function purchase (user, req = {}, analytics) {
  let type = _.get(req.params, 'type');
  let key = _.get(req.params, 'key');
  let item;
  let price;

  if (!type) {
    throw new BadRequest(i18n.t('typeRequired', req.language));
  }

  if (!key) {
    throw new BadRequest(i18n.t('keyRequired', req.language));
  }

  if (type === 'gems' && key === 'gem') {
    let convRate = planGemLimits.convRate;
    let convCap = planGemLimits.convCap;
    convCap += user.purchased.plan.consecutive.gemCapExtra;

    if (!user.purchased || !user.purchased.plan || !user.purchased.plan.customerId) {
      throw new NotAuthorized(i18n.t('mustSubscribeToPurchaseGems', req.language));
    }

    if (user.stats.gp < convRate) {
      throw new NotAuthorized(i18n.t('messageNotEnoughGold', req.language));
    }

    if (user.purchased.plan.gemsBought >= convCap) {
      throw new NotAuthorized(i18n.t('reachedGoldToGemCap', {convCap}, req.language));
    }

    user.balance += 0.25;
    user.purchased.plan.gemsBought++;
    user.stats.gp -= convRate;

    if (analytics) {
      analytics.track('purchase gems', {
        uuid: user._id,
        itemKey: key,
        acquireMethod: 'Gold',
        goldCost: convRate,
        category: 'behavior',
        headers: req.headers,
      });
    }

    return [
      _.pick(user, splitWhitespace('stats balance')),
      i18n.t('plusOneGem'),
    ];
  }

  let acceptedTypes = ['eggs', 'hatchingPotions', 'food', 'quests', 'gear'];
  if (acceptedTypes.indexOf(type) === -1) {
    throw new NotFound(i18n.t('notAccteptedType', req.language));
  }

  if (type === 'gear') {
    item = content.gear.flat[key];

    if (!item) {
      throw new NotFound(i18n.t('contentKeyNotFound', {type}, req.language));
    }

    if (user.items.gear.owned[key]) {
      throw new NotAuthorized(i18n.t('alreadyHave', req.language));
    }

    price = (item.twoHanded || item.gearSet === 'animal' ? 2 : 1) / 4;
  } else {
    item = content[type][key];

    if (!item) {
      throw new NotFound(i18n.t('contentKeyNotFound', {type}, req.language));
    }

    price = item.value / 4;
  }

  if (!item.canBuy(user)) {
    throw new NotAuthorized(i18n.t('messageNotAvailable', req.language));
  }

  if (!user.balance || user.balance < price) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  user.balance -= price;

  if (type === 'gear') {
    user.items.gear.owned[key] = true;
  } else {
    if (!user.items[type][key] || user.items[type][key] < 0) {
      user.items[type][key] = 0;
    }
    user.items[type][key]++;
  }

  if (analytics) {
    analytics.track('acquire item', {
      uuid: user._id,
      itemKey: key,
      itemType: 'Market',
      acquireMethod: 'Gems',
      gemCost: item.value,
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [
    _.pick(user, splitWhitespace('items balance')),
  ];
};
