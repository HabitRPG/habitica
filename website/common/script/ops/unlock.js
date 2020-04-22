import {
  get, each, pick, filter,
} from 'lodash';
import setWith from 'lodash/setWith';
import i18n from '../i18n';
import {
  NotAuthorized,
  BadRequest,
} from '../libs/errors';

import { removeItemByPath } from './pinnedGearUtils';
import getItemInfo from '../libs/getItemInfo';
import content from '../content/index';

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

// If item is already purchased -> equip it
// Otherwise unlock it
export default function unlock (user, req = {}, analytics) {
  const path = get(req.query, 'path');

  if (!path) {
    throw new BadRequest(i18n.t('pathRequired', req.language));
  }

  const isFullSet = path.includes(',');
  const isBackground = path.includes('background.');

  let cost;
  if (isBackground && isFullSet) {
    cost = 3.75;
  } else if (isBackground) {
    cost = 1.75;
  } else if (isFullSet) {
    cost = 1.25;
  } else {
    cost = 0.5;
  }

  const setPaths = path.split(',');
  let alreadyOwns;

  if (isFullSet) {
    const alreadyOwnedItems = filter(setPaths, p => get(user, `purchased.${p}`)).length;
    if (alreadyOwnedItems === setPaths.length) {
      throw new NotAuthorized(i18n.t('alreadyUnlocked', req.language));
    // TODO write math formula to check if buying
    // the full set is cheaper than the items individually
    // (item cost * number of remaining items) < setCost`
    } /* else if (alreadyOwnedItems > 0) {
      throw new NotAuthorized(i18n.t('alreadyUnlockedPart', req.language));
    } */
  } else {
    alreadyOwns = get(user, `purchased.${path}`) === true;
  }

  if (isBackground && !alreadyOwns && (path.indexOf('.blue') !== -1 || path.indexOf('.green') !== -1 || path.indexOf('.red') !== -1 || path.indexOf('.purple') !== -1 || path.indexOf('.yellow') !== -1)) {
    throw new BadRequest(i18n.t('incentiveBackgroundsUnlockedWithCheckins'));
  }

  if ((!user.balance || user.balance < cost) && !alreadyOwns) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  if (isFullSet) {
    each(setPaths, pathPart => {
      if (path.includes('gear.')) {
        setAsObject(user, pathPart, true);
        const itemName = pathPart.split('.').pop();
        removeItemByPath(user, `gear.flat.${itemName}`);
        if (path.includes('gear.owned')) user.markModified('items.gear.owned');
      }

      setAsObject(user, `purchased.${pathPart}`, true);
      user.markModified('purchased');
    });
  } else {
    const [key, value] = splitPathItem(path);

    if (alreadyOwns) {
      const unsetBackground = isBackground && value === user.preferences.background;
      setAsObject(user, `preferences.${key}`, unsetBackground ? '' : value);
    } else {
      if (path.includes('gear.')) {
        setAsObject(user, path, true);
        if (path.includes('gear.owned')) user.markModified('items.gear.owned');
      }
      setAsObject(user, `purchased.${path}`, true);

      // @TODO: Test and check test coverage
      if (isBackground) {
        const backgroundContent = content.backgroundsFlat[value];
        const itemInfo = getItemInfo(user, 'background', backgroundContent);
        removeItemByPath(user, itemInfo.path);
      }
    }
  }

  if (!alreadyOwns) {
    if (path.includes('gear.')) {
      user.markModified('purchased');
    }

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

  const response = [
    pick(user, ['purchased', 'preferences', 'items']),
  ];

  if (!alreadyOwns) response.push(i18n.t('unlocked', req.language));

  return response;
}
