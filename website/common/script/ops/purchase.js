import content from '../content/index';
import i18n from '../i18n';
import get from 'lodash/get';
import pick from 'lodash/pick';
import forEach from 'lodash/forEach';
import splitWhitespace from '../libs/splitWhitespace';
import planGemLimits from '../libs/planGemLimits';
import {
  NotFound,
  NotAuthorized,
  BadRequest,
} from '../libs/errors';

import { removeItemByPath } from './pinnedGearUtils';
import getItemInfo from '../libs/getItemInfo';

function buyGems (user, analytics, req, key) {
  let convRate = planGemLimits.convRate;
  let convCap = planGemLimits.convCap;
  convCap += user.purchased.plan.consecutive.gemCapExtra;

  // Some groups limit their members ability to obtain gems
  // The check is async so it's done on the server (in server/controllers/api-v3/user#purchase)
  // only and not on the client,
  // resulting in a purchase that will seem successful until the request hit the server.
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
    pick(user, splitWhitespace('stats balance')),
    i18n.t('plusOneGem', req.language),
  ];
}

function getItemAndPrice (user, type, key, req) {
  let item;
  let price;

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

  return {item, price};
}

function purchaseItem (user, item, price, type, key) {
  user.balance -= price;

  if (type === 'gear') {
    user.items.gear.owned[key] = true;
  } else if (type === 'bundles') {
    let subType = item.type;
    forEach(item.bundleKeys, function addBundledItems (bundledKey) {
      if (!user.items[subType][bundledKey] || user.items[subType][key] < 0) {
        user.items[subType][bundledKey] = 0;
      }
      user.items[subType][bundledKey]++;
    });
  } else {
    if (!user.items[type][key] || user.items[type][key] < 0) {
      user.items[type][key] = 0;
    }
    user.items[type][key]++;
  }
}

module.exports = function purchase (user, req = {}, analytics) {
  let type = get(req.params, 'type');
  let key = get(req.params, 'key');
  let quantity = req.quantity || 1;

  if (!type) {
    throw new BadRequest(i18n.t('typeRequired', req.language));
  }

  if (!key) {
    throw new BadRequest(i18n.t('keyRequired', req.language));
  }

  if (type === 'gems' && key === 'gem') {
    let gemResponse;
    for (let i = 0; i < quantity; i += 1) {
      gemResponse = buyGems(user, analytics, req, key);
    }
    return gemResponse;
  }

  let acceptedTypes = ['eggs', 'hatchingPotions', 'food', 'quests', 'gear', 'bundles'];
  if (acceptedTypes.indexOf(type) === -1) {
    throw new NotFound(i18n.t('notAccteptedType', req.language));
  }

  let {price, item} = getItemAndPrice(user, type, key, req);

  if (!item.canBuy(user)) {
    throw new NotAuthorized(i18n.t('messageNotAvailable', req.language));
  }

  if (!user.balance || user.balance < price * quantity) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  let itemInfo = getItemInfo(user, type, item);
  removeItemByPath(user, itemInfo.path);

  for (let i = 0; i < quantity; i += 1) {
    purchaseItem(user, item, price, type, key);
  }

  if (analytics) {
    analytics.track('acquire item', {
      uuid: user._id,
      itemKey: key,
      itemType: 'Market',
      acquireMethod: 'Gems',
      gemCost: price * 4,
      quantityPurchased: quantity,
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [
    pick(user, splitWhitespace('items balance')),
  ];
};
