import get from 'lodash/get';
import setWith from 'lodash/setWith';
import i18n from '../i18n';
import { NotAuthorized, BadRequest } from '../libs/errors';

import { removeItemByPath } from './pinnedGearUtils';
import getItemInfo from '../libs/getItemInfo';
import content from '../content/index';

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
 * Return the type of the set (gear or one of the appareance sets - see content.appearance).
 */
function getSetType (firstPath) {
  if (firstPath.includes('gear.')) return 'gear';

  const type = firstPath.split('.')[0];
  if (content.appearance[type]) return type;

  return invalidSet();
}

/**
 * Return the set of items to unlock.
 */
function getSet (setType, firstPath) {
  const itemKey = splitPathItem(firstPath);
  const item = setType === 'gear'
    ? content.gear.flat[itemKey]
    : content.appearance[setType][itemKey];

  if (!item) return invalidSet();


  if (setType === 'gear') {
    // Only animal gear sets are unlockable
    if (item.gearSet !== 'animal') return invalidSet();

  } else {
    return item.set
  }
}

//Add comment
function determineCost (setType, isFullSet, set) {
  if (isBackground) {
    return isFullSet ? 3.75 : 1.75;
  }
  return isFullSet ? 1.25 : 0.5;
}

//Add comment
function alreadyUnlocked (user, path) {
  return isGear(path)
    ? get(user, path) !== undefined
    : get(user, `purchased.${path}`);
}

//Add comment
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

//Add comment
function purchaseItem (path, user) {
  if (isGear(path)) {
    setAsObject(user, path, true);
    const itemName = splitPathItem(path)[1];
    removeItemByPath(user, `gear.flat.${itemName}`);
    if (path.includes('gear.owned')) markModified(user, 'items.gear.owned');
  } else {
    setAsObject(user, `purchased.${path}`, true);
    markModified(user, 'purchased');
  }
}

//Add comment
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
  // We take the first path and use it to get the set,
  // The passed paths are not used anymore after this point
  const firstPath = setPaths[0];
  const setType = getSetType(firstPath);
  const set = getSet(setType, firstPath);
  const cost = determineCost(setType, isFullSet, set);

  let unlockedAlready;

  if (isFullSet) {
    const alreadyUnlockedItems = setPaths.filter(p => alreadyUnlocked(user, p)).length;
    const totalItems = setPaths.length;
    if (alreadyUnlockedItems === totalItems) {
      throw new NotAuthorized(i18n.t('alreadyUnlocked', req.language));
    // TODO Different pull request
    // } else if ((totalItems - alreadyOwnedItems) < 3) {
    //   throw new NotAuthorized(i18n.t('alreadyUnlockedPart', req.language));
    }
  } else {
    unlockedAlready = alreadyUnlocked(user, path);
  }

  if (isBackground && !unlockedAlready
      && incentiveBackgrounds.some(background => path.includes(`.${background}`))) {
    throw new BadRequest(i18n.t('incentiveBackgroundsUnlockedWithCheckins'));
  }

  if ((!user.balance || user.balance < cost) && !unlockedAlready) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  if (isFullSet) {
    setPaths.forEach(pathPart => purchaseItem(pathPart, user));
  } else {
    const [key, value] = splitPathItem(path);

    if (unlockedAlready) {
      const unsetBackground = isBackground && value === user.preferences.background;
      setAsObject(user, `preferences.${key}`, unsetBackground ? '' : value);
    } else {
      purchaseItem(path, user);

      // @TODO: Test and check test coverage
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
