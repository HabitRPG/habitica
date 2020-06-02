import get from 'lodash/get';
import setWith from 'lodash/setWith';
import i18n from '../i18n';
import { NotAuthorized, BadRequest } from '../libs/errors';

import { removeItemByPath } from './pinnedGearUtils';
import getItemInfo from '../libs/getItemInfo';
import content from '../content/index';

const incentiveBackgrounds = ['blue', 'green', 'red', 'purple', 'yellow'];

/**
 * Splits `items.gear.owned.headAccessory_wolfEars` into `items.gear.owned`
 * and `headAccessory_wolfEars`
 */
function splitPathItem (path) {
  return path.match(/(.+)\.([^.]+)/).splice(1);
}

/**
 * Throw an error when the provided set isn't valid.
 */
function invalidSet () {
  throw new BadRequest("invalid set string");
}

/**
 * Return an item given its path and the type of set
 */
function getItemByPath (path, setType) {
  console.log('getting item by path', path, setType);
  const itemKey = splitPathItem(path)[1];
  const item = setType === 'gear'
    ? content.gear.flat[itemKey]
    : content.appearances[setType][itemKey];

  return item;
}

/**
 * Return the type of the set (gear or one of the appareance sets - see content.appearances).
 */
function getSetType (firstPath) {
  if (firstPath.includes('gear.')) return 'gear';

  const type = firstPath.split('.')[0];
  if (content.appearances[type]) return type;

  return invalidSet();
}

/**
 * Return the set of items to unlock given the path of the first item in the set.
 */
function getSet (setType, firstPath) {
  console.log('getting set from type and firstpath', setType, firstPath);
  const item = getItemByPath(firstPath, setType);
  console.log('item', item);
  if (!item) return invalidSet();

  if (setType === 'gear') {
    // Only animal gear sets are unlockable
    if (item.gearSet !== 'animal') return invalidSet();

    // Since each type of gear has only one purchasable set (the animal set)
    // we get all items with the same type and gearSet === 'animal'
    const items = [];
    const paths = [];

    Object.keys(content.gear.tree[item.type][item.klass]).forEach(possibleItemKey => {
      const possibleItem = content.gear.tree[item.type][item.klass][possibleItemKey];
      if (possibleItem && possibleItem.gearSet === 'animal') {
        items.push(possibleItem);
        paths.push(`items.gear.owned.${possibleItem.key}`);
      }
    });

    return { items, paths, set: { setPrice: 5 } };
  }
  console.log('not a gear set');

  const { set } = item;
  if (!set || set.setPrice === 0) return invalidSet();

  const items = [];
  const paths = [];

  Object.keys(content.appearances[setType]).forEach(possibleItemKey => {
    const possibleItem = content.appearances[setType][possibleItemKey];
    if (possibleItem && possibleItem.set && possibleItem.set.key === set.key) {
      items.push(possibleItem);
      paths.push(`${setType}.${possibleItem.key}`);
    }
  });

  return { items, paths, set };
}

/**
 * checks if the user has already unlocked this item
 */
function alreadyUnlocked (user, setType, path) {
  const isGear = setType === 'gear';

  return isGear
    ? get(user, path) !== undefined
    : get(user, `purchased.${path}`);
}

function setAsObject (target, key, value) {
  // Using Object so path[1] won't create an array but an object {path: {1: value}}
  setWith(target, key, value, Object);
}

/**
 * `markModified` does not exist on frontend users
 */
function markModified (user, path) {
  if (user.markModified) user.markModified(path);
}

function purchaseItem (path, setType, user) {
  const isGear = setType === 'gear';

  if (isGear) {
    setAsObject(user, path, true);
    const itemName = splitPathItem(path)[1];
    removeItemByPath(user, `gear.flat.${itemName}`);
    if (path.includes('gear.owned')) markModified(user, 'items.gear.owned');
  } else {
    setAsObject(user, `purchased.${path}`, true);
    markModified(user, 'purchased');
  }
}

function getIndividualItemPrice (setType, item) {
  if (setType === 'gear') return 0.5;

  if (!item.price || item.price === 0) return invalidSet();
  return item.price / 4;
}

function buildResponse ({ purchased, preference, items }, ownsAlready, language) {
  const response = [
    { purchased, preference, items },
  ];
  if (!ownsAlready) response.push(i18n.t('unlocked', language));
  return response;
}

// If item is already purchased -> equip it
// Otherwise unlock it
// @TODO refactor and take as parameter the set name, for single items use the buy ops
export default function unlock (user, req = {}, analytics) {
  const path = get(req.query, 'path');

  if (!path) {
    throw new BadRequest(i18n.t('pathRequired', req.language));
  }

  const setPaths = path.split(',');
  const isFullSet = setPaths.length > 1;
  const firstPath = setPaths[0];

  const setType = getSetType(firstPath);
  const isBackground = setType === 'background';

  // We take the first path and use it to get the set,
  // The passed paths are not used anymore after this point for full sets
  const { set, items, paths } = getSet(setType, firstPath);

  let cost;
  let unlockedAlready = false;

  console.log('isFullSet', isFullSet, 'setType', setType);

  if (isFullSet) {
    console.log('fullset', {items}, {paths}, {set});
    cost = set.setPrice / 4;

    // all items in a set have the same price
    const individualPrice = getIndividualItemPrice(setType, items[0]);

    const alreadyUnlockedItems = paths
      .filter(itemPath => alreadyUnlocked(user, setType, itemPath)).length;
    const totalItems = items.length;
    console.log('totalItems', totalItems, 'alreadyUnlockedItems', alreadyUnlockedItems)
    if (alreadyUnlockedItems === totalItems) {
      throw new NotAuthorized(i18n.t('alreadyUnlocked', req.language));
    } else if ((totalItems - alreadyUnlockedItems) * individualPrice < cost) {
      throw new NotAuthorized(i18n.t('alreadyUnlockedPart', req.language));
    }
  } else {
    const item = getItemByPath(firstPath, setType);
    if (!item || !items.includes(item) || !paths.includes(firstPath)) {
      return invalidSet();
    }

    cost = getIndividualItemPrice(setType, item);

    unlockedAlready = alreadyUnlocked(user, setType, firstPath);

    // Since only an item is being unlocked here,
    // remove all the other items from the set
    items.splice(0, items.length);
    paths.splice(0, paths.length);

    // Only keep the item being unlocked
    items.push(item);
    paths.push(firstPath);
  }

  if (isBackground && !unlockedAlready
      && incentiveBackgrounds.some(background => path.includes(`.${background}`))) {
    throw new BadRequest(i18n.t('incentiveBackgroundsUnlockedWithCheckins'));
  }

  if ((!user.balance || user.balance < cost) && !unlockedAlready) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  if (isFullSet) {
    paths.forEach(pathPart => purchaseItem(pathPart, setType, user));
  } else {
    const [key, value] = splitPathItem(path);

    if (unlockedAlready) {
      const unsetBackground = isBackground && value === user.preferences.background;
      setAsObject(user, `preferences.${key}`, unsetBackground ? '' : value);
    } else {
      purchaseItem(paths[0], setType, user);

      if (isBackground) {
        const backgroundContent = content.backgroundsFlat[value];
        const itemInfo = getItemInfo(user, 'background', backgroundContent);
        removeItemByPath(user, itemInfo.path);
      }
    }
  }

  if (!unlockedAlready) {
    user.balance -= cost;

    if (analytics) {
      analytics.track('acquire item', {
        uuid: user._id,
        itemKey: path,
        itemType: 'customization',
        acquireMethod: 'Gems',
        gemCost: cost / 0.25,
        category: 'behavior',
        headers: req.headers,
      });
    }
  }

  return buildResponse(user, unlockedAlready, req.language);
}
