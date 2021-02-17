import each from 'lodash/each';
import sortBy from 'lodash/sortBy';
import lodashFind from 'lodash/find';
import reduce from 'lodash/reduce';
import content from '../content/index';
import getItemInfo from '../libs/getItemInfo';
import { BadRequest } from '../libs/errors';
import i18n from '../i18n';
import getItemByPathAndType from '../libs/getItemByPathAndType';
import getOfficialPinnedItems from '../libs/getOfficialPinnedItems';

const sortOrder = reduce(content.gearTypes, (accumulator, val, key) => {
  accumulator[val] = key;
  return accumulator;
}, {});

/**
 * Returns the index if found
 * @param Array array
 * @param String path
 */
function pathExistsInArray (array, path) {
  return array.findIndex(item => item.path === path);
}

function checkForNullEntries (array) {
  return array.filter(e => Boolean(e));
}

export function checkPinnedAreasForNullEntries (user) {
  user.pinnedItems = checkForNullEntries(user.pinnedItems);
  user.unpinnedItems = checkForNullEntries(user.unpinnedItems);
}

export function selectGearToPin (user) {
  const changes = [];

  each(content.gearTypes, type => {
    const found = lodashFind(
      content.gear.tree[type][user.stats.class],
      item => !user.items.gear.owned[item.key],
    );

    if (found) changes.push(found);
  });

  return sortBy(changes, change => sortOrder[change.type]);
}

export function addPinnedGear (user, type, path) {
  const foundIndex = pathExistsInArray(user.pinnedItems, path);

  if (foundIndex === -1 && type && path) {
    user.pinnedItems.push({
      type,
      path,
    });
  }
}

export function addPinnedGearByClass (user) {
  const newPinnedItems = selectGearToPin(user);

  for (const item of newPinnedItems) {
    const itemInfo = getItemInfo(user, 'marketGear', item);
    addPinnedGear(user, itemInfo.pinType, itemInfo.path);
  }
}

export function removeItemByPath (user, path) {
  const foundIndex = pathExistsInArray(user.pinnedItems, path);

  if (foundIndex >= 0) {
    user.pinnedItems.splice(foundIndex, 1);
    return true;
  }

  return false;
}

export function removePinnedGearByClass (user) {
  const currentPinnedItems = selectGearToPin(user);

  for (const item of currentPinnedItems) {
    const itemInfo = getItemInfo(user, 'marketGear', item);
    removeItemByPath(user, itemInfo.path);
  }
}

export function removePinnedGearAddPossibleNewOnes (user, itemPath, newItemKey) {
  removeItemByPath(user, itemPath);

  // an item of the users current "new" gear was bought
  // remove the old pinned gear items and add the new gear back
  removePinnedGearByClass(user);

  user.items.gear.owned = {
    ...user.items.gear.owned,
    [newItemKey]: true,
  };
  if (user.markModified) user.markModified('items.gear.owned');

  addPinnedGearByClass(user);

  // update the version, so that vue can refresh the seasonal shop
  user._v += 1;
}

/**
 * removes all pinned gear that the user already owns
 *(like class starter gear which has been pinned before)
 * @param user
 */
export function removePinnedItemsByOwnedGear (user) {
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
export function togglePinnedItem (user, { item, type, path }, req = {}) {
  let arrayToChange;
  const officialPinnedItems = getOfficialPinnedItems(user);

  if (!path) {
    // If path isn't passed it means an item was passed
    path = getItemInfo(user, type, item, officialPinnedItems, req.language).path; // eslint-disable-line no-param-reassign, max-len
  } else {
    item = getItemByPathAndType(type, path); // eslint-disable-line no-param-reassign

    if (!item && PATHS_WITHOUT_ITEM.indexOf(path) === -1) {
      // path not exists in our content structure

      throw new BadRequest(i18n.t('wrongItemPath', { path }, req.language));
    }

    // check if item exists & valid to be pinned
    getItemInfo(user, type, item, officialPinnedItems, req.language);
  }

  if (path === 'armoire' || path === 'potion' || type === 'debuffPotion') {
    // @TODO: take into considertation debuffPotion type in message
    throw new BadRequest(i18n.t('cannotUnpinItem', req.language));
  }

  const isOfficialPinned = pathExistsInArray(officialPinnedItems, path) !== -1;

  if (isOfficialPinned) {
    arrayToChange = user.unpinnedItems;
  } else {
    arrayToChange = user.pinnedItems;
  }

  if (isOfficialPinned) {
    // if an official item is also present in the user.pinnedItems array
    const itemInUserItems = pathExistsInArray(user.pinnedItems, path);

    if (itemInUserItems !== -1) {
      removeItemByPath(user, path);
    }
  }

  const foundIndex = pathExistsInArray(arrayToChange, path);

  if (foundIndex >= 0) {
    arrayToChange.splice(foundIndex, 1);
    return isOfficialPinned;
  }
  arrayToChange.push({ path, type });
  return !isOfficialPinned;
}

export { default as isPinned } from '../libs/isPinned';
