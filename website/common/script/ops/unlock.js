import get from 'lodash/get';
import setWith from 'lodash/setWith';
import i18n from '../i18n';
import { NotAuthorized, BadRequest } from '../libs/errors';

import { removeItemByPath } from './pinnedGearUtils';
import getItemInfo from '../libs/getItemInfo';
import content from '../content/index';
import updateUserBalance from './updateUserBalance';

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
function invalidSet (req) {
  throw new BadRequest(i18n.t('invalidUnlockSet', req.language));
}

/**
 * Return an item given its path and the type of set
 */
function getItemByPath (path, setType) {
  const [itemPathParent, itemKey] = splitPathItem(path);

  if (setType === 'gear') return content.gear.flat[itemKey];
  if (setType === 'hair') {
    // itemPathParent is in this format: hair.purple
    const hairType = itemPathParent.split('.')[1];
    return content.appearances.hair[hairType][itemKey];
  }

  return content.appearances[setType][itemKey];
}

/**
 * Return the type of the set (gear or one of the appareance sets - see content.appearances).
 */
function getSetType (firstPath, req) {
  if (firstPath.includes('gear.')) return 'gear';

  const type = firstPath.split('.')[0];
  if (content.appearances[type]) return type;

  return invalidSet(req);
}

/**
 * Return the items and paths for a set given the set,
 * a list of items of the type and a prefix for the path.
*/
function getItemsAndPathsForSet (set, itemsCollection, pathPrefix) {
  const items = [];
  const paths = [];

  Object.keys(itemsCollection).forEach(possibleItemKey => {
    const possibleItem = itemsCollection[possibleItemKey];
    if (possibleItem && possibleItem.set && possibleItem.set.key === set.key) {
      items.push(possibleItem);
      paths.push(`${pathPrefix}.${possibleItem.key}`);
    }
  });

  return { items, paths };
}

/**
 * Return the set of items to unlock given the path of the first item in the set.
 */
function getSet (setType, firstPath, req) {
  const item = getItemByPath(firstPath, setType);
  if (!item) return invalidSet(req);

  if (setType === 'gear') {
    // Only animal gear sets are unlockable
    if (item.gearSet !== 'animal') return invalidSet(req);

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

  const { set } = item;
  if (!set || set.setPrice === 0) return invalidSet(req);

  // The facialHair set is split between hair.mustache and hair.beards
  if (setType === 'hair' && set.key === 'facialHair') {
    const items = [];
    const paths = [];

    const { mustache } = content.appearances.hair;
    const mustachePrefix = 'hair.mustache';

    const {
      items: mustacheItems,
      paths: mustachePaths,
    } = getItemsAndPathsForSet(set, mustache, mustachePrefix);

    const { beard } = content.appearances.hair;
    const beardPrefix = 'hair.beard';

    const {
      items: beardItems,
      paths: beardPaths,
    } = getItemsAndPathsForSet(set, beard, beardPrefix);

    items.push(...beardItems, ...mustacheItems);
    paths.push(...beardPaths, ...mustachePaths);

    return { items, paths, set };
  }

  let pathPrefix = setType;
  let itemsCollection = content.appearances[setType];

  if (setType === 'hair') { // hair sets are nested like hair.color.item
    const nestedSet = firstPath.split('.')[1];

    itemsCollection = itemsCollection[nestedSet];
    pathPrefix = `${pathPrefix}.${nestedSet}`;
  }

  const { items, paths } = getItemsAndPathsForSet(set, itemsCollection, pathPrefix);

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

/**
 * Purchase an item from a set for a given user
 */
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

/**
 * Return the price of a single item in a set
 */
function getIndividualItemPrice (setType, item, req) {
  if (setType === 'gear') return 0.5;

  if (!item.price || item.price === 0) return invalidSet(req);
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
export default async function unlock (user, req = {}, analytics) {
  const path = get(req.query, 'path');

  if (!path) {
    throw new BadRequest(i18n.t('pathRequired', req.language));
  }

  const setPaths = path.split(',');
  const isFullSet = setPaths.length > 1;
  const firstPath = setPaths[0];

  const setType = getSetType(firstPath, req);
  const isBackground = setType === 'background';

  // We take the first path and use it to get the set,
  // The passed paths are not used anymore after this point for full sets
  const { set, items, paths } = getSet(setType, firstPath, req);

  let cost;
  let unlockedAlready = false;

  if (isFullSet) {
    // Make sure the paths as parameters match the ones from the set
    if (setPaths.length !== paths.length) return invalidSet(req);
    if (!setPaths.every(setPath => paths.includes(setPath))) return invalidSet(req);

    cost = set.setPrice / 4;

    // all items in a set have the same price
    const individualPrice = getIndividualItemPrice(setType, items[0], req);

    const alreadyUnlockedItems = paths
      .filter(itemPath => alreadyUnlocked(user, setType, itemPath)).length;
    const totalItems = items.length;

    if (alreadyUnlockedItems === totalItems) {
      throw new NotAuthorized(i18n.t('alreadyUnlocked', req.language));
    } else if ((totalItems - alreadyUnlockedItems) * individualPrice < cost) {
      throw new NotAuthorized(i18n.t('alreadyUnlockedPart', req.language));
    }
  } else {
    const item = getItemByPath(firstPath, setType);
    if (!item || !items.includes(item) || !paths.includes(firstPath)) {
      return invalidSet(req);
    }

    unlockedAlready = alreadyUnlocked(user, setType, firstPath);
    if (!unlockedAlready) {
      cost = getIndividualItemPrice(setType, item, req);
    }

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

    if (isBackground) {
      paths.forEach(pathPart => {
        const [key, value] = splitPathItem(pathPart);
        const backgroundContent = content.backgroundsFlat[value];
        const itemInfo = getItemInfo(user, key, backgroundContent);
        removeItemByPath(user, itemInfo.path);
      });
    }
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
    await updateUserBalance(user, -cost, 'spend', path);

    if (analytics) {
      analytics.track('buy', {
        uuid: user._id,
        itemKey: path,
        itemType: 'customization',
        currency: 'Gems',
        gemCost: cost / 0.25,
        category: 'behavior',
        headers: req.headers,
      });
    }
  }

  return buildResponse(user, unlockedAlready, req.language);
}
