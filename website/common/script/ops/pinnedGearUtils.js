import content from '../content/index';
import getItemInfo from '../libs/getItemInfo';
import get from 'lodash/get';
import { BadRequest } from '../libs/errors';
import i18n from '../i18n';

import isPinned from '../libs/isPinned';

const officialPinnedItems = content.officialPinnedItems;

import updateStore from '../libs/updateStore';

function addPinnedGearByClass (user) {
  if (user.flags.classSelected) {
    let newPinnedItems = updateStore(user);

    for (let item of newPinnedItems) {
      let itemInfo = getItemInfo(user, 'marketGear', item);

      const foundIndex = user.pinnedItems.findIndex(pinnedItem => {
        return pinnedItem.path === itemInfo.path;
      });

      if (foundIndex === -1) {
        user.pinnedItems.push({
          type: 'marketGear',
          path: itemInfo.path,
        });
      }
    }
  }
}

function removeItemByPath (user, path) {
  const foundIndex = user.pinnedItems.findIndex(pinnedItem => {
    return pinnedItem.path === path;
  });

  if (foundIndex >= 0) {
    user.pinnedItems.splice(foundIndex, 1);
    return true;
  }

  return false;
}

function removePinnedGearByClass (user) {
  if (user.flags.classSelected) {
    let currentPinnedItems = updateStore(user);

    for (let item of currentPinnedItems) {
      let itemInfo = getItemInfo(user, 'marketGear', item);

      removeItemByPath(user, itemInfo.path);
    }
  }
}

function removePinnedGearAddPossibleNewOnes (user, itemPath, newItemKey) {
  let currentPinnedItems = updateStore(user);
  let removeAndAddAllItems = false;

  for (let item of currentPinnedItems) {
    let itemInfo = getItemInfo(user, 'marketGear', item);

    if (itemInfo.path === itemPath) {
      removeAndAddAllItems = true;
      break;
    }
  }

  removeItemByPath(user, itemPath);

  if (removeAndAddAllItems) {
    // an item of the users current "new" gear was bought
    // remove the old pinned gear items and add the new gear back
    removePinnedGearByClass(user);
    user.items.gear.owned[newItemKey] = true;
    addPinnedGearByClass(user);
  } else {
    // just change the new gear to owned
    user.items.gear.owned[newItemKey] = true;
  }
}

/**
 * @returns {boolean} TRUE added the item / FALSE removed it
 */
function togglePinnedItem (user, {item, type, path}, req = {}) {
  let arrayToChange;

  if (!path) { // If path isn't passed it means an item was passed
    path = getItemInfo(user, type, item, req.language).path;
  }

  if (!item) item = get(content, path);

  if (path === 'armoire' || path === 'potion') {
    throw new BadRequest(i18n.t('cannotUnpinArmoirPotion', req.language));
  }

  let isOfficialPinned = officialPinnedItems.find(officialPinnedItem => {
    return officialPinnedItem.path === path;
  }) !== undefined;

  if (isOfficialPinned) {
    arrayToChange = user.unpinnedItems;
  } else {
    arrayToChange = user.pinnedItems;
  }

  const foundIndex = arrayToChange.findIndex(pinnedItem => {
    return pinnedItem.path === path;
  });

  if (foundIndex >= 0) {
    arrayToChange.splice(foundIndex, 1);
    return isOfficialPinned;
  } else {
    arrayToChange.push({path, type});
    return !isOfficialPinned;
  }
}

module.exports = {
  addPinnedGearByClass,
  removePinnedGearByClass,
  removePinnedGearAddPossibleNewOnes,
  togglePinnedItem,
  removeItemByPath,
  isPinned,
};
