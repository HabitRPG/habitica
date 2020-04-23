import get from 'lodash/get';
import setWith from 'lodash/setWith';
import i18n from '../i18n';
import { NotAuthorized, BadRequest } from '../libs/errors';

import { removeItemByPath } from './pinnedGearUtils';
import getItemInfo from '../libs/getItemInfo';
import content from '../content/index';

const incentiveBackgrounds = ['blue', 'green', 'red', 'purple', 'yellow'];

function determineCost (isBackground, isFullSet) {
  if (isBackground) {
    return isFullSet ? 3.75 : 1.75;
  }
  return isFullSet ? 1.25 : 0.5;
}

function isGear (path) {
  return path.includes('gear.');
}

function alreadyOwns (user, path) {
  return get(user, isGear(path) ? path : `purchased.${path}`);
}

function setAsObject (target, key, value) {
  // Using Object so path[1] won't create an array but an object {path: {1: value}}
  setWith(target, key, value, Object);
}

/**
 * Splits `items.gear.owned.headAccessory_wolfEars` into `items.gear.owned`
 * and `headAccessory_wolfEars`
 */
function splitPathItem (path) {
  return path.match(/(.+)\.([^.]+)/).splice(1);
}

/**
 * `markModified` does not exist on frontend users
 */
function markModified (user, path) {
  if (user.markModified) user.markModified(path);
}

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

function buildResponse ({ purchased, preference, items }, ownsAlready, language) {
  const response = [
    { purchased, preference, items },
  ];
  if (!ownsAlready) response.push(i18n.t('unlocked', language));
  return response;
}

// If item is already purchased -> equip it
// Otherwise unlock it
export default function unlock (user, req = {}, analytics) {
  const path = get(req.query, 'path');

  if (!path) {
    throw new BadRequest(i18n.t('pathRequired', req.language));
  }

  const isFullSet = path.includes(',');
  const isBackground = path.includes('background.');
  const cost = determineCost(isBackground, isFullSet);

  const setPaths = path.split(',');
  let ownsAlready;

  if (isFullSet) {
    const alreadyOwnedItems = setPaths.filter(p => alreadyOwns(user, p)).length;
    const totalItems = setPaths.length;
    if (alreadyOwnedItems === totalItems) {
      throw new NotAuthorized(i18n.t('alreadyUnlocked', req.language));
    // TODO Different pull request
    // } else if ((totalItems - alreadyOwnedItems) < 3) {
    //   throw new NotAuthorized(i18n.t('alreadyUnlockedPart', req.language));
    }
  } else {
    ownsAlready = alreadyOwns(user, path);
  }

  if (isBackground && !ownsAlready
      && incentiveBackgrounds.some(background => path.includes(`.${background}`))) {
    throw new BadRequest(i18n.t('incentiveBackgroundsUnlockedWithCheckins'));
  }

  if ((!user.balance || user.balance < cost) && !ownsAlready) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  if (isFullSet) {
    setPaths.forEach(pathPart => purchaseItem(pathPart, user));
  } else {
    const [key, value] = splitPathItem(path);

    if (ownsAlready) {
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

  if (!ownsAlready) {
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

  return buildResponse(user, ownsAlready, req.language);
}
