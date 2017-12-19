import content from '../content/index';
import getItemInfo from '../libs/getItemInfo';
import { BadRequest } from '../libs/errors';
import i18n from '../i18n';
import isPinned from '../libs/isPinned';
import getItemByPathAndType from '../libs/getItemByPathAndType';
import getOfficialPinnedItems from '../libs/getOfficialPinnedItems';

import each from 'lodash/each';
import sortBy from 'lodash/sortBy';
import lodashFind from 'lodash/find';
import reduce from 'lodash/reduce';

let sortOrder = reduce(content.gearTypes, (accumulator, val, key) => {
  accumulator[val] = key;
  return accumulator;
}, {});

/**
 * Returns the index if found
 * @param Array array
 * @param String path
 */
function pathExistsInArray (array, path) {
  return array.findIndex(item => {
    return item.path === path;
  });
}

function selectGearToPin (user) {
  let changes = [];

  each(content.gearTypes, (type) => {
    let found = lodashFind(content.gear.tree[type][user.stats.class], (item) => {
      return !user.items.gear.owned[item.key];
    });

    if (found) changes.push(found);
  });

  return sortBy(changes, (change) => sortOrder[change.type]);
}


function addPinnedGear (user, type, path) {
  const foundIndex = pathExistsInArray(user.pinnedItems, path);

  if (foundIndex === -1) {
    user.pinnedItems.push({
      type,
      path,
    });
  }
}

function addPinnedGearByClass (user) {
  let newPinnedItems = selectGearToPin(user);

  for (let item of newPinnedItems) {
    let itemInfo = getItemInfo(user, 'marketGear', item);

    addPinnedGear(user, itemInfo.pinType, itemInfo.path);
  }
}

function removeItemByPath (user, path) {
  const foundIndex = pathExistsInArray(user.pinnedItems, path);

  if (foundIndex >= 0) {
    user.pinnedItems.splice(foundIndex, 1);
    return true;
  }

  return false;
}

function removePinnedGearByClass (user) {
  let currentPinnedItems = selectGearToPin(user);

  for (let item of currentPinnedItems) {
    let itemInfo = getItemInfo(user, 'marketGear', item);

    removeItemByPath(user, itemInfo.path);
  }
}

function removePinnedGearAddPossibleNewOnes (user, itemPath, newItemKey) {
  let currentPinnedItems = selectGearToPin(user);
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
 * removes all pinned gear that the user already owns (like class starter gear which has been pinned before)
 * @param user
 */
function removePinnedItemsByOwnedGear (user) {
  each(user.items.gear.owned, (bool, key) => {
    if (bool) {
      removeItemByPath(user, `gear.flat.${key}`);
    }
  });
}

const PATHS_WITHOUT_ITEM = ['special.gems', 'special.rebirth_orb', 'special.fortify'];

/**
 * @returns {boolean} TRUE added the item / FALSE removed it
 */
function togglePinnedItem (user, {item, type, path}, req = {}) {
  let arrayToChange;
  let officialPinnedItems = getOfficialPinnedItems(user);

  if (!path) {
    // If path isn't passed it means an item was passed
    path = getItemInfo(user, type, item, officialPinnedItems, req.language).path;
  } else {
    item = getItemByPathAndType(type, path);

    if (!item && PATHS_WITHOUT_ITEM.indexOf(path) === -1) {
      // path not exists in our content structure

      throw new BadRequest(i18n.t('wrongItemPath', {path}, req.language));
    }

    // check if item exists & valid to be pinned
    getItemInfo(user, type, item, officialPinnedItems, req.language);
  }


  if (path === 'armoire' || path === 'potion') {
    throw new BadRequest(i18n.t('cannotUnpinArmoirPotion', req.language));
  }

  const isOfficialPinned = pathExistsInArray(officialPinnedItems, path) !== -1;

  if (isOfficialPinned) {
    arrayToChange = user.unpinnedItems;
  } else {
    arrayToChange = user.pinnedItems;
  }

  if (isOfficialPinned) {
    // if an offical item is also present in the user.pinnedItems array
    const itemInUserItems = pathExistsInArray(user.pinnedItems, path);

    if (itemInUserItems !== -1) {
      removeItemByPath(user, path);
    }
  }

  const foundIndex = pathExistsInArray(arrayToChange, path);

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
  addPinnedGear,
  removePinnedGearByClass,
  removePinnedGearAddPossibleNewOnes,
  removePinnedItemsByOwnedGear,
  togglePinnedItem,
  removeItemByPath,
  selectGearToPin,
  isPinned,
};
