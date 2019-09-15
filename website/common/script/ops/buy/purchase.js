import content from '../../content/index';
import i18n from '../../i18n';
import get from 'lodash/get';
import pick from 'lodash/pick';
import forEach from 'lodash/forEach';
import splitWhitespace from '../../libs/splitWhitespace';
import {
  NotFound,
  NotAuthorized,
  BadRequest,
} from '../../libs/errors';

import { removeItemByPath } from '../pinnedGearUtils';
import getItemInfo from '../../libs/getItemInfo';

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
    if (user.markModified) user.markModified('items.gear.owned');
  } else if (type === 'bundles') {
    let subType = item.type;
    forEach(item.bundleKeys, function addBundledItems (bundledKey) {
      if (!user.items[subType][bundledKey] || user.items[subType][key] < 0) {
        user.items[subType][bundledKey] = 0;
      }
      user.items[subType][bundledKey]++;
    });
    if (user.markModified) user.markModified(`items.${subType}`);
  } else {
    if (!user.items[type][key] || user.items[type][key] < 0) {
      user.items[type][key] = 0;
    }
    user.items[type][key]++;
    if (user.markModified) user.markModified(`items.${type}`);
  }
}

const acceptedTypes = ['eggs', 'hatchingPotions', 'food', 'gear', 'bundles'];
const singlePurchaseTypes = ['gear'];
module.exports = function purchase (user, req = {}, analytics) {
  let type = get(req.params, 'type');
  let key = get(req.params, 'key');

  let quantity = req.quantity ? Number(req.quantity) : 1;
  if (quantity < 1 || !Number.isInteger(quantity)) throw new BadRequest(i18n.t('invalidQuantity', req.language));

  if (!type) {
    throw new BadRequest(i18n.t('typeRequired', req.language));
  }

  if (!key) {
    throw new BadRequest(i18n.t('missingKeyParam', req.language));
  }

  if (!acceptedTypes.includes(type)) {
    throw new NotFound(i18n.t('notAccteptedType', req.language));
  }

  let {price, item} = getItemAndPrice(user, type, key, req);

  if (!item.canBuy(user)) {
    throw new NotAuthorized(i18n.t('messageNotAvailable', req.language));
  }

  if (!user.balance || user.balance < price * quantity) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  if (singlePurchaseTypes.includes(type)) {
    let itemInfo = getItemInfo(user, type, item);
    removeItemByPath(user, itemInfo.path);
  }

  for (let i = 0; i < quantity; i += 1) {
    purchaseItem(user, item, price, type, key);
  }

  if (analytics) {
    analytics.track('acquire item', {
      uuid: user._id,
      itemKey: key,
      itemType: type,
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
